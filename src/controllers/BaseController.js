/**
 * BASE CONTROLLER
 * ---------------
 *
 * This class defines methods that should be included in each controller.
 * Each controller class inherit from this one.
 */

import { printTitle, printPoint } from '../utils'
const gcodeToObject = require('gcode-json-converter').gcodeToObject

export default class BaseController {
  constructor(port) {
    this._port = port
    this._config = null
    this._queue = []
    this._isRunning = false
  }

  get config() {
    return this._config
  }

  async configure(config = {}) {
    this._config = config
    printTitle(`${this.constructor.name} configuration`)

    // Assign configured values
    for (const [key, value] of Object.entries(config)) {
      try {
        this[key] = value
        printPoint(`${key}: ${value}`)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async feedGCODE(rawGcode = '') {
    const gcodes = rawGcode.split('\n')

    for (const gcode of gcodes) {
      const parsedGcode = gcodeToObject(gcode)
      const { command, args } = parsedGcode
      this._queue.push({
        command,
        args
      })
    }

    if (!this._isRunning) {
      this.start()
    }
  }

  async start() {
    this._isRunning = true

    printTitle('Started printing')

    // Go through all gcode commands in the queue
    let index = 0
    while (index < this._queue.length && this._isRunning) {
      const gcode = this._queue[index]
      printPoint(gcode)
      await this.executeGCODE(gcode)
      index++
    }

    this.stop()
    printTitle('Finished printing')
  }

  async stop() {
    // Reset queue
    this._queue = []
    this._isRunning = false
  }

  async executeGCODE(gcode) {
    // Default behaviour
    return new Promise(resolve => {
      const { cmd, params } = gcode
      printPoint(cmd, params)
      setTimeout(() => {
        resolve()
      }, 1000)
    })
  }
}
