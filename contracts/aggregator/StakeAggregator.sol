// NOT finished

pragma solidity ^0.6.12;

import "../dex/interfaces/IUniswapV2Router02.sol";
import "../dex/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface IStakeFund {
  function deposit(uint256 depositAmount) external returns (uint256);
}

contract StakeAggregator {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  address public WETH;
  IUniswapV2Router02 public router;


  constructor(address _router) public {
    router = IUniswapV2Router02(_router);
    WETH = router.WETH();
  }

  function depositViaETH(address token1) external payable {
    address pair = getPair(WETH, address token1);
    address half = msg.value.div(2);

    // convert
    // stake for user
    // need deposit for function in Stake Fund
  }

  function depositViaERC20(address token0, address token1, uint256 amount) external {
    address pair = getPair(address token0, address token1);
    address half = amount.div(2);
  }

  function getPair(address token0, address token1) internal view returns(address){
    return IUniswapV2Factory().getPair(token0, token1);
  }

  function swapTokenToToken(address fromToken, address toToken, uint256 amount) internal {
    address[] memory path = new address[](2);
    path[0] = fromToken;
    path[1] = toToken;

    router.swapExactTokensForTokens(
      amount,
      1,
      path,
      address(this),
      block.timestamp + 15 minutes
    );
  }

  function swapETHToToken(address toToken, uint256 amount) internal {
    address[] memory path = new address[](2);
    path[0] = WETH;
    path[1] = toToken;

    router.swapExactETHForTokens{value:amount}(
      1,
      path,
      address(this),
      block.timestamp + 15 minutes
    );
  }

}
