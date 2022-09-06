import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import Home from '@/views/Home.vue';
import store from '@/store';
import * as constants from '@/store/constants';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/status/txId/:txId',
    name: 'Status',
    component: () => import(/* webpackChunkName: "transactions" */ '../views/Status.vue'),
    props: (route) => ({ txIdProp: route.params.txId }),
  },
  {
    path: '/status',
    name: 'StatusSearch',
    component: () => import(/* webpackChunkName: "transactions" */ '../views/Status.vue'),
  },
  {
    path: '/pegin',
    name: 'PegIn',
    component: () => import(/* webpackChunkName: "transactions" */ '../views/PegIn.vue'),
  },
  {
    path: '/pegin/:wallet/create',
    name: 'Create',
    component: () => import(/* webpackChunkName: "transactions" */ '../views/Create.vue'),
  },
  {
    path: '/pegin/success/:txId',
    name: 'Success',
    component: () => import(/* webpackChunkName: "transactions" */ '../views/Success.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: EnvironmentAccessorService.getEnvironmentVariables().baseUrl,
  routes,
});
router.beforeResolve((to, from, next) => {
  store.dispatch(`view/${constants.VIEW_ADD_CURRENT_VIEW}`, to.name);
  const inTxFlow = store.getters[`web3Session/${constants.SESSION_IN_TX_FLOW}`];
  if (to.name === 'Create' && !inTxFlow) next({ name: 'Home' });
  else next();
});

export default router;
