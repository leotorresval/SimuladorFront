import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'leaflet/dist/leaflet.css'
import {
  create,
  NNotificationProvider
} from 'naive-ui'
const naive = create({
  components: [NNotificationProvider]
})
createApp(App).use(naive).mount('#app')
