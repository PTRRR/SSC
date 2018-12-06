/**
 * EBB Controller
 *
 * This controller is intended to send serial commands to the EggBotBoard.
 * More informations at http://evil-mad.github.io/EggBot/ebb.html
 */

import BaseController from '../BaseController'
import * as helper from './helpers'
import { printPoint, clamp } from '../../utils'

// Default values
let _minStepsPerMillisecond = 0.07
let _maxStepsPerMillisecond = 15
let _stepPosition = [0, 0]

let _position = [0, 0]
let _penState = 0

let _speed = 0
let _drawingSpeed = 30
let _movingSpeed = 80
let _maxStepsX = 0
let _maxStepsY = 0
let _minServoHeight = 23000
let _maxServoHeight = 18000
let _servoRate = 30000
let _minDeltaPositionForDistinctLines = 70

let _elapsedTime = 0
let _totalStepsX = 0
let _totalStepsY = 0

export default class EBBController extends BaseController {
  async configure(config = {}) {
    this._port.on('data', buffer => {
      // TODO: Handle data
      const data = buffer.toString('utf-8').split(',')
    })

    await super.configure(config)

    // Setup controller with configured values
    await this.reset()
    await this.setServoMinHeight(_minServoHeight)
    await this.setServoMaxHeight(_maxServoHeight)
    await this.setServoRate(_servoRate)

    // Test
    await this.raiseBrush()
    await this.disableStepperMotors()
    await helper.wait(1000)
  }

  async executeGCODE(gcode) {
    if (!this._isRunning) return

    // Parsed values from a GCODE command
    const { command, args } = gcode

    // Map GCODE commands to the controller API
    switch (command) {
    // Fast movement
    case 'G0': {
      const { x, y } = args
      this.speed = _movingSpeed
      await this.moveTo(x, y)
      break
    }

    // Linear movement
    case 'G1': {
      const { x, y } = args
      this.speed = _drawingSpeed
      await this.moveTo(x, y)
      break
    }

    // Retract
    case 'G10': {
      await this.raiseBrush()
      break
    }

    // Unretract
    case 'G11': {
      await this.lowerBrush()
    }
    }
  }

  async start() {
    // Keep track of the time when the command started
    const date = new Date()
    _elapsedTime = date.getTime()

    // Start sequence
    await super.start()

    // Reset state
    this.speed = _movingSpeed
    await this.raiseBrush()
    await this.resetStepperPosition()

    // Disable stepper motors
    await this.disableStepperMotors()

    _elapsedTime = date.getTime() - _elapsedTime

    // Print stats
    printPoint(`COMPLETED IN: ${_elapsedTime / 1000}s`)
    printPoint(`TOTAL STEPS X: ${_totalStepsX}`)
    printPoint(`TOTAL STEPS Y: ${_totalStepsY}`)
  }

  // Getters & Setters
  set minStepsPerMillisecond(minStepsPerMillisecond) {
    _minStepsPerMillisecond = minStepsPerMillisecond
  }

  get minStepsPerMillisecond() {
    return _minStepsPerMillisecond
  }

  set maxStepsPerMillisecond(maxStepsPerMillisecond) {
    _maxStepsPerMillisecond = maxStepsPerMillisecond
  }

  get maxStepsPerMillisecond() {
    return _maxStepsPerMillisecond
  }

  set speed(speed) {
    _speed = speed
  }

  get speed() {
    return _speed
  }

  set drawingSpeed(drawingSpeed) {
    _drawingSpeed = drawingSpeed
  }

  get drawingSpeed() {
    return _drawingSpeed
  }

  set movingSpeed(movingSpeed) {
    _movingSpeed = movingSpeed
  }

  get movingSpeed() {
    return _movingSpeed
  }

  set stepPosition(stepPosition) {
    _stepPosition = stepPosition
  }

  get stepPosition() {
    return _stepPosition
  }

  set position(position) {
    _position = position
  }

  get position() {
    return _position
  }

  set maxStepsX (maxStepsX) {
    _maxStepsX = maxStepsX
  }

  get maxStepsX () {
    return _maxStepsX
  }

  set maxStepsY (maxStepsY) {
    _maxStepsY = maxStepsY
  }

  get maxStepsY () {
    return _maxStepsY
  }

  set minDeltaPositionForDistinctLines(minDeltaPositionForDistinctLines) {
    _minDeltaPositionForDistinctLines = minDeltaPositionForDistinctLines
  }

  get minDeltaPositionForDistinctLines () {
    return _minDeltaPositionForDistinctLines
  }

  set minServoHeight(minServoHeight) {
    _minServoHeight = minServoHeight
  }

  get minServoHeight() {
    return this.minServoHeight
  }

  set maxServoHeight(maxServoHeight) {
    _maxServoHeight = maxServoHeight
  }

  get maxServoHeight() {
    return this.maxServoHeight
  }

  set servoRate(servoRate) {
    _servoRate = servoRate
  }

  get servoRate() {
    return this.servoRate
  }

  async reset() {
    await helper.reset(this._port)
  }

  async setServoMinHeight(minHeight) {
    await helper.stepperAndServoModeConfigure(this._port, {
      parameter: 4,
      integer: minHeight
    })
  }

  async setServoMaxHeight(maxHeight) {
    await helper.stepperAndServoModeConfigure(this._port, {
      parameter: 5,
      integer: maxHeight
    })
  }

  async setServoRate(servoRate) {
    await helper.stepperAndServoModeConfigure(this._port, {
      parameter: 10,
      integer: servoRate
    })
  }

  async lowerBrush() {
    _penState = 1
    await helper.setPenState(this._port, 0)
  }

  async raiseBrush() {
    _penState = 0
    await helper.setPenState(this._port, 1)
  }

  async enableStepperMotors() {
    await helper.enableMotors(this._port, { enable1: 1, enable2: 1 })
  }

  async disableStepperMotors() {
    await helper.enableMotors(this._port, { enable1: 0, enable2: 0 })
  }

  async moveTo(targetPositionX, targetPositionY) {
    const [x, y] = _position

    // Constrict movement to the available area
    targetPositionX = clamp(targetPositionX, 0, this.maxStepsX)
    targetPositionY = clamp(targetPositionY, 0, this.maxStepsY)

    // Compute steps
    // See EBB Command Set Documentation for more informations
    const lastStepsX = x + y
    const lastStepsY = x - y
    const targetStepsX = targetPositionX + targetPositionY
    const targetStepsY = targetPositionX - targetPositionY
    const amountStepX = Math.round(targetStepsX - lastStepsX)
    const amountStepY = Math.round(targetStepsY - lastStepsY)

    // Compute the duration of the movement in milliseconds
    const speedPercent = _speed / 100
    const stepsPerMillisecond =
      _minStepsPerMillisecond +
      (_maxStepsPerMillisecond - _minStepsPerMillisecond) * speedPercent
    const steps =
      Math.abs(amountStepX) > Math.abs(amountStepY) ? amountStepX : amountStepY
    const duration = Math.round(Math.abs(steps / stepsPerMillisecond))

    // Update position
    _position = [targetPositionX, targetPositionY]

    // Keep track of steps
    _totalStepsX += Math.abs(amountStepX)
    _totalStepsY += Math.abs(amountStepY)

    await helper.stepperMove(this._port, {
      duration,
      axisSteps1: amountStepX,
      axisSteps2: amountStepY
    })
  }

  async resetStepperPosition() {
    await this.moveTo(0, 0)
  }
}
