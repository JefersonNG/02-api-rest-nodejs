import { env } from "./env"
import { app } from './app'


const port = env.PORT || 4000

app
  .listen({
    port: port
  })
  .then(() => {
    console.log('server running')
  })
