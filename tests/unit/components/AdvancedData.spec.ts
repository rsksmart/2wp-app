import { createLocalVue, mount } from '@vue/test-utils';
import AdvancedData from '@/components/exchange/AdvancedData.vue';
import Vuetify from 'vuetify';

const localVue = createLocalVue();
let vuetify: any;

describe('AdvancedData', () => {
  beforeEach(() => {
    vuetify = new Vuetify();
  });
  it('should toggle expanded state when the expand button is clicked', async () => {
    const wrapper = mount(AdvancedData, {
      localVue,
      vuetify,
      propsData: {
        initialExpand: false,
        rawTx: 'Sample raw transaction',
      },
    });

    expect((wrapper.vm as any).expanded).toBe(false);
    await wrapper.find('.btn-focus-out').trigger('click');
    expect((wrapper.vm as any).expanded).toBe(true);
    await wrapper.find('.btn-focus-out').trigger('click');
    expect((wrapper.vm as any).expanded).toBe(false);
  });
});
