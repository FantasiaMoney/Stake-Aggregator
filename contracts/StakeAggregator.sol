import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./dex/interfaces/IUniswapV2Router02.sol";
import "./dex/interfaces/IUniswapV2Pair.sol";


contract StakeAggregator is Ownable {
  using SafeMath for uint256;

  IUniswapV2Router02 public Router;
  address public WETH;

  uint256 public totalShares;
  address[] public assets;
  address[] public stakes;

  mapping(address => uint256) public sharesOf;
  mapping(address => uint256) public tokenTypes;
  mapping(address => bool) public permittedAsset;
  mapping(address => bool) public permittedStake;

  enum TOKEN_TYPES {
    NULL,
    ERC20,
    UNI_POOL
  }

  constructor(address _Router) public {
    Router = IUniswapV2Router02(_Router);
    WETH = Router.WETH();
  }

  function getValueInETH(address asset, uint256 amount)
    public
    view
    returns(uint256)
  {
    uint256 type = tokenTypes[asset];

    require(type > 0, "WRONG token type");

    if(type == uint256(TOKEN_TYPES.ERC20)){
      return getRateInETH(asset, amount);
    }
    else if(type == uint256(TOKEN_TYPES.UNI_POOL)){
      (address token0,
       address token1,
       uint256 token0Amount,
       uint256 token1Amount) = getUniData(asset, amount);

       return getRateInETH(token0, token0Amount).add(getRateInETH(token1, token1Amount));
    }
    else{
      revert("Not supported type");
    }
  }

  function getRateInETH(address token, uint256 _amount) public view returns(uint256) {
    if(token == WETH)
      return _amount;

    address[] memory path = new address[](2);

    path[0] = token;
    path[1] = WETH;

    uint256[] memory res = Router.getAmountsOut(_amount, path);
    return res[1];
  }

  function getUniData(
    uint256 _poolAmount,
    address _poolAddress
  )
    public
    view
    returns(
      address token0,
      address token1,
      uint256 token0Amount,
      uint256 token1Amount
    )
  {
    token0 = IUniswapV2Pair(_poolAddress).token0();
    token1 = IUniswapV2Pair(_poolAddress).token1();

    uint256 totalLiquidity = IUniswapV2Pair(_poolAddress).totalSupply();

    token0Amount = _poolAmount.mul(IERC20(token0).balanceOf(_poolAddress)).div(totalLiquidity);
    token1Amount = _poolAmount.mul(IERC20(token1).balanceOf(_poolAddress)).div(totalLiquidity);
  }

  // User functions

  function deposit(address asset, uint256 amount) external {
    uint256 share = getValueInETH(asset, amount);
    require(share > 0, "Zerro shares");
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

  function addAsset(address asset, uint256 tokenType) external onlyOwner {
    assets.push(asset);
    permittedAsset[asset] = true;
    tokenTypes[asset] = tokenType;
  }

  function addStake(address stake) external onlyOwner {
    stakes.push(stake);
    permittedStake[stake] = true;
  }
}
