import { SerialConnection } from './serialConnection'
import { WebSocketServer } from './server'
import * as controllers from '../controllers'

export class SSC {
  constructor (config = {}) {
    const {
      controller,
      server: serverConfig,
      serial: serialConfig
    } = config

    this.serialConfig = serialConfig
    this.serverConfig = serverConfig
    this.serialConnection = new SerialConnection(serialConfig)

    // Declare a controller variable that will handle communication
    // with the hardware.
    this.controller = new controllers[controller.name]()
  }

  async start () {
    return new Promise(async (resolve, reject) => {
      await this.serialConnection.initializeConnection()
        .catch(error => reject({ error }))

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

          this.controller.onFinish(() => {
            send('finished-printing')
          })
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
      this.serialConnection.on('error', error => {
        reject({
          type: 'serial',
          error
        })
      })
    })
  }
}
