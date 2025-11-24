export default [{
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'dest', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'BalanceDecrease',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'dest', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'BalanceIncrease',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }, {
    indexed: false, internalType: 'int256', name: 'errorCode', type: 'int256',
  }],
  name: 'BridgeCapExceeded',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'from', type: 'address',
  }, {
    indexed: true, internalType: 'address', name: 'dest', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'gasLimit', type: 'uint256',
  }, {
    indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
  }, {
    indexed: false, internalType: 'bytes', name: 'data', type: 'bytes',
  }, {
    indexed: false, internalType: 'bool', name: 'success', type: 'bool',
  }, {
    indexed: false, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }],
  name: 'CallForUser',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'from', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'CollateralIncrease',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'DaoFeeSent',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'uint8', name: 'version', type: 'uint8',
  }],
  name: 'Initialized',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'previousOwner', type: 'address',
  }, {
    indexed: true, internalType: 'address', name: 'newOwner', type: 'address',
  }],
  name: 'OwnershipTransferred',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }, {
    indexed: false, internalType: 'int256', name: 'transferredAmount', type: 'int256',
  }],
  name: 'PegInRegistered',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }, {
    indexed: true, internalType: 'address', name: 'sender', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }, {
    indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256',
  }],
  name: 'PegOutDeposit',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }],
  name: 'PegOutRefunded',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }, {
    indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
  }, {
    indexed: false, internalType: 'address', name: 'userAddress', type: 'address',
  }],
  name: 'PegOutUserRefunded',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'from', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'PegoutCollateralIncrease',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'liquidityProvider', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'penalty', type: 'uint256',
  }, {
    indexed: false, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }],
  name: 'Penalized',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'providerAddress', type: 'address',
  }, {
    indexed: false, internalType: 'string', name: 'name', type: 'string',
  }, {
    indexed: false, internalType: 'string', name: 'url', type: 'string',
  }],
  name: 'ProviderUpdate',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'dest', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }, {
    indexed: false, internalType: 'bool', name: 'success', type: 'bool',
  }, {
    indexed: false, internalType: 'bytes32', name: 'quoteHash', type: 'bytes32',
  }],
  name: 'Refund',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'uint256', name: 'id', type: 'uint256',
  }, {
    indexed: true, internalType: 'address', name: 'from', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'Register',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'from', type: 'address',
  }],
  name: 'Resigned',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'from', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'WithdrawCollateral',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'address', name: 'from', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256',
  }],
  name: 'Withdrawal',
  type: 'event',
}, {
  inputs: [], name: 'BRIDGE_GENERIC_ERROR', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_REFUNDED_LP_ERROR_CODE', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_REFUNDED_USER_ERROR_CODE', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_UNPROCESSABLE_TX_ALREADY_PROCESSED_ERROR_CODE', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_UNPROCESSABLE_TX_INVALID_SENDER_ERROR_CODE', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_UNPROCESSABLE_TX_NOT_CONTRACT_ERROR_CODE', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_UNPROCESSABLE_TX_UTXO_AMOUNT_SENT_BELOW_MINIMUM_ERROR', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_UNPROCESSABLE_TX_VALIDATIONS_ERROR', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'BRIDGE_UNPROCESSABLE_TX_VALUE_ZERO_ERROR', outputs: [{ internalType: 'int16', name: '', type: 'int16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'CALL_DONE_CODE', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'MAX_CALL_GAS_COST', outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'MAX_REFUND_GAS_LIMIT', outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'PAY_TO_ADDRESS_OUTPUT', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'PROCESSED_QUOTE_CODE', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'QUOTE_HASH_OUTPUT', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'UNPROCESSED_QUOTE_CODE', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'bridge', outputs: [{ internalType: 'contract Bridge', name: '', type: 'address' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'daoFeeCollectorAddress', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'productFeePercentage', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'providerId', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }], name: 'transferOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, { stateMutability: 'payable', type: 'receive', payable: true }, {
  inputs: [{ internalType: 'uint256', name: '_providerId', type: 'uint256' }, { internalType: 'bool', name: 'status', type: 'bool' }], name: 'setProviderStatus', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'getProviderIds', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'getBridgeAddress', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'getMinCollateral', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'getMinPegIn', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'getRewardPercentage', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'getResignDelayBlocks', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [], name: 'getDustThreshold', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [{ internalType: 'bytes32', name: 'quoteHash', type: 'bytes32' }], name: 'isPegOutQuoteCompleted', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [{ internalType: 'address', name: 'addr', type: 'address' }], name: 'isOperational', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [{ internalType: 'address', name: 'addr', type: 'address' }], name: 'isOperationalForPegout', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [{ internalType: 'string', name: '_name', type: 'string' }, { internalType: 'string', name: '_apiBaseUrl', type: 'string' }, { internalType: 'bool', name: '_status', type: 'bool' }, { internalType: 'string', name: '_providerType', type: 'string' }], name: 'register', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'payable', type: 'function', payable: true,
}, {
  inputs: [],
  name: 'getProviders',
  outputs: [{
    components: [{ internalType: 'uint256', name: 'id', type: 'uint256' }, { internalType: 'address', name: 'provider', type: 'address' }, { internalType: 'string', name: 'name', type: 'string' }, { internalType: 'string', name: 'apiBaseUrl', type: 'string' }, { internalType: 'bool', name: 'status', type: 'bool' }, { internalType: 'string', name: 'providerType', type: 'string' }], internalType: 'struct LiquidityBridgeContractV2.LiquidityProvider[]', name: '', type: 'tuple[]',
  }],
  stateMutability: 'view',
  type: 'function',
  constant: true,
}, {
  inputs: [{ internalType: 'address', name: 'providerAddress', type: 'address' }],
  name: 'getProvider',
  outputs: [{
    components: [{ internalType: 'uint256', name: 'id', type: 'uint256' }, { internalType: 'address', name: 'provider', type: 'address' }, { internalType: 'string', name: 'name', type: 'string' }, { internalType: 'string', name: 'apiBaseUrl', type: 'string' }, { internalType: 'bool', name: 'status', type: 'bool' }, { internalType: 'string', name: 'providerType', type: 'string' }], internalType: 'struct LiquidityBridgeContractV2.LiquidityProvider', name: '', type: 'tuple',
  }],
  stateMutability: 'view',
  type: 'function',
  constant: true,
}, {
  inputs: [], name: 'addCollateral', outputs: [], stateMutability: 'payable', type: 'function', payable: true,
}, {
  inputs: [], name: 'addPegoutCollateral', outputs: [], stateMutability: 'payable', type: 'function', payable: true,
}, {
  inputs: [], name: 'deposit', outputs: [], stateMutability: 'payable', type: 'function', payable: true,
}, {
  inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'withdraw', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'withdrawCollateral', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'resign', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'addr', type: 'address' }], name: 'getCollateral', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [{ internalType: 'address', name: 'addr', type: 'address' }], name: 'getPegoutCollateral', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [{ internalType: 'address', name: 'addr', type: 'address' }], name: 'getBalance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function', constant: true,
}, {
  inputs: [{
    components: [{ internalType: 'bytes20', name: 'fedBtcAddress', type: 'bytes20' }, { internalType: 'address', name: 'lbcAddress', type: 'address' }, { internalType: 'address', name: 'liquidityProviderRskAddress', type: 'address' }, { internalType: 'bytes', name: 'btcRefundAddress', type: 'bytes' }, { internalType: 'address payable', name: 'rskRefundAddress', type: 'address' }, { internalType: 'bytes', name: 'liquidityProviderBtcAddress', type: 'bytes' }, { internalType: 'uint256', name: 'callFee', type: 'uint256' }, { internalType: 'uint256', name: 'penaltyFee', type: 'uint256' }, { internalType: 'address', name: 'contractAddress', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'uint32', name: 'gasLimit', type: 'uint32' }, { internalType: 'int64', name: 'nonce', type: 'int64' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint32', name: 'agreementTimestamp', type: 'uint32' }, { internalType: 'uint32', name: 'timeForDeposit', type: 'uint32' }, { internalType: 'uint32', name: 'callTime', type: 'uint32' }, { internalType: 'uint16', name: 'depositConfirmations', type: 'uint16' }, { internalType: 'bool', name: 'callOnRegister', type: 'bool' }, { internalType: 'uint256', name: 'productFeeAmount', type: 'uint256' }, { internalType: 'uint256', name: 'gasFee', type: 'uint256' }], internalType: 'struct QuotesV2.PeginQuote', name: 'quote', type: 'tuple',
  }],
  name: 'callForUser',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'payable',
  type: 'function',
  payable: true,
}, {
  inputs: [{
    components: [{ internalType: 'bytes20', name: 'fedBtcAddress', type: 'bytes20' }, { internalType: 'address', name: 'lbcAddress', type: 'address' }, { internalType: 'address', name: 'liquidityProviderRskAddress', type: 'address' }, { internalType: 'bytes', name: 'btcRefundAddress', type: 'bytes' }, { internalType: 'address payable', name: 'rskRefundAddress', type: 'address' }, { internalType: 'bytes', name: 'liquidityProviderBtcAddress', type: 'bytes' }, { internalType: 'uint256', name: 'callFee', type: 'uint256' }, { internalType: 'uint256', name: 'penaltyFee', type: 'uint256' }, { internalType: 'address', name: 'contractAddress', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'uint32', name: 'gasLimit', type: 'uint32' }, { internalType: 'int64', name: 'nonce', type: 'int64' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint32', name: 'agreementTimestamp', type: 'uint32' }, { internalType: 'uint32', name: 'timeForDeposit', type: 'uint32' }, { internalType: 'uint32', name: 'callTime', type: 'uint32' }, { internalType: 'uint16', name: 'depositConfirmations', type: 'uint16' }, { internalType: 'bool', name: 'callOnRegister', type: 'bool' }, { internalType: 'uint256', name: 'productFeeAmount', type: 'uint256' }, { internalType: 'uint256', name: 'gasFee', type: 'uint256' }], internalType: 'struct QuotesV2.PeginQuote', name: 'quote', type: 'tuple',
  }, { internalType: 'bytes', name: 'signature', type: 'bytes' }, { internalType: 'bytes', name: 'btcRawTransaction', type: 'bytes' }, { internalType: 'bytes', name: 'partialMerkleTree', type: 'bytes' }, { internalType: 'uint256', name: 'height', type: 'uint256' }],
  name: 'registerPegIn',
  outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
  stateMutability: 'nonpayable',
  type: 'function',
}, {
  inputs: [{
    components: [{ internalType: 'address', name: 'lbcAddress', type: 'address' }, { internalType: 'address', name: 'lpRskAddress', type: 'address' }, { internalType: 'bytes', name: 'btcRefundAddress', type: 'bytes' }, { internalType: 'address', name: 'rskRefundAddress', type: 'address' }, { internalType: 'bytes', name: 'lpBtcAddress', type: 'bytes' }, { internalType: 'uint256', name: 'callFee', type: 'uint256' }, { internalType: 'uint256', name: 'penaltyFee', type: 'uint256' }, { internalType: 'int64', name: 'nonce', type: 'int64' }, { internalType: 'bytes', name: 'deposityAddress', type: 'bytes' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint32', name: 'agreementTimestamp', type: 'uint32' }, { internalType: 'uint32', name: 'depositDateLimit', type: 'uint32' }, { internalType: 'uint16', name: 'depositConfirmations', type: 'uint16' }, { internalType: 'uint16', name: 'transferConfirmations', type: 'uint16' }, { internalType: 'uint32', name: 'transferTime', type: 'uint32' }, { internalType: 'uint32', name: 'expireDate', type: 'uint32' }, { internalType: 'uint32', name: 'expireBlock', type: 'uint32' }, { internalType: 'uint256', name: 'productFeeAmount', type: 'uint256' }, { internalType: 'uint256', name: 'gasFee', type: 'uint256' }], internalType: 'struct QuotesV2.PegOutQuote', name: 'quote', type: 'tuple',
  }, { internalType: 'bytes', name: 'signature', type: 'bytes' }],
  name: 'depositPegout',
  outputs: [],
  stateMutability: 'payable',
  type: 'function',
  payable: true,
}, {
  inputs: [{ internalType: 'bytes32', name: 'quoteHash', type: 'bytes32' }], name: 'refundUserPegOut', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{ internalType: 'bytes32', name: 'quoteHash', type: 'bytes32' }, { internalType: 'bytes', name: 'btcTx', type: 'bytes' }, { internalType: 'bytes32', name: 'btcBlockHeaderHash', type: 'bytes32' }, { internalType: 'uint256', name: 'partialMerkleTree', type: 'uint256' }, { internalType: 'bytes32[]', name: 'merkleBranchHashes', type: 'bytes32[]' }], name: 'refundPegOut', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{
    components: [{ internalType: 'bytes20', name: 'fedBtcAddress', type: 'bytes20' }, { internalType: 'address', name: 'lbcAddress', type: 'address' }, { internalType: 'address', name: 'liquidityProviderRskAddress', type: 'address' }, { internalType: 'bytes', name: 'btcRefundAddress', type: 'bytes' }, { internalType: 'address payable', name: 'rskRefundAddress', type: 'address' }, { internalType: 'bytes', name: 'liquidityProviderBtcAddress', type: 'bytes' }, { internalType: 'uint256', name: 'callFee', type: 'uint256' }, { internalType: 'uint256', name: 'penaltyFee', type: 'uint256' }, { internalType: 'address', name: 'contractAddress', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'uint32', name: 'gasLimit', type: 'uint32' }, { internalType: 'int64', name: 'nonce', type: 'int64' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint32', name: 'agreementTimestamp', type: 'uint32' }, { internalType: 'uint32', name: 'timeForDeposit', type: 'uint32' }, { internalType: 'uint32', name: 'callTime', type: 'uint32' }, { internalType: 'uint16', name: 'depositConfirmations', type: 'uint16' }, { internalType: 'bool', name: 'callOnRegister', type: 'bool' }, { internalType: 'uint256', name: 'productFeeAmount', type: 'uint256' }, { internalType: 'uint256', name: 'gasFee', type: 'uint256' }], internalType: 'struct QuotesV2.PeginQuote', name: 'quote', type: 'tuple',
  }, { internalType: 'bytes', name: 'depositAddress', type: 'bytes' }],
  name: 'validatePeginDepositAddress',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
  constant: true,
}, {
  inputs: [{
    components: [{ internalType: 'bytes20', name: 'fedBtcAddress', type: 'bytes20' }, { internalType: 'address', name: 'lbcAddress', type: 'address' }, { internalType: 'address', name: 'liquidityProviderRskAddress', type: 'address' }, { internalType: 'bytes', name: 'btcRefundAddress', type: 'bytes' }, { internalType: 'address payable', name: 'rskRefundAddress', type: 'address' }, { internalType: 'bytes', name: 'liquidityProviderBtcAddress', type: 'bytes' }, { internalType: 'uint256', name: 'callFee', type: 'uint256' }, { internalType: 'uint256', name: 'penaltyFee', type: 'uint256' }, { internalType: 'address', name: 'contractAddress', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'uint32', name: 'gasLimit', type: 'uint32' }, { internalType: 'int64', name: 'nonce', type: 'int64' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint32', name: 'agreementTimestamp', type: 'uint32' }, { internalType: 'uint32', name: 'timeForDeposit', type: 'uint32' }, { internalType: 'uint32', name: 'callTime', type: 'uint32' }, { internalType: 'uint16', name: 'depositConfirmations', type: 'uint16' }, { internalType: 'bool', name: 'callOnRegister', type: 'bool' }, { internalType: 'uint256', name: 'productFeeAmount', type: 'uint256' }, { internalType: 'uint256', name: 'gasFee', type: 'uint256' }], internalType: 'struct QuotesV2.PeginQuote', name: 'quote', type: 'tuple',
  }],
  name: 'hashQuote',
  outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
  stateMutability: 'view',
  type: 'function',
  constant: true,
}, {
  inputs: [{
    components: [{ internalType: 'address', name: 'lbcAddress', type: 'address' }, { internalType: 'address', name: 'lpRskAddress', type: 'address' }, { internalType: 'bytes', name: 'btcRefundAddress', type: 'bytes' }, { internalType: 'address', name: 'rskRefundAddress', type: 'address' }, { internalType: 'bytes', name: 'lpBtcAddress', type: 'bytes' }, { internalType: 'uint256', name: 'callFee', type: 'uint256' }, { internalType: 'uint256', name: 'penaltyFee', type: 'uint256' }, { internalType: 'int64', name: 'nonce', type: 'int64' }, { internalType: 'bytes', name: 'deposityAddress', type: 'bytes' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint32', name: 'agreementTimestamp', type: 'uint32' }, { internalType: 'uint32', name: 'depositDateLimit', type: 'uint32' }, { internalType: 'uint16', name: 'depositConfirmations', type: 'uint16' }, { internalType: 'uint16', name: 'transferConfirmations', type: 'uint16' }, { internalType: 'uint32', name: 'transferTime', type: 'uint32' }, { internalType: 'uint32', name: 'expireDate', type: 'uint32' }, { internalType: 'uint32', name: 'expireBlock', type: 'uint32' }, { internalType: 'uint256', name: 'productFeeAmount', type: 'uint256' }, { internalType: 'uint256', name: 'gasFee', type: 'uint256' }], internalType: 'struct QuotesV2.PegOutQuote', name: 'quote', type: 'tuple',
  }],
  name: 'hashPegoutQuote',
  outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
  stateMutability: 'view',
  type: 'function',
  constant: true,
}, {
  inputs: [{ internalType: 'string', name: '_name', type: 'string' }, { internalType: 'string', name: '_url', type: 'string' }], name: 'updateProvider', outputs: [], stateMutability: 'nonpayable', type: 'function',
}];
