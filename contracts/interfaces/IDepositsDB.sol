interface IDepositsDB {
  function deposit(address receiver, uint256 balanceBefore, uint256 balanceAfter) external;

  function depositsPerUser(address user, uint256 id)
    external
    view
    returns(uint256, uint256, uint256);
}
