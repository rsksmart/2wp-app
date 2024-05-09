import {
  createRouter, createWebHistory, NavigationGuardNext,
  RouteLocationNormalized, RouteRecordRaw,
} from 'vue-router';
import { useStore } from 'vuex';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import Home from '@/common/views/Home.vue';
import * as constants from '@/common/store/constants';

async function checkAcceptedTerms(
  from: RouteLocationNormalized,
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const store = useStore();
  if (store.state.web3Session.acceptedTerms === undefined) {
    await store.dispatch(`web3Session/${constants.SESSION_ADD_TERMS_AND_CONDITIONS_ENABLED}`);
  }
  if (
    !store.state.web3Session.termsAndConditionsEnabled
    || (store.state.web3Session.termsAndConditionsEnabled && store.state.web3Session.acceptedTerms)
  ) {
    next();
  } else {
    next({ name: 'Home' });
  }
}

// eslint-disable-next-line consistent-return
function checkFromRoute(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const peg = to.path.split('/')[1];
  if (from.path === '/') {
    return { path: `/${peg}` };
  }
}

function checkRSKConnection(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const store = useStore();
  if (!store.getters[`web3Session/${constants.SESSION_IS_ACCOUNT_CONNECTED}`]) {
    next({ name: 'Home' });
  } else {
    next();
  }
}

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/status/txId/:txId',
    name: 'Status',
    component: () => import(/* webpackChunkName: "status" */ '../../status/views/Status.vue'),
    props: (route) => ({ txIdProp: route.params.txId }),
  },
  {
    path: '/status',
    name: 'StatusSearch',
    component:
      () => import(/* webpackChunkName: "status-search" */ '../../status/views/Status.vue'),
  },
  {
    path: '/pegin',
    name: 'PegIn',
    component: () => import(/* webpackChunkName: "pegin" */ '../../pegin/views/PegIn.vue'),
    beforeEnter: [checkAcceptedTerms, checkRSKConnection],
  },
  {
    path: '/pegout',
    name: 'PegOut',
    component: () => import(/* webpackChunkName: "pegout" */ '../../pegout/views/PegOut.vue'),
    beforeEnter: [checkAcceptedTerms, checkRSKConnection],
  },
  {
    path: '/pegout/:type/:wallet/success',
    name: 'PegOutSuccess',
    component: () => import(/* webpackChunkName: "pegout-success" */ '../../pegout/views/SuccessPegout.vue'),
    props: (route) => ({
      type: route.params.type,
    }),
    beforeEnter: [checkFromRoute],
  },
  {
    path: '/pegin/:wallet/create',
    name: 'Create',
    component: () => import(/* webpackChunkName: "pegin-create" */ '../../pegin/views/Create.vue'),
    beforeEnter: checkAcceptedTerms,
  },
  {
    path: '/pegin/:wallet/success/:txId',
    name: 'Success',
    component:
      () => import(/* webpackChunkName: "pegin-success" */ '../../pegin/views/Success.vue'),
    beforeEnter: [checkFromRoute],
  },
  {
    path: '/tx/success',
    name: 'SuccessTx',
    component: () => import(/* webpackChunkName: "tx-success" */ '../views/SuccessTx.vue'),
  },
];

const history = createWebHistory(EnvironmentAccessorService.getEnvironmentVariables().baseUrl);

const router = createRouter({
  history,
  routes,
});

router.beforeResolve((to, from, next) => {
  const store = useStore();
  store.dispatch(`view/${constants.VIEW_ADD_CURRENT_VIEW}`, to.name);
  const inTxFlow = store.getters[`web3Session/${constants.SESSION_IN_TX_FLOW}`];
  if (to.name === 'Create' && !inTxFlow) next({ name: 'Home' });
  else next();
});

export default router;
