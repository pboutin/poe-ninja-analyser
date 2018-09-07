# Poe-ninja analyser

The [poe-ninja](https://poe.ninja) website offers data [dumps](https://poe.ninja/data) for past leagues. I wanted to know which items to buy during the first days of a league to optimise the profit later on.
 
 
## Requirements 📦
- Node.js / npm

## Installation 🚀
- `npm install`

## How does it work ? 📖
`node analyse.js <LEAGUE> <FACTOR> <TYPE_WHITELIST>`

- `LEAGUE` _required_ : the league to analyse, must match a folder under `/data`
- `FACTOR` _required_ : minimum factor you want to see, don't be too greedy 😋
- `TYPE_WHITELIST` : comma-separated item types to consider. Defaults to _everything_

## Examples 🧐

`node analyse.js incursion 2`

Will look for items that will double during the league.


`node analyse.js incursion 5 UniqueAccessory,DivinationCard`

Will look for Unique accessories and Divination cards that will get 5 times more expensive during the league.


## Shoutout 🙌

To poe-ninja developers for their awesome work. It is nice to be able to fiddle with raw data like this.
