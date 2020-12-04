pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {
  ISuperfluid,
  ISuperToken,
  ISuperApp,
  SuperAppDefinitions,
  ISuperAgreement } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

contract SocialTokenX is ERC20, ISuperApp {
  using SafeMath for uint256;

  address payable public creator;

  ISuperfluid private _host;
  IConstantFlowAgreementV1 private _cfa;
  ISuperToken private _acceptedToken;
  ISuperToken private _stx;

  constructor(
      ISuperfluid host,
      IConstantFlowAgreementV1 cfa,
      ISuperToken acceptedToken,
      uint256 totalSupply
      )
      ERC20 ("SocialToken", "ST")
      {
      assert(address(host) != address(0));
      assert(address(cfa) != address(0));
      assert(address(acceptedToken) != address(0));

      _host = host;
      _cfa = cfa;
      _acceptedToken = acceptedToken;

      uint256 configWord =
          SuperAppDefinitions.TYPE_APP_FINAL |
          SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
          SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
          SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

      _host.registerApp(configWord);
      _host.createERC20Wrapper(
          IERC20(address(this)),
          18,
          "Super SocialToken",
          "STx"
      );

      (address wrapperAddress ,)= _host.getERC20Wrapper(IERC20(address(this)), "STx");
      _stx = ISuperToken(wrapperAddress);

      _mint(address(this), totalSupply);
      approve(wrapperAddress, totalSupply);
      // _approve(address(this), wrapperAddress, totalSupply);
      _stx.upgrade(1);
      // _stx.transfer(msg.sender, 1000000*1**18);
  }

/**************************************************************************
 * SuperApp callbacks
*************************************************************************/

     function beforeAgreementCreated(
         ISuperToken /*superToken*/,
         bytes calldata ctx /*ctx*/,
         address /*agreementClass*/,
         bytes32 /*agreementId*/
     )
         external
         view
         virtual
         override
         returns (bytes memory /*cbdata*/)
     {
          return ctx;
         // revert("Unsupported callback - Before Agreement Created");
     }

      function afterAgreementCreated(
        ISuperToken _uperToken,
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*cbdata*/
    )
        external override
        // onlyExpected(superToken, agreementClass)
        onlyHost
        returns (bytes memory cbdata)
    {
        return ctx;
        // revert("Unsupported callback - After Agreement Created");
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
        ISuperToken superToken,
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*cbdata*/
    )
        external override
        onlyExpected(superToken, agreementClass)
        onlyHost
        returns (bytes memory /*cbdata*/)
    {
        revert("Unsupported callback - After Agreement updated");
    }

    function beforeAgreementTerminated(
        ISuperToken /*superToken*/,
        bytes calldata ctx,
        address /*agreementClass*/,
        bytes32 /*agreementId*/
    )
        external
        view
        virtual
        override
        returns (bytes memory cbdata)
    {
        return ctx;
    }

    function afterAgreementTerminated(
        ISuperToken superToken,
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*cbdata*/
    )
        external override
        onlyHost
        returns (bytes memory cbdata)
    {
        return ctx;
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
