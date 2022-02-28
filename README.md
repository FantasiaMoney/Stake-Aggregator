# Start test

```
1) remove package-lock.json
2) npm i
3) run ganache (open this project in second terminal and run command: npm run ganache)
4) run command: truffle test
5) first tets will fail
6) update UNI router hash
7) run again
```


# NOTE if Router-Hash-test failed all tests will fail

```
To fix this
Make sure You updated PairHash in config.js and test/contracts/dex/libraries/UniswapV2Library.sol

```

# Description

```
VToken - not transfer able token (bind with msg.sender)


VTokenSale - user can buy vToken via ETH by token/eth rate


VTokenToToken - user can convert vToken to token with time based rate


TokenToVtoken - user can convert token to vToken with rate 1 to 1


Token - standard mintable and burnable token


Minter - allow mint for permitted addresses


LDManager - mint tokens and add LD with token/eth


WalletDistributor - owners of vtoken can claim from this wallet each 30 days


Reserve - fetch can split ETH with dex, sale and reserve. And users who deposiyed tokens
in reserve can sell (also they can earn more or lose, dependse on sale rate)

DepositsDB - record each deposit from fetch, then vToken converter use this data
```


# if Router-Hash-test failed
```
Make sure You updated PairHash in config.js and test/contracts/dex/libraries/UniswapV2Library.sol
```
