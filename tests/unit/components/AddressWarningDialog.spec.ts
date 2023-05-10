import { createLocalVue, mount } from '@vue/test-utils';
import AddressWarningDialog from '@/components/exchange/AddressWarningDialog.vue';
import Vuetify from 'vuetify';

function findByText(wrap: any, selector: string, text: string | RegExp) {
  return wrap.findAll(selector).filter((n: any) => n.text().match(text));
}

const localVue = createLocalVue();
let vuetify: any;

describe('AddressWarningDialog', () => {
  beforeEach(() => {
    vuetify = new Vuetify();
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
