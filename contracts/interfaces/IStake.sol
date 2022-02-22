interface IStake {
  function stake(uint256 amount) external;
  function withdraw(uint256 amount) external;
  function earned(address account) public view returns (uint256);
}
