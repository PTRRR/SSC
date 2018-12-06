import SerialPort from 'serialport'
import {
  compareTo,
  printTitle,
  printPoint,
  printError,
  printMessage
} from '../utils'

export class SerialConnection {
  constructor() {
    this.port = null
  }

  async openPort(config = {}) {
    return new Promise(async (resolve, reject) => {
      const availablePorts = await SerialPort.list()

      // Find the serial port that corresponds to the controller config.
      const port = availablePorts.find(it => {
        return compareTo(it, config)
      })

      if (port) {
        const serialPort = new SerialPort(port.comName)

        // Resolve the promise only when the `open` event has been fired
        serialPort.on('open', () => {
          resolve(serialPort)
        })

        // Handle errors
        serialPort.on('error', err => {
          const { message } = err
          reject(message)
        })
      } else {
        printError('THE SPECIFIED PORT WAS NOT FOUND')
        printPoint(config)
        printTitle('HERE ARE THE DETECTED ONES:')

        for (const port of availablePorts) {
          const { comName } = port
          printMessage(comName)
          printMessage('')
          printPoint(port)
        }

        printMessage('')
        reject('Please edit the configuration file in the controller folder')
      }
    })
  }
}
