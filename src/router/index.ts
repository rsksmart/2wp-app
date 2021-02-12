import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Exchange from '../views/Exchange.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Exchange',
    component: Exchange,
  },
  {
    path: '/exchange',
    name: 'Exchange',
    component: () => import(/* webpackChunkName: "exchange" */ '../views/Exchange.vue'),
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import(/* webpackChunkName: "transactions" */ '../views/Transactions.vue'),
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import(/* webpackChunkName: "help" */ '../views/Help.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
