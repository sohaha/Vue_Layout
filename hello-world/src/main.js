import VueRouter from 'vue-router';
import Vue from 'vue';
import App from './App.vue';
import Nav from './nav.vue';

Vue.config.productionTip = false;

Vue.use(VueRouter);

import Panes from './components/Panes/Example/Example';
import Grids from './components/Grids/Example/Example';

const routes = [
  { path: '/', component: Nav },
  { path: '/panes', component: Panes },
  { path: '/grids', component: Grids },
];

const router = new VueRouter({
  routes,
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
