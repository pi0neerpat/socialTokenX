// const { web3tx, toWad, toBN, wad4human } = require('@decentral.ee/web3-helpers')
// const { time, expectRevert } = require('@openzeppelin/test-helpers')
// const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
// const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
// const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
// const SuperfluidSDK = require('@superfluid-finance/ethereum-contracts')
// const NativeSuperToken = artifacts.require('NativeSuperToken')
//
// contract('NativeSuperToken', (accounts) => {
//   const errorHandler = (err) => {
//     if (err) throw err
//   }
//
//   const ZERO_ADDRESS = '0x' + '0'.repeat(40)
//   const MINIMUM_GAME_FLOW_RATE = toWad(10).div(toBN(3600 * 24 * 30))
//   const TOTAL_SUPPLY = toWad(100000000)
//
//   accounts = accounts.slice(0, 4)
//   const [creator, bob] = accounts
//   // const [creator, bob, carol, dan] = accounts
//
//   let sf
//   let dai
//   let daix
//   let app
//
//   beforeEach(async function () {
//     await deployFramework(errorHandler)
//
//     sf = new SuperfluidSDK.Framework({ web3Provider: web3.currentProvider })
//     await sf.initialize()
//
//     if (!dai) {
//       await deployTestToken(errorHandler, [':', 'fDAI'])
//       const daiAddress = await sf.resolver.get('tokens.fDAI')
//       dai = await sf.contracts.TestToken.at(daiAddress)
//       for (let i = 0; i < accounts.length; ++i) {
//         await web3tx(dai.mint, `Account ${i} mints many dai`)(
//           accounts[i],
//           toWad(10000000),
//           { from: accounts[i] }
//         )
//       }
//     }
//
//     await deploySuperToken(errorHandler, [':', 'fDAI'])
//
//     const daixWrapper = await sf.getERC20Wrapper(dai)
//     daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)
//
//     app = await web3tx(NativeSuperToken.new, 'Deploy NativeSuperToken')(
//       sf.host.address,
//       sf.agreements.cfa.address,
//       daix.address,
//       TOTAL_SUPPLY
//     )
//
//     for (let i = 1; i < accounts.length; ++i) {
//       await web3tx(dai.approve, `Account ${i} approves daix`)(
//         daix.address,
//         toWad(100000000),
//         { from: accounts[i] }
//       )
//       await web3tx(daix.upgrade, `Account ${i} upgrades dai`)(toWad(1000), {
//         from: accounts[i],
//       })
//       await web3tx(
//         daix.approve,
//         `Account ${i} approves NativeSuperToken contract`
//       )(app.address, toWad(100000000), { from: accounts[i] })
//     }
//   })
//
//   it('will deploy', async () => {
//     assert.equal(
//       (await app.totalSupply.call()).toString(),
//       TOTAL_SUPPLY.toString()
//     )
//   })
//
//   it('is transferrable', async () => {
//     console.log((await app.balanceOf(creator)).toString())
//     await web3tx(app.transfer, `Send 100 to Bob`)(bob, 100, {
//       from: creator,
//     })
//     console.log((await app.balanceOf(creator)).toString())
//     assert.equal((await app.balanceOf(bob)).toString(), '100')
//   })
// })
