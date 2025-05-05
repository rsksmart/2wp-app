import {
  createRouter, createWebHistory, NavigationGuardNext,
  RouteLocationNormalized, RouteRecordRaw,
} from 'vue-router';
import { useStore } from 'vuex';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import Home from '@/common/views/Home.vue';
import { isMobileDevice } from '@/common/utils';

async function checkAcceptedTerms(
  from: RouteLocationNormalized,
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const store = useStore();
  if (store.state.web3Session.acceptedTerms) {
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

function checkForMobileDevice(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  if (isMobileDevice()) {
    next({ name: 'StatusSearch' });
  } else {
    next();
  }
}

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: [checkForMobileDevice],
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
    beforeEnter: [checkForMobileDevice, checkAcceptedTerms],
  },
  {
    path: '/pegout',
    name: 'PegOut',
    component: () => import(/* webpackChunkName: "pegout" */ '../../pegout/views/PegOut.vue'),
    beforeEnter: [checkAcceptedTerms, checkForMobileDevice],
  },
  {
    path: '/pegin/:wallet/create',
    name: 'Create',
    component: () => import(/* webpackChunkName: "pegin-create" */ '../../pegin/views/Create.vue'),
    beforeEnter: [checkAcceptedTerms, checkFromRoute, checkForMobileDevice],
  },
  {
    path: '/:type/success/tx/:txId/:amount/:confirmations',
    name: 'SuccessTx',
    component: () => import(/* webpackChunkName: "tx-success" */ '../views/SuccessTx.vue'),
    props: (route) => ({
      type: route.params.type,
      txId: route.params.txId,
      amount: route.params.amount,
      confirmations: route.params.confirmations,
    }),
    beforeEnter: [checkFromRoute, checkForMobileDevice],
  },
];

const history = createWebHistory(EnvironmentAccessorService.getEnvironmentVariables().baseUrl);

const router = createRouter({
  history,
  routes,
});

export default router;
