<h1 align="center">Welcome to personalTokenX 👋</h1>
<p>
  <img src="https://img.shields.io/badge/node-%3E%3D12-blue.svg" />
  <img src="https://img.shields.io/badge/yarn-%3E%3D1.15-blue.svg" />
  <a href="https://github.com/pi0neerpat/personalTokenX" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://twitter.com/pi0neerpat" target="_blank">
    <img alt="Twitter: pi0neerpat" src="https://img.shields.io/twitter/follow/pi0neerpat.svg?style=social" />
  </a>
</p>

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

> A Superfluid-based social token experiment

## About

This is a "Native" Super Token, which means it does not have an underlying token. For example DAIx is not a Native token, since it is a wrapped version of DAI. Thus a Native Super Token can never be un-wrapped, and is only available within the SuperFluid ecosystem.

That said, Native tokens are also ERC20 at their core, so there is no reason they would not be compatible with any DeFi application.

_Advantages of a Native Super Token_:

- No need to "wrap" before using Constant Flow Agreements, IDAs, etc

_Disadvantages of a Native Super Token_:

- It has not inherent value, so you must design your own tokenomics.

## Prerequisites

- node >=12

- yarn >=1.15

## Install

```sh
yarn install
```

## Build the contracts

```bash
cd contracts
yarn build
```

## Run the app

```bash
# in root
yarn rw dev
```

## Author

👤 **Patrick Gallagher**

- Website: https://patrickgallagher.dev
  - Twitter: [@pi0neerpat](https://twitter.com/pi0neerpat)
  - GitHub: [@pi0neerpat](https://github.com/pi0neerpat)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
