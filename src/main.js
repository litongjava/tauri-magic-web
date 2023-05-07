import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import './plugins/element.js'
import RightToolbar from '@/components/RightToolbar'

Vue.component('RightToolbar', RightToolbar);

import Pagination from "@/components/Pagination";

Vue.component('Pagination', Pagination)

import directive from './directive' // directive
Vue.use(directive);

import plugins from './plugins' // plugins
Vue.use(plugins);
import {parseTime, resetForm, handleTree, addBeginAndEndTime, divide} from '@/utils/ruoyi'

Vue.prototype.parseTime = parseTime;
Vue.prototype.resetForm = resetForm;
Vue.prototype.handleTree = handleTree;
Vue.prototype.addBeginAndEndTime = addBeginAndEndTime;
Vue.prototype.divide = divide;

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
