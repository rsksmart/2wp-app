import { createLocalVue, mount } from '@vue/test-utils';
import DeviceErrorDialog from '@/common/components/exchange/DeviceErrorDialog.vue';
import Vuetify from 'vuetify';

const localVue = createLocalVue();
let vuetify: typeof Vuetify;

describe('DeviceErrorDialog', () => {
  beforeEach(() => {
    vuetify = new Vuetify();
  });

  it('should emit "closeErrorDialog" event when "Close" button is clicked', async () => {
    const wrapper = mount(DeviceErrorDialog, {
      localVue,
      vuetify,
      propsData: {
        showErrorDialog: true,
        errorMessage: 'Sample error message',
        errorType: '',
        urlToMoreInformation: '',
        messageToUserOnLink: '',
        installationLink: '',
        messageInstallationToUser: '',
      },
    });
    await wrapper.get('#err-dialog-close').trigger('click');
    expect(wrapper.emitted('closeErrorDialog')).toBeTruthy();
  });
});
