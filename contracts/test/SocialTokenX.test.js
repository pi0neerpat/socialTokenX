const { web3tx, toWad, toBN, wad4human } = require('@decentral.ee/web3-helpers')
const { expectRevert } = require('@openzeppelin/test-helpers')
const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
const SuperfluidSDK = require('@superfluid-finance/ethereum-contracts')
const SocialTokenX = artifacts.require('SocialTokenX')

const traveler = require('ganache-time-traveler')
const TEST_TRAVEL_TIME = 3600 * 2 // 1 hours

contract('SocialTokenX', (accounts) => {
  const errorHandler = (err) => {
    if (err) throw err
  }

  const ZERO_ADDRESS = '0x' + '0'.repeat(40)
  const FLOW_RATE = toWad(10).div(toBN(3600 * 24 * 30)) // (10/mo)
  const TOTAL_SUPPLY = toWad(100000000)

  accounts = accounts.slice(0, 4)
  const [creator, bob, carol] = accounts
  // const [creator, bob, carol, dan] = accounts

  let sf
  let dai
  let daix
  let app

  beforeEach(async function () {
    await deployFramework(errorHandler)

    sf = new SuperfluidSDK.Framework({ web3Provider: web3.currentProvider })
    await sf.initialize()

    if (!dai) {
      await deployTestToken(errorHandler, [':', 'fDAI'])
      const daiAddress = await sf.resolver.get('tokens.fDAI')
      dai = await sf.contracts.TestToken.at(daiAddress)
      for (let i = 0; i < accounts.length; ++i) {
        await web3tx(dai.mint, `Account ${i} mints many dai`)(
          accounts[i],
          toWad(10000000),
          { from: accounts[i] }
        )
      }
    }

    await deploySuperToken(errorHandler, [':', 'fDAI'])

    const daixWrapper = await sf.getERC20Wrapper(dai)
    daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)

    app = await web3tx(SocialTokenX.new, 'Deploy SocialTokenX')(
      sf.host.address,
      sf.agreements.cfa.address,
      daix.address,
      TOTAL_SUPPLY
    )

    for (let i = 1; i < accounts.length; ++i) {
      await web3tx(dai.approve, `Account ${i} approves daix`)(
        daix.address,
        toWad(100000000),
        { from: accounts[i] }
      )
      await web3tx(daix.upgrade, `Account ${i} upgrades dai`)(toWad(1000), {
        from: accounts[i],
      })
      await web3tx(
        daix.approve,
        `Account ${i} approves SocialTokenX contract`
      )(app.address, toWad(100000000), { from: accounts[i] })
    }
  })

  async function printRealtimeBalance(label, account) {
    const { availableBalance } = await daix.realtimeBalanceOfNow.call(account)
    return console.log(`${label} rtb: `, wad4human(availableBalance))
  }

  async function printShares(label, account) {
    const shares = await app.getSharesOf.call(account)
    return console.log(`${label} shares: `, shares.toString())
  }

  // const purchaseTokens = async (amount) => {
  //   console.log(
  //     `======= New purchase =======`
  //   )
  //     await web3tx(app.bid, `${bid.label} bids ${bid.amount}`)(
  //       toWad(bid.amount),
  //       { from: bid.account }
  //     )
  //   let timeLeft = await app.checkTimeRemaining()
  //   time.increase(timeLeft + 1)
  //   console.log('---AUCTION ENDED---')
  //   await printRealtimeBalance('Auction revenue generated', app.address)
  //   await web3tx(
  //     app.settleAndBeginAuction,
  //     `Bob settles the auction`
  //   )({ from: bob })
  //   console.log('---AUCTION SETTLED---')
  //   await printRealtimeBalance('Auction', app.address)
  //   await printRealtimeBalance('Creator', creator)
  //   await printRealtimeBalance('Bob', bob)
  //   await printShares('Bob', bob)
  //   await printRealtimeBalance('Carol', carol)
  //   await printShares('Carol', carol)
  //   await printRealtimeBalance('Dan', dan)
  //   await printShares('Dan', dan)
  // }

  // it('will deploy', async () => {
  //   assert.equal(
  //     (await app.totalSupply.call()).toString(),
  //     TOTAL_SUPPLY.toString()
  //   )
  // })
  //
  // it('is transferrable', async () => {
  //   const tran   = toWad(100).toString()
  //   console.log((await app.balanceOf(creator)).toString())
  //   await web3tx(app.transfer, `Send 100 to Bob`)(bob, transferAmount, {
  //     from: creator,
  //   })
  //   console.log((await app.balanceOf(creator)).toString())
  //   assert.equal((await app.balanceOf(bob)).toString(),transferAmount)
  // })

  it('can create streams', async () => {
    await printRealtimeBalance('Bob', bob)
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .createFlow(daix.address, app.address, FLOW_RATE.toString(), '0x')
        .encodeABI(),
      {
        from: carol,
      }
    )
    // await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME);
    // await sf.host.callAgreement(
    //     sf.agreements.cfa.address,
    //     sf.agreements.cfa.contract.methods.deleteFlow(daix.address,alice,app.address,"0x").encodeABI(), {
    //         from: admin
    //     }
    // );
  })
})