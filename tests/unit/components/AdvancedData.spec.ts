import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import AdvancedData from '@/common/components/exchange/AdvancedData.vue';
import Vuetify from 'vuetify';

const localVue = createLocalVue();
let vuetify: typeof Vuetify;

describe('AdvancedData', () => {
  beforeEach(() => {
    vuetify = new Vuetify();
  });
  it('should toggle expanded state when the expand button is clicked', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper: Wrapper<AdvancedData & {[key: string]: any}> = mount(AdvancedData, {
      localVue,
      vuetify,
      propsData: {
        initialExpand: false,
        rawTx: 'Sample raw transaction',
      },
    });

    expect((wrapper.vm).expanded).toBe(false);
    await wrapper.find('.btn-focus-out').trigger('click');
    expect((wrapper.vm).expanded).toBe(true);
    await wrapper.find('.btn-focus-out').trigger('click');
    expect((wrapper.vm).expanded).toBe(false);
  });
});
