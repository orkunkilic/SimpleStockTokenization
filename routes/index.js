var express = require('express');
var router = express.Router();
const Web3 = require('web3');
const Token = require('../abis/Token.json');
const UserContract = require('../abis/UserContract.json');
const axios = require('axios');
var contractAddresses = [];
require('dotenv').config();

/* GET home page. */
router.post('/', async function (req, res, next) {
  const { userAddress, symbol, amount } = req.body;
  const web3 = new Web3('http://127.0.0.1:7545');
  const netId = await web3.eth.net.getId();
  var userContract;
  var token;
  var user;
  try {
    token = new web3.eth.Contract(Token.abi, process.env.TOKEN_ADDRESS);
    var isUserContract = contractAddresses.find(
      (i) => i.address == userAddress
    );
    if (!isUserContract) {
      userContract = await new web3.eth.Contract(UserContract.abi)
        .deploy({
          data: UserContract.bytecode,
          arguments: [process.env.TOKEN_ADDRESS],
        })
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
  var ethPrice;

  await axios.get('https://api.genelpara.com/embed/borsa.json').then((r) => {
    stock = { symbol, price: r.data[symbol]['satis'] };
  });

  await axios
    .get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=TRY')
    .then((r) => {
      ethPrice = r.data['TRY'];
    });

  const stockAmount = amount / stock.price;

  var stockAmountOfUser = await userContract.methods
    .getStockAmount(stock.symbol)
    .call({ from: user.address });

  const buy = await userContract.methods
    .buyStock(
      stock.symbol,
      (stockAmount * 10 ** 18 + Number(stockAmountOfUser)).toString(),
      Math.ceil(Number((stock.price / ethPrice) * 10 ** 18))
    )
    .send({
      from: user.address,
      value: Math.ceil(
        Number((stock.price / ethPrice) * 10 ** 18) * stockAmount
      ),
    });

  console.log(buy.events.Buy.returnValues);

  stockAmountOfUser = await userContract.methods
    .getStockAmount(stock.symbol)
    .call({ from: user.address });

  const balance = await userContract.methods
    .getBalance()
    .call({ from: user.address });

  res.json({
    user: contractAddresses.find((i) => i.address == userAddress),
    newStockAmount: stockAmountOfUser / 10 ** 18,
    balance: balance / 10 ** 18,
  });
});

router.post('/sell', async function (req, res, next) {
  const { userAddress, symbol, amountToSell } = req.body;
  const web3 = new Web3('http://127.0.0.1:7545');
  const netId = await web3.eth.net.getId();
  var userContract;
  var token;
  var user;
  try {
    token = new web3.eth.Contract(
      Token.abi,
      '0xa648F495b6c85Cea23492b3CC0B06Ec6FcBe0BaB'
    );
    var isUserContract = contractAddresses.find(
      (i) => i.address == userAddress
    );
    if (!isUserContract) {
      /* userContract = await new web3.eth.Contract(UserContract.abi)
        .deploy({
          data: UserContract.bytecode,
          arguments: ['0xa648F495b6c85Cea23492b3CC0B06Ec6FcBe0BaB'],
        })
        .send({ gas: '1000000', from: userAddress });
      user = {
        address: userAddress,
        contract: userContract._address,
      };
      contractAddresses.push(user);
      console.log(user); */
      res.json({ error: 1, message: 'You should create a contract first!' });
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
  var ethPrice;

  await axios.get('https://api.genelpara.com/embed/borsa.json').then((r) => {
    stock = { symbol, price: r.data[symbol]['satis'] };
  });

  await axios
    .get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=TRY')
    .then((r) => {
      ethPrice = r.data['TRY'];
    });

  stockAmountOfUser = await userContract.methods
    .getStockAmount(stock.symbol)
    .call({ from: user.address });

  if (stockAmountOfUser / 10 ** 18 >= amountToSell) {
    const sell = await userContract.methods
      .sellStock(
        stock.symbol,
        (amountToSell * 10 ** 18).toString(),
        Math.ceil(Number((stock.price / ethPrice) * 10 ** 18))
      )
      .send({
        from: user.address,
      });

    stockAmountOfUser = await userContract.methods
      .getStockAmount(stock.symbol)
      .call({ from: user.address });

    const balance = await userContract.methods
      .getBalance()
      .call({ from: user.address });

    res.json({
      user: contractAddresses.find((i) => i.address == userAddress),
      newStockAmount: stockAmountOfUser / 10 ** 18,
      balance: balance / 10 ** 18,
    });
  } else {
    res.json({
      error: 1,
      message: 'You do not have that much stock!',
    });
  }
});

module.exports = router;
