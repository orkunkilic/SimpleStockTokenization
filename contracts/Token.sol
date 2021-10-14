// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    mapping(address => mapping(string => uint256)) balances;
    constructor () ERC20("BarakaStockTokenizationService", "BSTS") {
        
    }
    function mint(uint256 amount, string memory symbol) public {
        _mint(msg.sender, amount);
        balances[msg.sender][symbol] += amount;
    }
    
    function burn(uint256 amount, string memory symbol) public {
        _burn(msg.sender, amount);
        balances[msg.sender][symbol] -= amount;
     }
}