// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Token.sol";

contract UserContract {
    mapping(string => uint256) stocks;
    Token token;
    address payable owner;
    event Buy(uint256, uint256, uint256);
    constructor(Token _token) public {
        token = _token;
        owner = payable(msg.sender);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this function.");
        _;
    }
    
    function buyStock(string memory symbol, uint256 newStockAmount, uint256 currentStockPriceInWei) public payable onlyOwner returns(bool)  { // should be payable
        //require(msg.value == ((newStockAmount - stocks[symbol]) / 10 ** 18) * currentStockPriceInWei, "You should pay the correct amount to buy this stock!");
        emit Buy(newStockAmount - stocks[symbol], currentStockPriceInWei, msg.value);
        token.mint(newStockAmount / 10 ** 18, symbol);
        stocks[symbol] = newStockAmount;
        return true;
    }
    
    function getStockAmount(string memory symbol) public view returns(uint256) {
        return stocks[symbol];
    }
    
    function sellStock(string memory symbol, uint256 amountToSell, uint256 currentStockPriceInWei) public onlyOwner{
        require(stocks[symbol] >= amountToSell, "You do not have enough amount of the stock to sell!");
        stocks[symbol] -= amountToSell;
        token.burn(amountToSell / 10 ** 18, symbol);
        //owner.transfer(amountToSell * currentStockPriceInWei);
    }
    
    function getBalance() public view onlyOwner returns(uint256){
        return address(this).balance;
    }
    
    
}