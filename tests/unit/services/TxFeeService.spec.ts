describe('TxFeeService: ', () => {
  test.todo('should store a optimal input list given based on fastFee amount');
  test.todo('should add inputs to the optimal input list if the computed value with fee is not enough');
  test.todo('should return the fee of the required amount even if there are no enough balance, and should be the max fee given all utxos');
  test.todo('Should reject the call if there are no utxos stored for that ');
  test.todo('should ensure the fee amount are at least constants.BITCOIN_MIN_SATOSHI_FEE satoshis');
  test.todo('should ensure the fee amount are constants.BITCOIN_MAX_SATOSHI_FEE satoshis at the most');
  test.todo('should ensure the mininum Fee Calculated were based on the environment varibles given');
  test.todo('Should ensure the change output has a higher value than dust environment variable');
});
