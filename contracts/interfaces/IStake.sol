interface IStake {
  function balanceOf(address) external view returns(uint256);
  function stake(uint256 amount) external;
  function withdraw(uint256 amount) external;
  function earned(address account) external view returns (uint256);
}
