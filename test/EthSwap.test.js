const { assert } = require('chai');

const Token = artifacts.require('Token');
const EthSwap = artifacts.require('EthSwap');

// Configure Chai
require('chai')
  .use(require('chai-as-promised'))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer, investor]) => {
  let token;
  let ethSwap;

  before(async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);

    // Transfer all tokens to EthSwap (1 million)
    await token.transfer(ethSwap.address, tokens('1000000'));
  });

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name();
      assert.equal(name, 'DApp Token');
    });
  });

  describe('EthSwap deployment', async () => {
    it('contract has a name', async () => {
      const name = await ethSwap.name();
      assert.equal(name, 'EthSwap Instant Exchange');
    });

    it('contract has tokens', async () => {
      const balance = await token.balanceOf(ethSwap.address);
      assert.equal(balance.toString(), tokens('1000000'));
    });
  });

  describe('buyTokens()', async () => {
    let result;

    before(async () => {
      // Purchase tokens before each test
      result = await ethSwap.buyTokens({
        from: investor,
        value: web3.utils.toWei('1', 'ether'),
      });
    });

    it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
      // Check investor token balance after purchase
      const investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens('100'));

      // Check ethSwap token balance
      let ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens('999900'));

      // check the ethSwap ethereum balance
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'));

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens('100').toString());
      assert.equal(event.rate.toString(), '100');
    });
  });

  describe('sellTokens()', async () => {
    let result;

    before(async () => {
      // Investor must approve the purchase
      await token.approve(ethSwap.address, tokens('100'), { from: investor });
      // Investor sells tokens
      result = await ethSwap.sellTokens(tokens('100'), { from: investor });
    });

    it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {
      // Check investor token balance after purchase
      const investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens('0'));

      // Check ethSwap token balance
      let ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), tokens('1000000'));

      // check the ethSwap ethereum balance
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether'));

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens('100').toString());
      assert.equal(event.rate.toString(), '100');

      // FAILURE: Investor can't sell more tokens than they have
      await ethSwap.sellTokens(tokens('500'), { from: investor }).should.be
        .rejected;
    });
  });
});
