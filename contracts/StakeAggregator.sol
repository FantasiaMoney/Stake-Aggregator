import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./dex/interfaces/IUniswapV2Router02";

contract StakeAggregator is Ownable {
  using SafeMath for uint256;

  uint256 public totalShares;
  address[] public assets;
  address[] public stakes;
  address public usd;

  mapping(address => uint256) public sharesOf;
  mapping(address => bool) public permittedAsset;
  mapping(address => bool) public permittedStake;


  function getValueInETH(address asset, uint256 amount)
    public
    view
    returns(uint256)
  {

  }

  function getUniswapConnectorsAmountByPoolAmount(
    uint256 _poolAmount,
    address _poolAddress
  )
    public
    view
    returns(uint256 token0Amount, uint256 token1Amount)
  {
    address token0 = IUniswapV2Router02(_poolAddress).token0();
    address token1 = IUniswapV2Router02(_poolAddress).token1();

    uint256 totalLiquidity = UniswapExchangeInterface(_exchange).totalSupply();

    token0Amount = _poolAmount.mul(IERC20(token0).balanceOf(_poolAddress)).div(totalLiquidity);
    token1Amount = _poolAmount.mul(IERC20(token1).balanceOf(_poolAddress)).div(totalLiquidity);
  }

  // User functions

  function deposit(address asset, uint256 amount) external {
    uint256 share = getValueInUSD(asset, amount);
    sharesOf[msg.sender] = sharesOf[msg.sender].add(share);
    totalShares = totalShares.add(share);
  }

  function withdraw(uint256 share) external {
    sharesOf[msg.sender] = sharesOf[msg.sender].sub(share);
    totalShares = totalShares.sub(share);
  }

  function claimAndRestake(address stakeFrom, address stakeTo) external {

  }

  // OnlyOwner functions

  function addAsset(address asset) external onlyOwner {
    assets.push(asset);
    permittedAsset[asset] = true;
  }

  function addStake(address stake) external onlyOwner {
    stakes.push(stake);
    permittedStake[stake] = true;
  }
}
