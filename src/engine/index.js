import { SerialConnection } from './serialConnection'
import { WebSocketServer } from './server'
import * as controllers from '../controllers'

export class SSC {
  constructor (config = {}) {
    const { serial, server, controller } = config

    this.controllerConfig = controller
    this.serverConfig = server
    this.serialConnection = new SerialConnection(serial)
  }

  async start () {
    return new Promise(async (resolve, reject) => {
      await this.serialConnection.initializeConnection()
        .catch(error => reject({ error }))

      // Handle opening
      this.serialConnection.on('open', async () => {
        console.log('\nSERIAL CONNECTION: established')

        // Initialize the controller
        const { name, config } = this.controllerConfig
        const controller = new controllers[name].controller(
        	this.serialConnection.port,
        	config
        )
        
        controller.initialize()

        // Initialize the webSocket server
        const websocketServer = new WebSocketServer(this.serverConfig)
        await websocketServer.initializeServer()
          .then(() => {
            console.log(`SERVER INITIALIZED`)
          }).catch(error => {
            reject({ error })
          })

        websocketServer.onConnection(send => {
          console.log('Client connection')
          send('feedback', 'SSC: Successfully connected!')

          controller.onFinish(() => {
            send('finished-printing')
          })
        })

        websocketServer.onMessage((type, data, send) => {
          const controllerMethod = controller[type]
          if (controllerMethod) {
            send(type, controllerMethod(data))
          } else {
            send(type, 'Can not be treated')
          }
        })

        resolve()
      })

      // Handle errors
      this.serialConnection.on('error', error => {
        reject({
          type: 'serial',
          error
        })
      })
    })
  }
}
