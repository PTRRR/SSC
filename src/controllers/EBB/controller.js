import * as helpers from './helpers'
import { printPoint, clamp } from '../../utils'
const gcodeToObject = require('gcode-json-converter').gcodeToObject

const GCODE = []

const segments = 100
const radius = 3000

for (let i = 0; i < segments + 1; i++) {
  const angle = (i / segments) * Math.PI * 2
  const x = Math.cos(angle) * radius + radius
  const y = Math.sin(angle) * radius + radius
  GCODE.push(`N${GCODE.length + 1} G1 X${x} Y${y}`)
}

export default class EBBController {
  constructor() {
    this.port = null
    this.config = null

    this.isRunning = false
    this.pendingPromise = null
    this.pendingData = null
    this.pendingMotions = []

    this.position = [0, 0]
    this.speed = 50
    this.motorResponse = null
  }

  initializeController(port, config) {
    this.initializeSerialConnection(port)
    this.configureController(config)
    this.feed(GCODE.join('\n'))
  }

  initializeSerialConnection(port) {
    this.port = port
    this.port.on('data', buffer => {
      const datas = buffer.toString('utf-8').split(/\n\r|\r\n/)
      datas.splice(-1, 1)
      for (const data of datas) {
        this.handleSerialData(data)
      }
    })
  }

  configureController(config) {
    this.config = config
    const { minServoHeight, maxServoHeight, servoRate } = this.config
    this.reset()
    this.setServoMinHeight(minServoHeight)
    this.setServoMaxHeight(maxServoHeight)
    this.setServoRate(servoRate)

    // Test
    this.lowerBrush()
    this.raiseBrush()
    this.disableStepperMotors()
  }

  handleSerialData(data) {
    switch (data) {
    case 'OK':
      break
    default: {
      const queryResponse = data.split(',')
      this.motorResponse = queryResponse
      // const query = queryResponse[0]
      // if (this.isRunning) {
      //   if (query === 'QM') {
      //     if (parseInt(queryResponse[4]) === 0) {
      //       this.executeNextMotion()
      //     }
      //   }
      //   this.queryMotor()
      // }
      break
    }
    }
  }

  feed(rawGcode) {
    console.log(rawGcode)
    for (const gcode of rawGcode.split('\n')) {
      const parsedGcode = gcodeToObject(gcode)
      const { command } = parsedGcode
      if (command) {
        this.pendingMotions.push(parsedGcode)
      }
    }

    if (!this.isRunning) {
      this.isRunning = true
      this.lowerBrush()
      this.start()
    }
  }

  executeNextMotion() {
    if (this.pendingMotions.length > 0) {
      const nextMotion = this.pendingMotions.shift()
      // console.log(nextMotion)
      const { command, args } = nextMotion

      switch (command) {
      case 'G1': {
        const { x, y } = args
        this.moveTo(x, y)
        this.queryMotor()
      }
      }
      // this.executeNextMotion()
    }
  }

  start() {
    const interval = setInterval(() => {
      if (this.motorResponse) {
        if (parseInt(this.motorResponse[4]) === 0) {
          this.executeNextMotion()
          this.executeNextMotion()
        }
      } else {
        this.executeNextMotion()
      }
      this.queryMotor()
      if (this.pendingMotions.length <= 0) {
        clearInterval(interval)
        this.raiseBrush()
        this.moveTo(0, 0)
        this.isRunning = false
      }
    }, 10)
  }

  // Configuration

  reset() {
    helpers.reset(this.port)
  }

  setServoMinHeight(minHeight) {
    helpers.stepperAndServoModeConfigure(this.port, {
      parameter: 4,
      integer: minHeight
    })
  }

  setServoMaxHeight(maxHeight) {
    helpers.stepperAndServoModeConfigure(this.port, {
      parameter: 5,
      integer: maxHeight
    })
  }

  setServoRate(servoRate) {
    helpers.stepperAndServoModeConfigure(this.port, {
      parameter: 10,
      integer: servoRate
    })
  }

  enableStepperMotors() {
    helpers.enableMotors(this.port, { enable1: 1, enable2: 1 })
  }

  disableStepperMotors() {
    helpers.enableMotors(this.port, { enable1: 0, enable2: 0 })
  }

  // Get status

  queryMotor() {
    helpers.queryMotor(this.port)
  }

  // Movements

  lowerBrush() {
    helpers.setPenState(this.port, 0)
  }

  raiseBrush() {
    helpers.setPenState(this.port, 1)
  }

  async moveTo(targetPositionX, targetPositionY) {
    const [x, y] = this.position
    const {
      maxStepsX,
      maxStepsY,
      minStepsPerMillisecond,
      maxStepsPerMillisecond
    } = this.config

    // Constrict movement to the available area
    targetPositionX = clamp(targetPositionX, 0, maxStepsX)
    targetPositionY = clamp(targetPositionY, 0, maxStepsY)

    // Compute steps
    // See EBB Command Set Documentation for more informations
    const lastStepsX = x + y
    const lastStepsY = x - y
    const targetStepsX = targetPositionX + targetPositionY
    const targetStepsY = targetPositionX - targetPositionY
    const amountStepX = Math.round(targetStepsX - lastStepsX)
    const amountStepY = Math.round(targetStepsY - lastStepsY)

    // Compute the duration of the movement in milliseconds
    const speedPercent = this.speed / 100
    const stepsPerMillisecond =
      minStepsPerMillisecond +
      (maxStepsPerMillisecond - minStepsPerMillisecond) * speedPercent
    const steps =
      Math.abs(amountStepX) > Math.abs(amountStepY) ? amountStepX : amountStepY
    const duration = Math.round(Math.abs(steps / stepsPerMillisecond))

    console.log(duration)

    if (duration > 3) {
      // Update position
      this.position = [targetPositionX, targetPositionY]
      helpers.stepperMove(this.port, {
        duration,
        axisSteps1: amountStepX,
        axisSteps2: amountStepY
      })
    }
  }
}
