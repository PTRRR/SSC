import SerialPort from 'serialport'
import {
  compareTo,
  printTitle,
  printPoint,
  printError,
  printMessage
} from '../utils'

export async function getSerialPort (config = {}) {
  const serialPorts = await SerialPort.list()
  const port = serialPorts.find(it => {
    return compareTo(it, config)
  })

  if (port) {
    return new SerialPort(port.comName)
  } else {
    printError('THE SPECIFIED PORT WAS NOT FOUND')
    printPoint(config)
    printTitle('HERE ARE THE DETECTED ONES:')

    for (const port of serialPorts) {
      const { comName } = port
      printMessage(comName)
      printMessage('')
      printPoint(port)
    }

    printMessage('')
    printTitle('Please edit the configuration file in the controller folder')
    return null
  }
}
