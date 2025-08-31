import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'  
import FloatingVue from 'floating-vue'

import 'floating-vue/dist/style.css'
import "/styles.css";

const app = createApp(App)
app.use(FloatingVue)
app.use(Toast, {
  transition: "Vue-Toastification__slideBlurred",
  maxToasts: 20,
  newestOnTop: true
})
app.mount("#app")
