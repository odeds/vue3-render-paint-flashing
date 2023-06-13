import { createApp } from 'vue'
import App from './App.vue'
import { createRenderPaintFlashingPlugin } from '../src/main'

const app = createApp(App)

app.use(
  createRenderPaintFlashingPlugin({
    color: 'blue',
  })
)

app.mount('#app')
