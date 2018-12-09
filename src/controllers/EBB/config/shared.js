const MILLIMETER_IN_STEPS = 80

const maxSize = {
  maxStepsX: 32500,
  maxStepsY: 22000
}

const A5_HORIZONTAL = {
  maxStepsX: 210 * MILLIMETER_IN_STEPS,
  maxStepsY: 148 * MILLIMETER_IN_STEPS
}

const A5_VERTICAL = {
  maxStepsX: 149 * MILLIMETER_IN_STEPS,
  maxStepsY: 210 * MILLIMETER_IN_STEPS
}

const A4_VERTICAL = {
  maxStepsX: 210 * MILLIMETER_IN_STEPS,
  maxStepsY: 297 * MILLIMETER_IN_STEPS
}

const A4_HORIZONTAL = {
  maxStepsX: 297 * MILLIMETER_IN_STEPS,
  maxStepsY: 210 * MILLIMETER_IN_STEPS
}

const testFormat = {
  maxStepsX: 20000,
  maxStepsY: 15000
}

const custom = {
  maxStepsX: 240 * MILLIMETER_IN_STEPS,
  maxStepsY: 320 * 0.5 * MILLIMETER_IN_STEPS
}

export const controllerConfig = {
  ...A5_VERTICAL,
  minStepsPerMillisecond: 0.07,
  maxStepsPerMillisecond: 15,
  servoRate: 40000,
  minServoHeight: 20000,
  maxServoHeight: 16000,
  drawingSpeed: 30,
  movingSpeed: 70,
  minDeltaPositionForDistinctLines: 2
}
