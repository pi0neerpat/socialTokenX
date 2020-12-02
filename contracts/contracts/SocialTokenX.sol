// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {
    ISuperfluid,
    ISuperToken,
    ISuperApp,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

contract SocialTokenX is ERC20, ISuperApp {
  using SafeMath for uint256;

  ISuperfluid private host;
  IConstantFlowAgreementV1 private cfa;
  IInstantDistributionAgreementV1 private ida;
  ISuperToken public tokenX;

  constructor(ISuperfluid _host, IConstantFlowAgreementV1 _cfa, IInstantDistributionAgreementV1 _ida, ISuperToken _tokenX) ERC20 ("SocialTokenX", "STX") {
      assert(address(_host) != address(0));
      assert(address(_cfa) != address(0));
      assert(address(_ida) != address(0));
      assert(address(_tokenX) != address(0));
      host = _host;
      cfa = _cfa;
      ida = _ida;
      tokenX = _tokenX;

      uint256 configWord =
            SuperAppDefinitions.TYPE_APP_FINAL |
            // SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

      host.registerApp(configWord);
  }

    function beforeAgreementCreated(
        ISuperToken _tokenX,
        bytes calldata _ctx,
        address _agreementClass,
        bytes32 agreementId,
        bytes calldata /*cbdata*/
    )
        external
        onlyExpected(_tokenX, _agreementClass)
        onlyHost
        returns (bytes memory)
    {
        // return _bid(_ctx, _tokenX, agreementId);
    }

    function afterAgreementCreated(
        ISuperToken _tokenX,
        bytes calldata _ctx,
        address _agreementClass,
        bytes32 agreementId,
        bytes calldata /*cbdata*/
    )
        external override
        onlyExpected(_tokenX, _agreementClass)
        onlyHost
        returns (bytes memory)
    {
        // return _bid(_ctx, _tokenX, agreementId);
    }

    function beforeAgreementUpdated(
      ISuperToken /*superToken*/,
      bytes calldata /*ctx*/,
      address /*agreementClass*/,
      bytes32 /*agreementId*/
    )
    external
    view
    virtual
    override
    returns (bytes memory /*cbdata*/)
    {
      // revert("Unsupported callback - Before Agreement updated");
    }

    function afterAgreementUpdated(
        ISuperToken _superToken,
        bytes calldata _ctx,
        address _agreementClass,
        bytes32 agreementId,
        bytes calldata /*cbdata*/
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory)
    {
        // return _doExchange(_ctx, _superToken, agreementId);
    }

    function beforeAgreementTerminated(
        ISuperToken /*superToken*/,
        bytes calldata /*ctx*/,
        address /*agreementClass*/,
        bytes32 /*agreementId*/
    )
        external
        view
        virtual
        override
        returns (bytes memory /*cbdata*/)
    {
        // revert("Unsupported callback -  Before Agreement Terminated");
    }

    function afterAgreementTerminated(
        ISuperToken _superToken,
        bytes calldata _ctx,
        address _agreementClass,
        bytes32 _agreementId,
        bytes calldata /*cbdata*/
    )
        external override
        onlyHost
        returns (bytes memory)
    {
        // According to the app basic law, we should never revert in a termination callback
        //if (!_isAccepted(_superToken) || !_isCFAv1(_agreementClass)) return _ctx;
        // return _stopExchange(_ctx, _superToken, _agreementId);
    }


    // utilities
    function _isAccepted(ISuperToken _tokenX) private view returns (bool) {
        return address(_tokenX) == address(tokenX);
    }

    function _isCFAv1(address _agreementClass) private pure returns (bool) {
        return ISuperAgreement(_agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(host), "RedirectAll: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken _tokenX, address _agreementClass) {
        require(_isAccepted(_tokenX) , "Exchange: not accepted token");
        require(_isCFAv1(_agreementClass), "Exchange: only CFAv1 supported");
        _;
    }

 }
