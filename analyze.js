// Requires
const fs = require('fs');
const parse = require('csv-parse/lib/sync');

// Utilities
const sum = values => values.reduce((currentSum, value) => currentSum + value, 0);

const mean = values => sum(values) / values.length;

const getPointValueAt = (itemPoints, index) => {
  const sample = [];

  if (itemPoints[index - 1]) sample.push(itemPoints[index - 1].Value);
  if (itemPoints[index]) sample.push(itemPoints[index].Value);
  if (itemPoints[index + 1]) sample.push(itemPoints[index + 1].Value);
  if (sample.length === 0) return 0;

  return mean(sample);
};

const consoleWarningTick = () => process.stdout.write('\x1b[33m.\x1b[0m'); // Yellow dot
const consoleSuccessTick = () => process.stdout.write('\x1b[32m.\x1b[0m'); // Green dot
const consoleDangerTick = () => process.stdout.write('\x1b[31mx\x1b[0m'); // Red x
const consoleLog = (message) => process.stdout.write(`${message}\n`);

// Params
let [LEAGUE, MIN_TARGET_RATIO, TYPE_WHITELIST] = process.argv.slice(2);

if (!LEAGUE || !MIN_TARGET_RATIO) {
  consoleLog("Missing args. Make sure to call the tool like this:");
  consoleLog("node analyse.js incursion 2")
  process.exit(1);
}
MIN_TARGET_RATIO = parseInt(MIN_TARGET_RATIO, 10);
TYPE_WHITELIST = (TYPE_WHITELIST || '').split(',');

const itemsCsvPath = `./data/${LEAGUE}/items.csv`;

if (!fs.existsSync(itemsCsvPath)) {
  consoleLog(`League data not found under "data/${LEAGUE}/".`);
  process.exit(1);
}

// CSV Parsing
consoleLog('Reading and parsing the CSV file...');
const records = parse(fs.readFileSync(itemsCsvPath).toString(), {
  columns: true,
  delimiter: ';',
  cast: true
});

// Computing
consoleLog('Computing...');
let currentItemPoints = [];
let results = [];

while (true) {
  const itemPoint = records.shift();

  if (currentItemPoints.length > 0 && (!itemPoint || currentItemPoints[0].Id !== itemPoint.Id)) {
    const {Name: currentName, Type: currentType} = currentItemPoints[0];

    if (TYPE_WHITELIST.length === 0 || TYPE_WHITELIST.includes(currentType)) {
      const startLeagueValue = mean(currentItemPoints.slice(2, 7).map(({Value}) => Value));

      const afterTwoWeekValue = getPointValueAt(currentItemPoints, 14);
      const afterTwoWeekRatio = afterTwoWeekValue / startLeagueValue;

      const afterOneMonthValue = getPointValueAt(currentItemPoints, 30);
      const afterOneMonthRatio = afterOneMonthValue / startLeagueValue;

      const afterTwoMonthValue = getPointValueAt(currentItemPoints, 60) / startLeagueValue;
      const afterTwoMonthRatio = afterTwoMonthValue / startLeagueValue;

      const preResultsLength = results.length;
      if (afterTwoWeekRatio > MIN_TARGET_RATIO) results.push({ratio: afterTwoWeekRatio, initialValue: startLeagueValue, value: afterTwoWeekValue, name: currentName, type: currentType, delayLabel: "two weeks"});
      if (afterOneMonthRatio > MIN_TARGET_RATIO) results.push({ratio: afterOneMonthRatio, initialValue: startLeagueValue, value: afterOneMonthValue, name: currentName, type: currentType, delayLabel: "one month"});
      if (afterTwoMonthRatio > MIN_TARGET_RATIO) results.push({ratio: afterTwoMonthRatio, initialValue: startLeagueValue, value: afterTwoMonthValue, name: currentName, type: currentType, delayLabel: "two months"});

      preResultsLength === results.length ? consoleWarningTick() : consoleSuccessTick();
    } else {
      consoleDangerTick();
    }

    if (!itemPoint) break;

    currentItemPoints = [];
  }

  currentItemPoints.push(itemPoint);
}
consoleLog(' done');

results = results.sort((resultA, resultB) => resultB.ratio - resultA.ratio);

// Output
results.forEach(({ratio, initialValue, value, name, type, delayLabel}) => {
  const roundedRatio = Math.round(ratio * 10) / 10;
  const roundedInitialValue = Math.round(initialValue * 10) / 10;
  const roundedValue = Math.round(value * 10) / 10;

  consoleLog(`${roundedRatio}x on "${name} (${type})", from ${roundedInitialValue} to ${roundedValue} chaos, after ${delayLabel}`);
});

consoleLog("Let's go ! 💥")
