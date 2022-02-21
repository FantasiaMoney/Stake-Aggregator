interface IReserve {
  function buy() external payable;

  function currentRate(address _from, address _to, uint256 _amount)
    external
    view
    returns(uint256);
}
