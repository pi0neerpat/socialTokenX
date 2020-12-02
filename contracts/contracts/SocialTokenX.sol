pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/GSN/Context.sol";

import {
  ISuperfluid,
  ISuperToken,
  ISuperApp,
  SuperAppDefinitions,
  ISuperAgreement } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

contract Emanator is Context, ERC20, ISuperApp {
  using SafeMath for uint256;

  address payable public creator;

  ISuperfluid private _host;
  IConstantFlowAgreementV1 private _cfa;
  ISuperToken private _acceptedToken;

  constructor(
      ISuperfluid host,
      IConstantFlowAgreementV1 cfa,
      ISuperToken acceptedToken
      )
      ERC20 ("SocialTokenX", "STX")
      {
      assert(address(host) != address(0));
      assert(address(cfa) != address(0));
      assert(address(acceptedToken) != address(0));

      _host = host;
      _cfa = cfa;
      _acceptedToken = acceptedToken;

      uint256 configWord =
          SuperAppDefinitions.TYPE_APP_FINAL;
          // SuperAppDefinitions.TYPE_APP_FINAL |
          // SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
          // SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
          // SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

      _host.registerApp(configWord);
  }

/**************************************************************************
 * SuperApp callbacks
*************************************************************************/

     function beforeAgreementCreated(
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
             revert("Unsupported callback - Before Agreement Created");
         }

      function afterAgreementCreated(
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
        revert("Unsupported callback - After Agreement Created");
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
        revert("Unsupported callback - Before Agreement updated");
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
        returns (bytes memory /*cbdata*/)
    {
        revert("Unsupported callback - After Agreement updated");
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
        revert("Unsupported callback -  Before Agreement Terminated");
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
          returns (bytes memory /*cbdata*/)
    {
        revert("Unsupported callback - After Agreement Terminated");
    }

    function _isAcceptedToken(ISuperToken _superToken) private view returns (bool) {
        return address(_superToken) == address(_acceptedToken);
    }

    function _isCFAv1(address _agreementClass) private pure returns (bool) {
        return ISuperAgreement(_agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(_host), "Auction: supports only one host");
        _;
    }

    modifier onlyExpected(ISuperToken _superToken, address _agreementClass) {
        require(_isAcceptedToken(_superToken), "Auction: not accepted token");
        require(_isCFAv1(_agreementClass), "Auction: only CFAv1 supported");
        _;
    }
 }
