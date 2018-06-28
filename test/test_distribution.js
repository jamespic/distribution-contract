var Distribution = artifacts.require("Distribution");

contract('Distribution', function(accounts) {
  it('should distribute tokens according to shares', async function () {
    let instance = await Distribution.new()
    assert.equal(await instance.sharesHeld(accounts[0]), 100)

    let tx1 = await instance.setShares(accounts[1], 200)
    assert.equal(tx1.logs[0].event, 'SetShares')
    assert.equal(tx1.logs[0].args.shareholder, accounts[1])
    assert.equal(tx1.logs[0].args.shareCount.toNumber(), 200)

    assert.equal((await instance.sharesHeld(accounts[1])).toNumber(), 200)

    let tx2 = await instance.setShares(accounts[2], 300)
    assert.equal(tx2.logs[0].event, 'SetShares')
    assert.equal(tx2.logs[0].args.shareholder, accounts[2])
    assert.equal(tx2.logs[0].args.shareCount.toNumber(), 300)

    assert.equal((await instance.sharesHeld(accounts[2])).toNumber(), 300)

    let tx3 = await instance.setShares(accounts[1], 100)
    assert.equal(tx3.logs[0].event, 'SetShares')
    assert.equal(tx3.logs[0].args.shareholder, accounts[1])
    assert.equal(tx3.logs[0].args.shareCount.toNumber(), 100)

    assert.equal((await instance.sharesHeld(accounts[1])).toNumber(), 100)

    let tx4 = await instance.distribute({value: 50001})
    assert.equal(tx4.logs[0].event, 'Distribute')
    assert.equal(tx4.logs[0].args.shareholder, accounts[0])
    assert.equal(tx4.logs[0].args.value.toNumber(), 10000)
    assert.equal(tx4.logs[1].event, 'Distribute')
    assert.equal(tx4.logs[1].args.shareholder, accounts[1])
    assert.equal(tx4.logs[1].args.value.toNumber(), 10000)
    assert.equal(tx4.logs[2].event, 'Distribute')
    assert.equal(tx4.logs[2].args.shareholder, accounts[2])
    assert.equal(tx4.logs[2].args.value.toNumber(), 30000)
    let balance = await new Promise((resolve, reject) => web3.eth.getBalance(instance.address, (err, res) => {if (err) reject(err); else resolve(res)}))
    assert.equal(balance.toNumber(), 1)
  })

  it('should distribute when called with enough gas', async function () {
    let instance = await Distribution.new()
    let tx = await instance.sendTransaction({value: 100000, gas: 100000})
    assert.equal(tx.logs[0].event, 'Distribute')
    assert.equal(tx.logs[0].args.shareholder, accounts[0])
    assert.equal(tx.logs[0].args.value.toNumber(), 100000)
  })

  it('should not distribute when called with a small amount of gas', async function () {
    let instance = await Distribution.new()
    let tx = await instance.sendTransaction({value: 100, gas: 25000})
    console.log(tx)
    assert.equal(tx.logs.length, 0)
    assert.equal(tx.receipt.status, '0x01')
  })
})
