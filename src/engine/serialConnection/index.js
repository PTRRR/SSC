import SerialPort from 'serialport'
import ReadLine from '@serialport/parser-readline'
import { compareTo } from '../../utils'

export class SerialConnection {
  constructor (config = {}) {
    this.port = null
    this.config = config
    this.isWriting = true
  }

  async initializeConnection () {
    return new Promise(async (resolve, reject) => {
      const availablePorts = await SerialPort.list()

      if (availablePorts.length > 0) {
        const port = availablePorts.find(it => {
          return compareTo(it, this.config)
        })

        if (port) {
          const { comName } = port
          this.port = new SerialPort(comName)
          resolve(this.port)
        }
      } else {
        reject({
          error: 'ERROR: No serial serial ports were found on this computer'
        })
      }
    })
  }

  on (event, callback) {
    if (this.port) {
      this.port.on(event, callback)
    } else {
      console.error('You should initialize the connection first!')
    }
  }

  async write (message) {
    if (this.port) {
      return new Promise((resolve, reject) => {
        this.isWriting = true
        this.port.write(message, e => {
          if (e) {
            reject(e)
          } else {
            resolve()
          }
          this.isWriting = false
        })
      })
    } else {
      console.error('You should initialize the connection first!')
    }
  }

  async drain () {
    try {
      return new Promise((resolve, reject) => {
        this.port.drain(e => {
          if (e) {
            reject(e)
          } else {
            resolve()
          }
        })
      })
    } catch (e) {
      console.log(e)
    }
  }
}
