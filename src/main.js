import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue-toastification'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import "/styles.css";
import 'vue-toastification/dist/index.css'  

const app = createApp(App)
app.use(FloatingVue)
app.use(Toast, {
  position: "top-center",
  timeout: 2000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  draggable: false,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
  dangerouslyHTMLString: true, 
})
app.mount("#app")
