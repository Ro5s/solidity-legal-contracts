/**
Copyright 2018 Michael Rice <michael@michaelricelaw.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Will = artifacts.require("./Will.sol", 1);

contract('Probate...', async (accounts) => {

  var will;
  var contractOwner = accounts[0];
  var testatorAccount = accounts[1];
  var administratorAccount = accounts[2];
  var daughter1Account = accounts[3];
  var strangerAccount = accounts[9];

  beforeEach("create a new instance of the will each time", async() => {
    will = await Will.new(contractOwner);
  });

  it ("deploys and we can prove truth", async() => {
    let will = await Will.deployed();
    assert.isTrue(true);
  });

  it ("should have the contractOwner assigned at deploy time", async() => {
    let assignedOwner = await will.contractOwner();
    expect(assignedOwner).to.be.defined;
    expect(assignedOwner).to.be.a.string;
    expect(assignedOwner).to.equal(contractOwner);
  });

  it ("allows contractOwner to define testator", async() => {
    await will.designateTestator(testatorAccount, {from:contractOwner});
    let assignedTestator = await will.testator();
    expect(assignedTestator).to.be.defined;
    expect(assignedTestator).to.be.a.string;
    expect(assignedTestator).to.equal(testatorAccount);
  });

  it ("prevents anyone but contractOwner from defining testator", function() {
    return Will.new(contractOwner).then(function(will) {
      return will.designateTestator.call(testatorAccount, {from: strangerAccount});
    }).then(function (noErrorThrown) {
      assert.isTrue(false, "should have failed");
    }, function (errorThrown) {
      assert.isTrue(true, "failure caught");
    });
  });

  it ("allows the testator to appoint an administrator", async() => {
    await will.designateTestator(testatorAccount, {from:contractOwner});
    await will.appointAdministrator(administratorAccount, {from:testatorAccount});
    let assignedAdministrator = await will.administrator();
    expect(assignedAdministrator).to.be.defined;
    expect(assignedAdministrator).to.be.a.string;
    expect(assignedAdministrator).to.equal(administratorAccount);
  });

  it ("prevents anyone but the testator from appointing an administrator", async() => {
    return Will.new(contractOwner).then(function(will) {
      return will.appointAdministrator(administratorAccount, {from: strangerAccount});
    }).then(function (noErrorThrown) {
      assert.isTrue(false, "should have failed");
    }, function (errorThrown) {
      assert.isTrue(true, "failure caught");
    });
  });

  it ("lets the testator add a beneficiary", async() => {
    await will.designateTestator(testatorAccount, {from: contractOwner});
    await will.appointAdministrator(administratorAccount, {from: testatorAccount});

    await will.addBeneficiary(daughter1Account, 50, {from: testatorAccount});

    let beneficiaries = await will.beneficiaries;
    expect(beneficiaries).to.be.defined;

    let assignedShareBigNumber = await will.beneficiaries(daughter1Account);
    let derivedShare = assignedShareBigNumber.toNumber();
    expect(derivedShare).to.equal(50);

  });

  it ("prevents anyone but the testator from adding a beneficiary", async() => {

    let will = await Will.new(contractOwner);
    await will.designateTestator(testatorAccount, {from: contractOwner});

    will.addBeneficiary(daughter1Account, 50, {from: strangerAccount}).then(
      function(noErrorThrown) {
        assert.isTrue(false, "should have failed");
      }, function(errorThrown) {
        assert.isTrue(true, "failure caught");
      });
  });

});
