import sinon from 'sinon';
import axios from 'axios';
import { SatoshiBig, Utxo } from '@/common/types';
import { TxFeeService } from '@/pegin/services';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

const API_URL = 'https://api.url';

function setEnvironment() {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
    vueAppRskNodeHost: '',
    vueAppApiBaseUrl: API_URL,
    miningSpeedBlock: { fast: 1, average: 6, slow: 12 },
    minFeeSatPerByte: { fast: 100, average: 80, slow: 20 },
  };
  EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
}

describe('Tx Fee Service', () => {
  const axiosMock = sinon.stub(axios);
  beforeEach(setEnvironment);
  afterEach(() => {
    sinon.restore();
  });

  const totalUtxoList1 = [
    {
      txid: 'txId1',
      amount: 100000,
      address: 'address1',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
    {
      txid: 'txId2',
      amount: 100000,
      address: 'address2',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
    {
      txid: 'txId3',
      amount: 100000,
      address: 'address3',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
    {
      txid: 'txId4',
      amount: 100000,
      address: 'address4',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
  ];

  const totalUtxoList2 = [
    {
      txid: 'txId1',
      amount: 100000,
      address: 'address1',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
    {
      txid: 'txId2',
      amount: 100000,
      address: 'address2',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
    {
      txid: 'txId3',
      amount: 100000,
      address: 'address3',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
    {
      txid: 'txId4',
      amount: 100000,
      address: 'address4',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
    {
      txid: 'txId5',
      amount: 501,
      address: 'address4',
      path: 'path',
      derivationArray: [],
      vout: 0,
    },
  ];

  it(`should ensure the fee amount are at least ${constants.BITCOIN_MIN_SATOSHI_FEE} satoshis`, () => {
    const lowerFee = new SatoshiBig('260', 'satoshi');
    const checkedAvg = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .checkFeeBoundaries(lowerFee)).toSatoshiString();

    expect(checkedAvg).toBe('280');
  });

  it(`should ensure the fee amount is between ${constants.BITCOIN_MIN_SATOSHI_FEE} and ${constants.BITCOIN_MAX_SATOSHI_FEE}`, () => {
    const lowerFee = new SatoshiBig('6000', 'satoshi');
    const checkedAvg = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .checkFeeBoundaries(lowerFee)).toSatoshiString();

    expect(checkedAvg).toBe('6000');
  });

  it(`should ensure the fee amount are ${constants.BITCOIN_MAX_SATOSHI_FEE} satoshis at the most`, () => {
    const lowerFee = new SatoshiBig('5000001', 'satoshi');
    const checkedAvg = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .checkFeeBoundaries(lowerFee)).toSatoshiString();

    expect(checkedAvg).toBe('5000000');
  });

  it('should ensure the mininum Fee Calculated were based on the environment variables given', () => {
    const feeLevelSlow = constants.BITCOIN_SLOW_FEE_LEVEL;
    const feeLevelAvg = constants.BITCOIN_AVERAGE_FEE_LEVEL;
    const feeLevelFast = constants.BITCOIN_FAST_FEE_LEVEL;

    const feeFromService1 = new SatoshiBig('10', 'satoshi');
    const checkedFeePerKb1 = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .getCheckedFeePerByte(feeFromService1, feeLevelSlow)).toSatoshiString();

    const feeFromService2 = new SatoshiBig('18', 'satoshi');
    const checkedFeePerKb2 = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .getCheckedFeePerByte(feeFromService2, feeLevelSlow)).toSatoshiString();

    const feeFromService3 = new SatoshiBig('50', 'satoshi');
    const checkedFeePerKb3 = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .getCheckedFeePerByte(feeFromService3, feeLevelAvg)).toSatoshiString();

    const feeFromService4 = new SatoshiBig('85', 'satoshi');
    const checkedFeePerKb4 = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .getCheckedFeePerByte(feeFromService4, feeLevelAvg)).toSatoshiString();

    const feeFromService5 = new SatoshiBig('98', 'satoshi');
    const checkedFeePerKb5 = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .getCheckedFeePerByte(feeFromService5, feeLevelFast)).toSatoshiString();

    const feeFromService6 = new SatoshiBig('110', 'satoshi');
    const checkedFeePerKb6 = (TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .getCheckedFeePerByte(feeFromService6, feeLevelFast)).toSatoshiString();

    expect(checkedFeePerKb1).toBe('20');
    expect(checkedFeePerKb2).toBe('20');

    expect(checkedFeePerKb3).toBe('80');
    expect(checkedFeePerKb4).toBe('85');

    expect(checkedFeePerKb5).toBe('100');
    expect(checkedFeePerKb6).toBe('110');
  });

  it('should reject the call if there are no utxos stored for that', () => {
    const amountToTransfer = new SatoshiBig('10000', 'satoshi');
    const feePerByte = new SatoshiBig('1000', 'satoshi');
    const totalUtxoList: Utxo[] = [];

    expect(() => TxFeeService.getTxFee(amountToTransfer, totalUtxoList, feePerByte)).toThrowError('Empty utxo list.');
  });

  it('should return the fee of the required amount even if there is no enough balance, and should be the max fee given all utxos', async () => {
    const amountToTransfer = new SatoshiBig('403755', 'satoshi');
    const feeLevel = constants.BITCOIN_AVERAGE_FEE_LEVEL;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const blockNumber = TxFeeService.getMiningSpeedBlock(feeLevel);
    const feePerByte = new SatoshiBig('0.0000001', 'btc');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const checkedFeePerByte = TxFeeService.getCheckedFeePerByte(feePerByte, feeLevel);

    const baseFee = checkedFeePerByte
      .mul(constants.BITCOIN_TX_HEADER_SIZE_IN_BYTES
      + (constants.BITCOIN_TX_OUTPUT_SIZE_IN_BYTES * constants.PEGIN_OUTPUTS));

    const feePerInput = checkedFeePerByte
      .mul(constants.BITCOIN_TX_INPUT_SIZE_IN_BYTES);

    const { selectedUtxoList } = TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .selectOptimalInputs(totalUtxoList1, amountToTransfer, baseFee, feePerInput);

    const totalFeeToPay = TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .checkFeeBoundaries(baseFee.plus(feePerInput.mul(selectedUtxoList.length)));

    const satoshiBigApiResponse = { data: '0.0000001' };
    axiosMock
      .get
      .withArgs(`${API_URL}/estimate-fee/${blockNumber}`)
      .resolves(satoshiBigApiResponse);

    const response = TxFeeService.getTxFee(amountToTransfer, totalUtxoList1, checkedFeePerByte);
    const { amount, enoughBalance, selectedUtxoList: selectedUtxoListResponse } = response;

    expect(enoughBalance)
      .toEqual(false);
    expect(amount)
      .toEqual(totalFeeToPay);
    expect(selectedUtxoListResponse)
      .toEqual(totalUtxoList1);
  });

  it('should add inputs to the optimal input list if the computed value with fee is not enough', async () => {
    const amountToTransfer1 = new SatoshiBig('397000', 'satoshi');
    const amountToTransfer2 = new SatoshiBig('397001', 'satoshi');
    const baseFee = new SatoshiBig('1000', 'satoshi');
    const feePerInput = new SatoshiBig('500', 'satoshi');

    const selectedOptimalInputs1 = TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .selectOptimalInputs(totalUtxoList1, amountToTransfer1, baseFee, feePerInput);

    const selectedOptimalInputs11 = TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .selectOptimalInputs(totalUtxoList2, amountToTransfer1, baseFee, feePerInput);

    const selectedOptimalInputs2 = TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .selectOptimalInputs(totalUtxoList1, amountToTransfer2, baseFee, feePerInput);

    const selectedOptimalInputs3 = TxFeeService
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      .selectOptimalInputs(totalUtxoList2, amountToTransfer2, baseFee, feePerInput);

    const selectedUtxoList1 = selectedOptimalInputs1.selectedUtxoList;
    const enoughBalance1 = selectedOptimalInputs1.enoughBalance;

    const selectedUtxoList11 = selectedOptimalInputs11.selectedUtxoList;
    const enoughBalance11 = selectedOptimalInputs11.enoughBalance;

    const selectedUtxoList2 = selectedOptimalInputs2.selectedUtxoList;
    const enoughBalance2 = selectedOptimalInputs2.enoughBalance;

    const selectedUtxoList3 = selectedOptimalInputs3.selectedUtxoList;
    const enoughBalance3 = selectedOptimalInputs3.enoughBalance;

    // enoughBalance selecting optimal == all utxos
    expect(selectedUtxoList1).toEqual(totalUtxoList1);
    expect(enoughBalance1).toEqual(true);

    // enoughBalance selecting optimal != all utxos
    expect(selectedUtxoList11).toEqual(totalUtxoList1);
    expect(enoughBalance11).toEqual(true);

    // not enoughBalance selecting optimal == all utxos
    expect(selectedUtxoList2).toEqual(totalUtxoList1);
    expect(enoughBalance2).toEqual(false);

    // enoughBalance selecting optimal == all utxos
    expect(selectedUtxoList3).toEqual(totalUtxoList2);
    expect(enoughBalance3).toEqual(true);
  });
});
