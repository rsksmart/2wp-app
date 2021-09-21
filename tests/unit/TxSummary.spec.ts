import { shallowMount } from '@vue/test-utils';
import { expect } from 'chai';
import TxSummary from '@/components/exchange/TxSummary.vue';

const factory = (values = {}) => shallowMount(TxSummary, {
  propsData: { ...values },
});

describe('TxSummary', () => {
  it('Shows summary title', () => {
    const wrapper = factory({
      txData: {
        amount: 10000,
        refundAddress: 'refundAddress',
        recipient: 'recipiendAddress',
        feeBTC: 1500,
        change: 'ChangeAaddress',
      },
      price: 1566,
      txId: '',
      showTxId: false,
      initialExpand: false,
      rskFederationAddress: 'addr',
    });
    expect(wrapper.find('.tx-text').text()).to.eql('Transaction summary:');
  });
});
