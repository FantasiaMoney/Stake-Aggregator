interface IBurn {
  function burn(uint256) external;
  function burnFrom(address _to, uint256 _amount) external;
}
