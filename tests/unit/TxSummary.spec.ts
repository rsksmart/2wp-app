import { shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import Big from 'big.js';
import TxSummary from '@/components/exchange/TxSummary.vue';

const factory = (values = {}) => shallowMount(TxSummary, {
  propsData: { ...values },
});

describe('TxSummary', () => {
  it('Check summary overflow values USD', () => {
    const testCases = [
      {
        txData: {
          amount: 500000,
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: 0.00000338,
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
      {
        txData: {
          amount: 196300000,
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: 0.00004338,
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
      {
        txData: {
          amount: 38000000,
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: 0.0000038,
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
      {
        txData: {
          amount: 380000000,
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: 0.00383,
          change: 'ChangeAaddress',
        },
        price: 41671,
        txId: '',
        showTxId: false,
        initialExpand: false,
        rskFederationAddress: 'addr',
      },
    ];
    testCases.forEach((txSummaryProps) => {
      const wrapper = factory(txSummaryProps);
      const amountUSD = Big(txSummaryProps.txData.amount.toString())
        .div(100_000_000)
        .mul(Big(txSummaryProps.price))
        .toFixed(2);
      const feeUSD = Big(txSummaryProps.txData.feeBTC.toString())
        .mul(Big(txSummaryProps.price))
        .toFixed(2);
      const totalUSD = Big(feeUSD).plus(Big(amountUSD))
        .toFixed(2);
      expect(wrapper.find('#amount-usd').text()).to.eql(`USD $ ${amountUSD}`);
      expect(wrapper.find('#fee-usd').text()).to.eql(`USD $ ${feeUSD}`);
      expect(wrapper.find('#total-usd').text()).to.eql(`USD $ ${totalUSD}`);
    });
  });
});
