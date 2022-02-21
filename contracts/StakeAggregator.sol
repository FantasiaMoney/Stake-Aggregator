import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeAggregator is Ownable {
  uint256 public totalShares;
  address[] public assets;
  address[] public stakes;
  address public usd;

  mapping(address => uint256) public sharesOf;
  mapping(address => bool) public permittedAsset;
  mapping(address => bool) public permittedStake;

  constructor(address _usd) public {
    usd = _usd;
  }

  function getValueInUSD(address asset, uint256 amount)
    public
    view
    returns(uint256)
  {

  }

  // User functions

  function deposit(address asset, uint256 amount) external {

  }

  function withdraw(uint256 share) external {

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
