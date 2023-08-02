import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
// import Home from '@/common/views/Home.vue';
import Test from '@/common/views/Test.vue';
import * as constants from '@/common/store/constants';
// import {useStore} from "vuex";


const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    name: 'Test',
    component: Test,
  }
  // {
  //   path: '/',
  //   name: 'Home',
  //   component: Home,
  // },
  // {
  //   path: '/status/txId/:txId',
  //   name: 'Status',
  //   component: () => import(/* webpackChunkName: "transactions" */ '../../status/views/Status.vue'),
  //   props: (route) => ({ txIdProp: route.params.txId }),
  // },
  // {
  //   path: '/status',
  //   name: 'StatusSearch',
  //   component: () => import(/* webpackChunkName: "status" */ '../../status/views/Status.vue'),
  // },
  // {
  //   path: '/pegin',
  //   name: 'PegIn',
  //   component: () => import(/* webpackChunkName: "transactions" */ '../../pegin/views/PegIn.vue'),
  // },
  // {
  //   path: '/pegout',
  //   name: 'PegOut',
  //   component: () => import(/* webpackChunkName: "pegout" */ '../../pegout/views/PegOut.vue'),
  // },
  // {
  //   path: '/pegin/:wallet/create',
  //   name: 'Create',
  //   component: () => import(/* webpackChunkName: "pegin-create" */ '../../pegin/views/Create.vue'),
  // },
  // {
  //   path: '/pegin/success/:txId',
  //   name: 'Success',
  //   component: () => import(/* webpackChunkName: "transactions" */ '../../pegin/views/Success.vue'),
  // },
];

const history = createWebHistory();

const router = createRouter({
  history,
  routes,
});

// const router = new VueRouter({
//   mode: 'history',
//   base: EnvironmentAccessorService.getEnvironmentVariables().baseUrl,
//   routes,
// });

// router.beforeResolve((to, from, next) => {
//   const store = useStore();
//   store.dispatch(`view/${constants.VIEW_ADD_CURRENT_VIEW}`, to.name);
//   const inTxFlow = store.getters[`web3Session/${constants.SESSION_IN_TX_FLOW}`];
//   if (to.name === 'Create' && !inTxFlow) next({ name: 'Home' });
//   else next();
// });

export default router;
