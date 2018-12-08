import os from 'os'
import config from './config'
import { SSCEngine } from './engine'

async function app() {
  const platform = os.platform()
  const engine = new SSCEngine({
    platform,
    ...config
  })

  try {
    await engine.start()
  } catch (e) {
    // TODO: Improve Error messages
    console.error(e)
    console.log('Closing engine')
  }

  // // Retrieve global config
  // const { server, controller } = config
  // const { name } = controller

  // // Retrieve controller components
  // const { Controller } = controllers[name]
  // const { serialConfig, controllerConfig } = controllers[name].config[os]

  // // Get to serial port neede to controll the selected controller
  // let serialPort = null
  // try {
  //   serialPort = await getSerialPort(serialConfig)
  // } catch (e) {
  //   printError(e)
  //   if (e.includes('Permission denied')) {
  //     printMessage('Try to run this command as root -> with `sudo`')
  //   }
  // }

  // if (serialPort) {
  //   // Create a controller that will use the serial port to communicate with
  //   // the hardware.
  //   const controller = new Controller(serialPort)
  //   await controller.configure(controllerConfig)

  //   // Create the websocket server
  //   createServer(server, controller)
  // } else {
  //   printError('CLOSING SERVER')
  // }
}

app()
