import { SerialConnection } from './serialConnection'
import { WebSocketServer } from './server'
import * as controllers from '../controllers'

export class SSCEngine {
  constructor (config = {}) {
    const { platform, controller, server } = config

    // Server config
    this.serverConfig = server

    // Controller config
    if (controller && platform) {
      this.controllerConfig = controllers[controller.name].config[platform]
    } else {
      // TODO: Improve error messages
      console.error('config not good')
    }

    // Create a serial connection instance
    const { serialConfig } = this.controllerConfig
    this.serialConnection = new SerialConnection(serialConfig)

    // Declare a controller variable that will handle communitation
    // to the hardware
    this.controller = new controllers[controller.name].controller()
  }

  async start () {
    return new Promise(async (resolve, reject) => {
      await this.serialConnection.initializeConnection().catch(e => {
        reject(e)
      })

      // Handle opening
      this.serialConnection.on('open', async () => {
        console.log('SERIAL CONNECTION: established')

        // Initialize the controller
        const { controllerConfig } = this.controllerConfig
        await this.controller.initializeController(
          this.serialConnection,
          controllerConfig
        )
        console.log('CONTROLLER INITIALIZED')

        // Initialize the webSocket server
        const websocketServer = new WebSocketServer(this.serverConfig)
        await websocketServer.initializeServer()
        websocketServer.onConnection(send => {
          console.log('Client connection')
          send('feedback', 'SSC: Successfully connected!')
        })

        websocketServer.onMessage((type, data, send) => {
          if (this.controller[type]) {
            send(type, this.controller[type](data))
          } else {
            send(type, 'Can not be treated')
          }
        })
        console.log('SERVER INITIALIZED')

        resolve()
      })

      // Handle errors
      this.serialConnection.on('error', e => {
        console.error(e)
        reject(e)
      })
    })
  }
}
