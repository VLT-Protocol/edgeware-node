const { assert } = require('chai');
const Create2Factory = require('../build/contracts/Create2Factory.json');
const ValueContract = require('../build/contracts/ValueContract.json');
const { describeWithEdgeware, account } = require('../helpers/utils');
const contract = require("@truffle/contract");

describeWithEdgeware('Create2Factory test', async (context) => {
  it('should deploy with create2', async () => {
    const web3 = context.web3;
    let Create2 = contract({
      abi: Create2Factory.abi,
      unlinked_binary: Create2Factory.bytecode,
    });
    Create2.setProvider(web3.currentProvider);

    let c = await Create2.new({ from: account });

    // load bytecode and deploy
    await c.deploy(5, { from: account, gasPrice: 1000000000 });
    const addr = await c.viewAddr.call({ from: account, gasPrice: 1000000000 });

    let Value = contract({
      abi: ValueContract.abi,
      unlinked_binary: ValueContract.bytecode,
    });
    Value.setProvider(web3.currentProvider);

    // load new contract and check methods
    const valueContract = await Value.at(addr);
    const value = await valueContract.getValue.call({ from: account, gasPrice: 1000000000 });
    assert.equal(value, '0');
  });
});
