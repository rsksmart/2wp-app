import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import AddressWarningDialog from '@/common/components/exchange/AddressWarningDialog.vue';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import Vuetify from 'vuetify';

function findByText(wrap: Wrapper<Vue>, selector: string, text: string | RegExp) {
  return wrap.findAll(selector).filter((n: Wrapper<Vue>) => n.text().match(text));
}

const localVue = createLocalVue();
let vuetify: typeof Vuetify;

describe('AddressWarningDialog', () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  beforeEach(() => {
    vuetify = new Vuetify();
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  });
  it('should emit "continue" event when "continue" button is clicked', () => {
    const wrapper = mount(AddressWarningDialog, {
      localVue,
      vuetify,
      propsData: {
        showDialog: true,
        address: 'InvalidAddress',
      },
    });

    const button = findByText(wrapper, 'button', /continue/).at(0);
    button.trigger('click');
    expect(wrapper.emitted('continue')).toBeTruthy();
  });

  it('should emit "cancel" event when "cancel" button is clicked', () => {
    const wrapper = mount(AddressWarningDialog, {
      localVue,
      vuetify,
      propsData: {
        showDialog: true,
        address: 'InvalidAddress',
      },
    });

    const button = findByText(wrapper, 'button', /cancel/).at(0);
    button.trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
