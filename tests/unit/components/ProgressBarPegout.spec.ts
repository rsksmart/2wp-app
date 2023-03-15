import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import PegoutProgressBar from '@/components/status/PegoutProgressBar.vue';
import { PegoutStatus } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import sinon from 'sinon';

const localVue = createLocalVue();
let vuetify:any;

describe('progress bar pegout', () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };

  const barColors = {
    blue: '#3D7DA1',
    gray: '#8c8c8c',
    green: '#9CE07B',
    yellow: '#F6C61B',
  };

  beforeEach(() => {
    vuetify = new Vuetify();
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
  });
  afterEach(() => {
    sinon.restore();
  });

  localVue.use(Vuex);

  test.todo('Progress bar SIGNED in Peg Out');
  it('Check SIGNED progress bar', () => {
    const store = new Vuex.Store({
      modules: {
        status: {
          state: {
            txDetails: {
              status: PegoutStatus.SIGNED,
            },
          },
          namespaced: true,
        },
      },
    });

    const wrapper = shallowMount(PegoutProgressBar, {
      store,
      localVue,
      vuetify,
    });

    const progressBar = wrapper.find('#progress-bar-pegout');
    expect(progressBar.props()).toHaveProperty('value', 100);
    expect(progressBar.props()).toHaveProperty('color', barColors.green);
  });

  test.todo('Progress bar REJECTED in Peg Out');
  it('Check REJECTED progress bar', () => {
    const store = new Vuex.Store({
      modules: {
        status: {
          state: {
            txDetails: {
              status: PegoutStatus.REJECTED,
            },
          },
          namespaced: true,
        },
      },
    });

    const wrapper = shallowMount(PegoutProgressBar, {
      store,
      localVue,
      vuetify,
    });

    const progressBar = wrapper.find('#progress-bar-pegout');
    expect(progressBar.props()).toHaveProperty('value', 15);
    expect(progressBar.props()).toHaveProperty('color', barColors.yellow);
  });

  test.todo('Progress bar WAITING_FOR_SIGNATURE in Peg Out');
  it('Check WAITING_FOR_SIGNATURE progress bar', () => {
    const store = new Vuex.Store({
      modules: {
        status: {
          state: {
            txDetails: {
              status: PegoutStatus.WAITING_FOR_SIGNATURE,
            },
          },
          namespaced: true,
        },
      },
    });

    const wrapper = shallowMount(PegoutProgressBar, {
      store,
      localVue,
      vuetify,
    });

    const progressBar = wrapper.find('#progress-bar-pegout');
    expect(progressBar.props()).toHaveProperty('value', 20);
    expect(progressBar.props()).toHaveProperty('color', barColors.blue);
  });

  test.todo('Progress bar WAITING_FOR_CONFIRMATION in Peg Out');
  it('Check WAITING_FOR_CONFIRMATION progress bar', () => {
    const store = new Vuex.Store({
      modules: {
        status: {
          state: {
            txDetails: {
              status: PegoutStatus.WAITING_FOR_CONFIRMATION,
            },
          },
          namespaced: true,
        },
      },
    });

    const wrapper = shallowMount(PegoutProgressBar, {
      store,
      localVue,
      vuetify,
    });

    const progressBar = wrapper.find('#progress-bar-pegout');
    expect(progressBar.props()).toHaveProperty('value', 60);
    expect(progressBar.props()).toHaveProperty('color', barColors.blue);
  });

  test.todo('Progress bar RECEIVED in Peg Out');
  it('Check RECEIVED progress bar', () => {
    const store = new Vuex.Store({
      modules: {
        status: {
          state: {
            txDetails: {
              status: PegoutStatus.RECEIVED,
            },
          },
          namespaced: true,
        },
      },
    });

    const wrapper = shallowMount(PegoutProgressBar, {
      store,
      localVue,
      vuetify,
    });

    const progressBar = wrapper.find('#progress-bar-pegout');
    expect(progressBar.props()).toHaveProperty('value', 30);
    expect(progressBar.props()).toHaveProperty('color', barColors.blue);
  });
});
