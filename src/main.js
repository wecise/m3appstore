const m3 = require("@wecise/m3js");
import Vue from 'vue'
import App from './App.vue'
import Cookies from 'js-cookie'

const themeColor = {dark:'#252D47',light:'#409EFF'};
const theme = Cookies.get("m3-theme")?themeColor[Cookies.get("m3-theme")]:'#252D47';// dark:#252D47 & blue:#409EFF  default theme is dark
import(`./assets/theme/element-${theme}/index.css`)
import moment from 'moment'
import VueSplit from 'vue-split-panel'

Vue.use(VueSplit);

Vue.prototype.moment = moment;
Vue.prototype.eventHub = new Vue();

Vue.config.productionTip = false;

window.moment = moment;


m3.init().then(()=>{
  Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 };
  new Vue({
      render: h => h(App)
  }).$mount('#app')
}).catch((e)=>{
  console.error(e)
})
