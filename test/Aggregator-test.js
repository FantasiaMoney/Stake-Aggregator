import { BN, fromWei, toWei } from 'web3-utils'
import ether from './helpers/ether'
import EVMRevert from './helpers/EVMRevert'
import { duration } from './helpers/duration'
const BigNumber = BN
const timeMachine = require('ganache-time-traveler')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const ETH_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
import { PairHash } from '../config'

// real contracts
const UniswapV2Factory = artifacts.require('./UniswapV2Factory.sol')
const UniswapV2Router = artifacts.require('./UniswapV2Router02.sol')
const UniswapV2Pair = artifacts.require('./UniswapV2Pair.sol')
const WETH = artifacts.require('./WETH9.sol')
const TOKEN = artifacts.require('./TOKEN.sol')
const StakeClaim = artifacts.require('./StakingRewards.sol')
const Aggregator = artifacts.require('./StakeAggregator.sol')

const Beneficiary = "0x6ffFe11A5440fb275F30e0337Fc296f938a287a5"

let uniswapV2Factory,
    uniswapV2Router,
    weth,
    dai,
    usdt,
    pairDAI,
    pairUSDT,
    stakeDAI,
    stakeUSDT,
    aggregator


contract('Aggregator-claim-able-test', function([userOne, userTwo, userThree]) {

  async function deployContracts(){
    // deploy contracts
    uniswapV2Factory = await UniswapV2Factory.new(userOne)
    weth = await WETH.new()
    uniswapV2Router = await UniswapV2Router.new(uniswapV2Factory.address, weth.address)

    aggregator = await Aggregator.new(uniswapV2Router.address)

    dai = await TOKEN.new("DAI", "DAI", toWei(String(100000)))
    usdt = await TOKEN.new("USDT", "USDT", toWei(String(100000)))

    // add token liquidity for DAI
    await dai.approve(uniswapV2Router.address, toWei(String(500)))
    await uniswapV2Router.addLiquidityETH(
      dai.address,
      toWei(String(500)),
      1,
      1,
      userOne,
      "1111111111111111111111"
    , { from:userOne, value:toWei(String(500)) })

    // add token liquidity for USDT
    await usdt.approve(uniswapV2Router.address, toWei(String(500)))
    await uniswapV2Router.addLiquidityETH(
      usdt.address,
      toWei(String(500)),
      1,
      1,
      userOne,
      "1111111111111111111111"
    , { from:userOne, value:toWei(String(500)) })


    pairDAI = await UniswapV2Pair.at(await uniswapV2Factory.allPairs(0))
    pairUSDT = await UniswapV2Pair.at(await uniswapV2Factory.allPairs(1))

    // stake for dai
    stakeDAI = await StakeClaim.new(
      userOne,
      dai.address,
      pairDAI.address
    )

    // add some rewards to DAI stake
    dai.transfer(stakeDAI.address, toWei(String(1)))
    stakeDAI.notifyRewardAmount(toWei(String(1)))


    // stake for usdt
    stakeUSDT = await StakeClaim.new(
      userOne,
      usdt.address,
      pairUSDT.address
    )

    // add some rewards to usdt stake
    usdt.transfer(stakeUSDT.address, toWei(String(1)))
    stakeUSDT.notifyRewardAmount(toWei(String(1)))

    // add tokens
    await aggregator.addAsset(pairDAI.address, 2)
    await aggregator.addAsset(pairUSDT.address, 2)
  }

  beforeEach(async function() {
    await deployContracts()
  })

  describe('INIT stakes', function() {
    it('Correct init DAI stake', async function() {
      assert.equal(await stakeDAI.rewardsToken(), dai.address)
      assert.equal(await stakeDAI.stakingToken(), pairDAI.address)
    })

    it('Correct init USDT stake', async function() {
      assert.equal(await stakeUSDT.rewardsToken(), usdt.address)
      assert.equal(await stakeUSDT.stakingToken(), pairUSDT.address)
    })
  })


  describe('Aggregator', function() {
    it('Convert pools to ETH should works correct', async function() {
      console.log(
        Number(await aggregator.getValueInETH(pairDAI.address, toWei("1"))),
        Number(await aggregator.getValueInETH(pairUSDT.address, toWei("1")))
      )
    })
  })

  //END
})
