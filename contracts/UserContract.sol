// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Token.sol";

contract UserContract {
    mapping(string => string) stocks;
    Token token;
    address owner;
    constructor(Token _token) public {
        token = _token;
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this function.");
        _;
    }
    
    function buyStock(string memory symbol, string memory newStockAmount ) public onlyOwner returns(bool)  {
        token.mint(uint256(newStockAmount) * 10 ** 18);
        stocks[symbol] = newStockAmount;
        return true;
    }
    
    function getStockAmount(string memory symbol) public view returns(string memory) {
        return stocks[symbol];
    }
}