# Coinsy Ticker

Retrievable Information by Alexa commands:

- The current rate of a cryptocurrency in euros
- The current rate of a cryptocurrency in dollars
- The currency fluctuations of the last hour, the last day and the last week
- The respective market capitalization (in euro and dollars)
- All information with one command

## Installation

### Amazon AWS Lambda
- Create Amazon Lambda function with `Alexa Skills Kit` as trigger and `NodeJS 6.10` as Runtime.
- Keep Handler as `index.handler` and add a new role for `lambda_basic_execution` .

### Amazon Alexa Skill
- Create Alexa Skill in *Amazon Developer Console*.
- Copy content of `IntentSchemaGerman.json` into your Amazon Skill InteractionModel.
- Set Service Endpoint Type to `AWS Lambda ARN` and insert your lambda function's ARN.

For further guides and tutorials for setting up Lambda and the Alexa Skill visit the [Amazon Developer Alexa Blog](https://developer.amazon.com/de/blogs/post/txdjws16kupvko/new-alexa-skills-kit-template:-build-a-trivia-skill-in-under-an-hour).


### Currencies currently being supported: 
Bitcoin, Ethereum, Ripple, Bitcoin-Cash, NEM, Litecoin, IOTA, NEO, Dash, Ethereum-Classic, Qtum, Stratis, Monero, OmiseGo, BitConnect, Waves, TenX, EOS, BitShares, Zcash, Iconomi, Steem, Status, Veritaseum, Augur, Lisk, Siacoin, Stellar, Populous, Civic, Dogecoin, Byteball, Factom, MaidSafeCoin GameCredits, DigixDAO, DigiByte, Decred, Metal, ICO, Ardor, FunFair, Nxt, Bancor, Aragon, MobileGo, Metaverse, Ark, FirstBlood, Decent, Nexus, Stox, Asch, SysCoin, Elastic, Gas, Humaniq, Gridcoin.

The data is retrieved from the [CoinMarketCap JSON API](https://coinmarketcap.com/api/).
