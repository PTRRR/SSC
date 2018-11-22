import getos from 'getos'
import config from './config'
import { getSerialPort } from './serialport'
import { createServer } from './server'
import { printMessage, printError } from './utils'
import * as controllers from './controllers'

async function app (osInfos) {
  const { os } = osInfos

  // Retrieve global config
  const { server, controller } = config
  const { name } = controller

  // Retrieve controller components
  const { Controller } = controllers[name]
  const { serialConfig, controllerConfig } = controllers[name].config[os]

  // Get to serial port neede to controll the selected controller
  let serialPort = null
  try {
    serialPort = await getSerialPort(serialConfig)
  } catch (e) {
    printError(e)
    if (e.includes('Permission denied')) {
      printMessage('Try to run this command as root -> with `sudo`')
    }
  }

  if (serialPort) {
    // Create a controller that will use the serial port to communicate with
    // the hardware.
    const controller = new Controller(serialPort)
    await controller.configure(controllerConfig)

    // Create the websocket server
    createServer(server, controller)
  } else {
    printError('CLOSING SERVER')
  }
}

// Initialize the app with the right os config
getos((e, osInfos) => {
  app(osInfos)
})
