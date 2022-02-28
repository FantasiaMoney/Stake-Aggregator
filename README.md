# NOTE

```
This logic binded with UNI v2 dex 
```

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
Main contract

StakeFund.sol allow deposit and stake, claim rewards and restake, and unstake and withdraw by share
```

# Todo

```
Todo aggegator contract which will calculate which of StakeFund.sol pool use for get best profit for ETH input
```
