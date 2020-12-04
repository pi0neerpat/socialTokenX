// https://www.chaijs.com/api/assert/

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
  const FLOW_RATE = toWad(1).div(toBN(3600 * 24 * 30)) // (1/mo)
  const TOTAL_SUPPLY = toWad(100000000)
  const INITIAL_DAI_BALANCE = 10000000
  const INITIAL_DAIX_BALANCE = 1000

  accounts = accounts.slice(0, 4)
  const [creator, bob, carol, dan] = accounts

  let sf
  let dai
  let daix
  let st
  let stx

  before(async function () {
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
          toWad(INITIAL_DAI_BALANCE),
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

    // Social Token wrapper
    const stxWrapper = await sf.getERC20Wrapper(app)
    stx = await sf.contracts.ISuperToken.at(stxWrapper.wrapperAddress)

    for (let i = 1; i < accounts.length; ++i) {
      await web3tx(dai.approve, `Account ${i} approves daix`)(
        daix.address,
        toWad(INITIAL_DAI_BALANCE),
        { from: accounts[i] }
      )
      await web3tx(daix.upgrade, `Account ${i} upgrades dai`)(
        toWad(INITIAL_DAIX_BALANCE),
        {
          from: accounts[i],
        }
      )
      await web3tx(
        daix.approve,
        `Account ${i} approves SocialTokenX contract`
      )(app.address, toWad(INITIAL_DAI_BALANCE), { from: accounts[i] })
    }
  })

  async function printRealtimeBalance(label, account) {
    const {
      availableBalance: daixBalance,
    } = await daix.realtimeBalanceOfNow.call(account)
    const {
      availableBalance: stxBalance,
    } = await stx.realtimeBalanceOfNow.call(account)
    return console.log(
      `${label} daix rtb: ${wad4human(daixBalance)}  stx rtb: ${wad4human(
        stxBalance
      )}`
    )
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

  it('will deploy', async () => {
    assert.equal(
      (await app.totalSupply.call()).toString(),
      TOTAL_SUPPLY.toString()
    )
    assert.equal(
      (await stx.totalSupply.call()).toString(),
      TOTAL_SUPPLY.toString()
    )
  })

  it('is transferrable', async () => {
    await web3tx(stx.transfer, `Send 100 to Bob`)(bob, 100, {
      from: creator,
    })
    assert.equal((await stx.balanceOf(bob)).toString(), 100)
  })

  it('can turn on flow', async () => {
    await printRealtimeBalance('Carol', carol)
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .createFlow(daix.address, app.address, FLOW_RATE.toString(), '0x')
        .encodeABI(),
      {
        from: carol,
      }
    )
    await printRealtimeBalance('Carol', carol)
    const { availableBalance } = await daix.realtimeBalanceOfNow.call(carol)
    assert.isBelow(Number(wad4human(availableBalance)), INITIAL_DAIX_BALANCE)
  })

  it('can turn off flow', async () => {
    await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME)
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .deleteFlow(daix.address, carol, app.address, '0x')
        .encodeABI(),
      {
        from: carol,
      }
    )
    const { availableBalance: before } = await daix.realtimeBalanceOfNow.call(
      carol
    )
    await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME)
    const { availableBalance: after } = await daix.realtimeBalanceOfNow.call(
      carol
    )
    await printRealtimeBalance('Carol', carol)
    assert.equal(wad4human(before), wad4human(after))
  })

  it('earns tokens from flow', async () => {
    await printRealtimeBalance('Dan', dan)
    assert.equal((await app.balanceOf(dan)).toString(), 0)
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .createFlow(daix.address, app.address, FLOW_RATE.toString(), '0x')
        .encodeABI(),
      {
        from: dan,
      }
    )
    await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME)
    await sf.host.callAgreement(
      sf.agreements.cfa.address,
      sf.agreements.cfa.contract.methods
        .deleteFlow(daix.address, dan, app.address, '0x')
        .encodeABI(),
      {
        from: dan,
      }
    )
    await printRealtimeBalance('Dan', dan)
    const { availableBalance } = await daix.realtimeBalanceOfNow.call(dan)
    assert.isBelow(Number(wad4human(availableBalance)), INITIAL_DAIX_BALANCE)

    console.log((await app.balanceOf(dan)).toString())
    assert.isAbove(Number((await app.balanceOf(dan)).toString()), 0)
  })
})
