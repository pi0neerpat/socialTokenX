pragma solidity ^0.7.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/introspection/ERC1820Implementer.sol";

import {
  ISuperfluid,
  ISuperToken,
  ISuperApp,
  SuperAppDefinitions,
  ISuperAgreement } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

contract SocialTokenX is ERC20, ISuperApp, IERC777Recipient, ERC1820Implementer {
  event TokensReceivedCalled(
      address operator,
      address from,
      address to,
      uint256 amount,
      bytes data,
      bytes operatorData,
      address token,
      uint256 fromBalance,
      uint256 toBalance
  );

  using SafeMath for uint256;

  address payable public creator;

  ISuperfluid private _host;
  IConstantFlowAgreementV1 private _cfa;
  ISuperToken private _acceptedToken;
  ISuperToken private _stx;

  bytes32 constant private _TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
  IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

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
      _approve(address(this), wrapperAddress, totalSupply);
      approve(wrapperAddress, totalSupply);
      // _stx.upgrade(1);
      // _stx.transfer(msg.sender, 1000000*1**18);
  }

  function initialize() public {
    _stx.upgrade(1);
    // _stx.transfer(msg.sender, 1000000*1**18);
  }

  function getERC20Wrapper() public returns (address ERC20Wrapper) {
    return address(_stx);
  }

  /**************************************************************************
   * Enable contract to receive ERC777
  *************************************************************************/

  function recipientFor(address account) public {
      _registerInterfaceForAddress(_TOKENS_RECIPIENT_INTERFACE_HASH, account);

      address self = address(this);
      if (account == self) {
          registerRecipient(self);
      }
  }

  function registerRecipient(address recipient) public {
      _erc1820.setInterfaceImplementer(address(this), _TOKENS_RECIPIENT_INTERFACE_HASH, recipient);
  }

  function tokensReceived(
      address operator,
      address from,
      address to,
      uint256 amount,
      bytes calldata userData,
      bytes calldata operatorData
  ) external override {
      IERC777 token = IERC777(_msgSender());

      uint256 fromBalance = token.balanceOf(from);
      // when called due to burn, to will be the zero address, which will have a balance of 0
      uint256 toBalance = token.balanceOf(to);

      emit TokensReceivedCalled(
          operator,
          from,
          to,
          amount,
          userData,
          operatorData,
          address(token),
          fromBalance,
          toBalance
      );
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
