import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue-toastification'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import "/styles.css";
import 'vue-toastification/dist/index.css'  
import * as ConfirmDialog from 'vuejs-confirm-dialog'

const app = createApp(App)
app.use(FloatingVue)
app.use(ConfirmDialog)
app.use(Toast, {
  position: "top-center",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__slideBlurred",
  maxToasts: 20,
  newestOnTop: true,
  dangerouslyHTMLString: true, 
})
app.mount("#app")
