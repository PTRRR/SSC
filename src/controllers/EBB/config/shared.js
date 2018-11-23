const maxSize = {
  maxStepsX: 32500,
  maxStepsY: 22000
}

const A5 = {
  maxStepsX: 14800,
  maxStepsY: 10300
}

export const controllerConfig = {
  ...A5,
  minStepsPerMillisecond: 0.07,
  maxStepsPerMillisecond: 15,
  servoRate: 40000,
  minServoHeight: 20000,
  maxServoHeight: 16000,
  drawingSpeed: 20,
  movingSpeed: 80,
  minDeltaPositionForDistinctLines: 2
}
