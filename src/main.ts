import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App.vue';
import router from './router';
import store from './store';
import Meta from 'vue-meta';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faCheck, faQuestion, faMap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

Vue.config.productionTip = false;

library.add(faSpinner, faCheck, faQuestion, faMap);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(VueAxios, axios.create({baseURL: 'http://91.215.186.66:83/api', withCredentials: false }));
Vue.use(Meta);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
