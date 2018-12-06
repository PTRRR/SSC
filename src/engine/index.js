import { SerialConnection } from '../serialConnection'
import * as controllers from '../controllers'

export class SSCEngine {
  constructor(config = {}) {
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
    this.serialConnection = new SerialConnection()

    // Declare a controller variable that will handle communitation
    // to the hardware
    this.controller = new controllers[controller.name].controller()
  }

  async start() {
    return new Promise(async (resolve, reject) => {
      // Open serial connection according to the config file of the controller
      const { controllerConfig, serialConfig } = this.controllerConfig
      this.serialConnection
        .openPort(serialConfig)
        .then(serialPort => {
          // TODO: Improve feedback messages
          console.log('SERIAL CONNECTION: established')

          // Create new controller with the opened port
          this.controller.initializeController(serialPort, controllerConfig)
          resolve()
        })
        .catch(e => {
          reject(e)
        })
    })
  }
}
