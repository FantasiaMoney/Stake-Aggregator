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
const TOKEN = artifacts.require('./DAI.sol')
const StakeClaim = artifacts.require('./StakingRewards.sol')


const Beneficiary = "0x6ffFe11A5440fb275F30e0337Fc296f938a287a5"

let uniswapV2Factory,
    uniswapV2Router,
    weth,
    token,
    pair,
    pairAddress,
    stakeClaim


contract('Stake-claim-able-test', function([userOne, userTwo, userThree]) {

  async function deployContracts(){
    // deploy contracts
    uniswapV2Factory = await UniswapV2Factory.new(userOne)
    weth = await WETH.new()
    uniswapV2Router = await UniswapV2Router.new(uniswapV2Factory.address, weth.address)
    token = await TOKEN.new(toWei(String(100000)))

    // add token liquidity
    await token.approve(uniswapV2Router.address, toWei(String(500)))

    await uniswapV2Router.addLiquidityETH(
      token.address,
      toWei(String(500)),
      1,
      1,
      userOne,
      "1111111111111111111111"
    , { from:userOne, value:toWei(String(500)) })

    pairAddress = await uniswapV2Factory.allPairs(0)
    pair = await UniswapV2Pair.at(pairAddress)

    stakeClaim = await StakeClaim.new(
      userOne,
      token.address,
      pair.address
    )

    // add some rewards to claim stake
    token.transfer(stakeClaim.address, toWei(String(1)))
    stakeClaim.notifyRewardAmount(toWei(String(1)))

    // send some tokens to another users
    await token.transfer(userTwo, toWei(String(1)))
    await token.transfer(userThree, toWei(String(1)))
  }

  beforeEach(async function() {
    await deployContracts()
  })

  describe('INIT stake', function() {
    it('Correct init Stake', async function() {
      assert.equal(await stakeClaim.rewardsToken(), token.address)
      assert.equal(await stakeClaim.stakingToken(), pair.address)
    })
  })


  describe('Stake', function() {
    it('Can be staked and withdrawed', async function() {
      // stake should not have any pool
      assert.equal(await pair.balanceOf(stakeClaim.address), 0)
      // amount to stake
      const toStake = await pair.balanceOf(userOne)
      assert.isTrue(toStake > 0)
      // stake
      await pair.approve(stakeClaim.address, toStake)
      await stakeClaim.stake(toStake)
      // stake should get pool
      assert.equal(Number(await pair.balanceOf(stakeClaim.address)), Number(toStake))
      // shares should be same as stake
      const shares = await stakeClaim.balanceOf(userOne)
      assert.equal(Number(shares), Number(toStake))
      // withdraw
      await stakeClaim.withdraw(shares)
      // stake should send all pools
      assert.equal(await pair.balanceOf(stakeClaim.address), 0)
      // user should get back all pools
      assert.equal(Number(await pair.balanceOf(userOne)), Number(toStake))
    })


    it('User should get rewards after time', async function() {
      // stake
      const toStake = await pair.balanceOf(userOne)
      await pair.approve(stakeClaim.address, toStake)
      await stakeClaim.stake(toStake)
      // check rewards
      const stakeRewards = await token.balanceOf(stakeClaim.address)
      assert.isTrue(stakeRewards > 0)
      const tokenBalanceBefore = await token.balanceOf(userOne)

      // increase time
      await timeMachine.advanceTimeAndBlock(duration.days(36))
      const calculateRewards = Number(toStake) * Number(await stakeClaim.rewardPerToken())
      // console.log(Number(toStake))
      // console.log(Number(await stakeClaim.rewardPerToken()))
      // console.log(Number(calculateRewards).toLocaleString('fullwide', {useGrouping:false}))
      // withdraw
      await stakeClaim.exit()
      // user should get all rewards
      assert.isTrue(Number(await token.balanceOf(userOne)) > Number(tokenBalanceBefore))
    })

    it('User who join early get more rewards', async function() {
      // stake 1 pool token from user 1
      await pair.approve(stakeClaim.address, toWei(String(1)))
      await stakeClaim.stake(toWei(String(1)))
      // increase time
      await timeMachine.advanceTimeAndBlock(duration.days(15))

      await pair.transfer(userTwo, toWei(String(1)))
      // stake 1 pool token from user 2
      await pair.approve(stakeClaim.address, toWei(String(1)), {from:userTwo})
      await stakeClaim.stake(toWei(String(1)), {from:userTwo})
      await timeMachine.advanceTimeAndBlock(duration.days(15))
      assert.isTrue(Number(await stakeClaim.earned(userOne)) > Number(await stakeClaim.earned(userTwo)))
    })
  })

  //END
})
