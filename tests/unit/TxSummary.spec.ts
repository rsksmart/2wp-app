import { shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import Big from 'big.js';
import TxSummary from '@/components/exchange/TxSummary.vue';
import SatoshiBig from '@/types/SatoshiBig';

const factory = (values = {}) => shallowMount(TxSummary, {
  propsData: { ...values },
});

describe('TxSummary', () => {
  it('Check summary overflow values USD', () => {
    const testCases = [
      {
        txData: {
          amount: new SatoshiBig(500000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(338, 'satoshi'),
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
          amount: new SatoshiBig(196300000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(4338, 'satoshi'),
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
          amount: new SatoshiBig(38000000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(380, 'satoshi'),
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
          amount: new SatoshiBig(380000000, 'satoshi'),
          refundAddress: 'refundAddress',
          recipient: 'recipiendAddress',
          feeBTC: new SatoshiBig(383000, 'satoshi'),
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
      const amountUSD = Big(txSummaryProps.txData.amount.toBTCString())
        .mul(Big(txSummaryProps.price))
        .toFixed(2);
      const feeUSD = Big(txSummaryProps.txData.feeBTC.toBTCString())
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
