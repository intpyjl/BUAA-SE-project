import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import './styles/font.less'
import './styles/globalbackground.css'
import axios from '@/plugins/axios/axios'
Vue.use(ElementUI);


Vue.config.productionTip = false
Vue.prototype.$axios = axios;

// add token into headers

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

