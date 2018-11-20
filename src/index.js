import config from './config'
import { getSerialPort } from './serialport'
import { createServer } from './server'
import { printError } from './utils'
import * as controllers from './controllers'

// Retrieve global config
const { server, controller } = config
const { name } = controller

// Retrieve controller components
const { Controller } = controllers[name]
const { serialConfig, controllerConfig } = controllers[name].config

async function app () {
  // Get to serial port neede to controll the selected controller
  const serialPort = await getSerialPort(serialConfig)

  if (serialPort) {
    // Create a controller that will use the serial port to communicate with
    // the hardware.
    const controller = new Controller(serialPort)
    await controller.configure(controllerConfig)

    // Create the websocket server
    createServer(server, controller)
  } else {
    printError("The controller coudn't be loaded")
  }
}

app()
