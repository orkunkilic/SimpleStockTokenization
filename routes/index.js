var express = require('express');
var router = express.Router();
const Web3 = require('web3');
const Token = require('../abis/Token.json');
const UserContract = require('../abis/UserContract.json');
const axios = require('axios');
var contractAddresses = [];

/* GET home page. */
router.post('/', async function (req, res, next) {
  const { userAddress, symbol, amount } = req.body;
  const web3 = new Web3('http://127.0.0.1:7545');
  const netId = await web3.eth.net.getId();
  var userContract;
  var token;
  var user;
  try {
    token = new web3.eth.Contract(Token.abi, Token.networks[netId].address);
    var isUserContract = contractAddresses.find(
      (i) => i.address == userAddress
    );
    if (!isUserContract) {
      userContract = await new web3.eth.Contract(UserContract.abi)
        .deploy({ data: UserContract.bytecode })
        .send({ gas: '1000000', from: userAddress });
      user = {
        address: userAddress,
        contract: userContract._address,
      };
      contractAddresses.push(user);
      console.log(user);
    } else {
      userContract = new web3.eth.Contract(
        UserContract.abi,
        isUserContract.contract
      );
      user = isUserContract;
    }
  } catch (e) {
    console.log('Error', e);
    res.json({ error: e });
  }
  var stock;
  await axios.get('https://api.genelpara.com/embed/borsa.json').then((r) => {
    stock = { symbol, price: r.data[symbol]['satis'] };
  });
  const stockAmount = amount / stock.price;
  var stockAmountOfUser = await userContract.methods
    .getStockAmount(stock.symbol)
    .call({ from: user.address });
  await userContract.methods
    .buyStock(
      stock.symbol,
      (stockAmount + Number(stockAmountOfUser)).toString()
    )
    .send({ from: user.address });
  stockAmountOfUser = await userContract.methods
    .getStockAmount(stock.symbol)
    .call({ from: user.address });
  console.log(stockAmountOfUser);
  res.json({
    user: contractAddresses.find((i) => i.address == userAddress),
    newStockAmount: stockAmountOfUser,
  });
});

module.exports = router;
