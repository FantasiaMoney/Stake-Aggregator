interface ISale {
  function buy() external payable;
  function buyFor(address _to) external payable;
}
