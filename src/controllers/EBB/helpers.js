// Some constants
const MILIMETER_PER_STEP = 0.0125
export const constants = {
  MILIMETER_PER_STEP
}

/**
 *
 * EBB (EIBOTBOARD) COMMAND SET
 * LOWER-LEVEL FUNCTIONS
 *
 * These methods provide a way of sending serial commands to the EBB according
 * to the EiBotBoard Command Set document (http://evil-mad.github.io/EggBot/ebb.html).
 * The following methods are returning a promise when the command have finished
 * executing.
 *
 * These commands shouldn't be used directly but only in the higher-level
 * functions defined above.
 */

/**
 * Utils
 */

export function getAmountSteps (x, y, targetX, targetY) {
  // Compute steps
  // See EBB Command Set Documentation for more informations
  const lastStepsX = x + y
  const lastStepsY = x - y
  const targetStepsX = targetX + targetY
  const targetStepsY = targetX - targetY
  const amountX = Math.round(targetStepsX - lastStepsX)
  const amountY = Math.round(targetStepsY - lastStepsY)
  return { amountX, amountY }
}

export function getDuration (
  speed,
  minStepsPerMillisecond,
  maxStepsPerMillisecond,
  amountX,
  amountY
) {
  const speedPercent = speed / 100
  const stepsPerMillisecond =
    minStepsPerMillisecond +
    (maxStepsPerMillisecond - minStepsPerMillisecond) * speedPercent
  const steps = Math.abs(amountX) > Math.abs(amountY) ? amountX : amountY
  const duration = Math.round(Math.abs(steps / stepsPerMillisecond))
  return duration
}

export async function wait (duration) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

export async function reboot (port) {
  return new Promise(async resolve => {
    await port.drain()
    await port.write('RB\r')
    resolve({ type: 'RB' })
  })
}

/**
 * "R" — Reset
 * Execution: Immediate
 *
 * This command reinitializes the the internal state of the EBB to the default
 * power on state. This includes setting all I/O pins in their power on states,
 * stopping any ongoing timers or servo outputs, etc. It does NOT do a complete
 * reset of the EBB - this command does not cause the EBB to drop off the USB
 * and come back, it does not reinitialize the processor's internal register,
 * etc. It is simply a high level EBB-application reset. If you want to completely
 * reset the board, use the RB command.
 *
 * Example: R<CR>
 */

export async function reset (port) {
  return new Promise(async resolve => {
    await port.drain()
    await port.write('R\r')
    resolve({ type: 'R' })
  })
}

/**
 * "SC" — Stepper and Servo Mode Configure
 * Command: SC,value1,value2<CR>
 * Execution: Immediate
 *
 * This command allows you to configure the motor control modes that the EBB
 * uses, including parameters of the servo or solenoid motor used for raising
 * and lowering the pen, and how the stepper motor driver signals are directed.
 *
 *
 * -  value1 is an integer in the range from 0 to 255, which specifies the
 *    parameter that you are adjusting.
 *
 * -  value2 is an integer in the range from 0 to 65535. It specifies the value
 *    of the parameter given by value1.
 *
 * -  See the list of these parameters (value1) and allowed values (value2),
 *    below.
 *
 * Example: SC,4,8000\r Set the pen-up position to give a servo output of 8000,
 * about 0.66 ms.
 *
 * Example: SC,1,1\r Enable only the RC servo for pen lift; disable solenoid
 * control output.
 *
 * For more informations see: http://evil-mad.github.io/EggBot/ebb.html#SC
 */

export async function stepperAndServoModeConfigure (port, args) {
  const { parameter, integer } = args
  return new Promise(async resolve => {
    await port.drain()
    await port.write(`SC,${parameter},${integer}\r`)
    resolve({ type: 'SC', ...args })
  })
}

/**
 * "SP" — Set Pen State
 * Command: SP,value[,duration[,portBpin]]<CR>
 *
 * This command instructs the pen to go up or down.
 *
 * When a value of 1 is used, the servo will be moved to the servo_min value
 * (as set by the "SC,4" command).
 * When a value of 0 is used, the servo will be moved to the servo_max value
 * (as set by the "SC,5" command below).
 *
 * Note that conventionally, we have used the servo_min ("SC,4") value as the
 * 'Pen up position', and the servo_max ("SC,5") value as the 'Pen down
 * position'.
 *
 * -  value is either 0 or 1, indicating to raise or lower the pen.
 *
 * -  duration (optional) is an integer from 1 to 65535, which gives a delay
 *    in milliseconds.
 *
 * -  portBpin (optional) is an integer from 0 through 7.
 *
 * Example: SP,1<CR> Move pen-lift servo motor to servo_min position.
 *
 * For more informations see: http://evil-mad.github.io/EggBot/ebb.html#SP
 */

export async function setPenState (port, args) {
  const { state, duration } = args
  return new Promise(async resolve => {
    await port.drain()
    await port.write(`SP,${state},${duration}\r`)
    resolve({ type: 'SP', ...args })
  })
}

// Motors
/**
 * "EM" — Enable Motors
 * Command: EM,Enable1[,Enable2]<CR>
 * Execution: Immediate
 *
 * Enable or disable stepper motors and set step mode.
 * Each stepper motor may be independently enabled (energized) or disabled
 * (causing that motor to freewheel). When disabled, the driver will stop
 * sending current to the motor, so the motor will "freewheel" — it will not
 * be actively driven, but instead will present little resistance to being
 * turned by external torques.
 *
 * For each stepper motor (Enable1 for motor1 and Enable2 for motor2), an
 * integer in the range of 0 through 5, inclusive. An Enable value of 0 will
 * disable that motor (making it freewheel), while a nonzero value will enable
 * that motor. This command is also used to set the step resolution of the
 * stepper motors.
 *
 * The allowed values of Enable1 are as follows:
 *
 *    0: Disable motor 1
 *    1: Enable motor 1, set global step mode to 1/16 step mode (default step
 *       mode upon reset)
 *    2: Enable motor 1, set global step mode to 1/8 step mode
 *    3: Enable motor 1, set global step mode to 1/4 step mode
 *    4: Enable motor 1, set global step mode to 1/2 step mode
 *    5: Enable motor 1, set global step mode to full step mode
 *
 * The allowed values of Enable2 are as follows:
 *
 *    0: Disable motor 2
 *    1 through 5: Enable motor 2 (at whatever the previously set global step mode is)
 *
 * Example: EM,1,0\r Enable motor 1, set global step mode to 1/16th and
 * disable motor 2
 *
 * Example: EM,2\r Set global step mode to 1/8 enable motor 1, and do not
 * change motor 2's enable status. (Enable2 is optional)
 *
 * For more informations see: http://evil-mad.github.io/EggBot/ebb.html#EM
 */

export async function enableMotors (port, args) {
  const { enable1, enable2 } = args
  return new Promise(async resolve => {
    await port.drain()
    await port.write(`EM,${enable1},${enable2}\r`)
    resolve({ type: 'EM', ...args })
  })
}

/**
 * "CS" — Clear Step position
 * Response: OK<CR><NL>
 *
 * This command zeroes out (i.e. clears) the global motor 1 step position and
 * global motor 2 step position.
 * See the QS command for a description of the global step positions.
 *
 * For more informations see: http://evil-mad.github.io/EggBot/ebb.html#CS
 */

// export async function clearStepPosition () {
//   return new Promise(resolve => {
//     port.write('CS')
//     resolve()
//   })
// }

/**
 * "QS" — Query Step position
 * Response: GlobalMotor1StepPosition,GlobalMotor2StepPosition<NL><CR>OK<CR><NL>
 *
 * This command prints out the current Motor 1 and Motor 2 global step positions.
 * Each of these positions is a 32 bit signed integer, that keeps track of the
 * positions of each axis. The CS command can be used to set these positions
 * to zero.
 * Every time a step is taken, the appropriate global step position is incremented
 * or decremented depending on the direction of that step.
 *
 * Example: QS\r
 *
 * For more informations see: http://evil-mad.github.io/EggBot/ebb.html#QS
 */

// export async function queryStepPosition () {
//   return new Promise(resolve => {
//     this.readCallback = msg => {
//       resolve(msg.split(',').map(it => parseInt(it)))
//     }

//     port.write('QS\r')
//   })
// }

/**
 * "SM" — Stepper Move
 * Command: SM,duration,AxisSteps1[,AxisSteps2]<CR>
 *
 * Use this command to make the motors draw a straight line at constant velocity,
 * or to add a delay to the motion queue.
 * If both AxisSteps1 and AxisSteps2 are zero, then a delay of duration ms is
 * executed. AxisSteps2 is an optional value, and if it is not included in the
 * command, zero steps are assumed for axis 2.
 *
 * -  duration is an integer in the range from 1 to 16777215, giving time in
 *    milliseconds.
 *
 * -  AxisSteps1 and AxisSteps2 are integers, each in the range from -16777215
 *    to 16777215, giving movement distance in steps.
 *
 * Example: SM,1000,250,-766\r Move axis 1 by 250 steps and axis2 by -766
 * steps, in 1000 ms of duration.
 *
 * For more informations see: http://evil-mad.github.io/EggBot/ebb.html#SM
 */

export async function stepperMove (port, args) {
  const { duration, axisSteps1, axisSteps2 } = args
  return new Promise(async resolve => {
    await port.drain()
    await port.write(`SM,${duration},${axisSteps1},${axisSteps2}\r`)
    resolve({ type: 'SM', ...args })
  })
}

export async function lowLevelMove (port, args) {
  const {
    rateTerm1,
    axisSteps1,
    deltaR1,
    rateTerm2,
    axisSteps2,
    deltaR2
  } = args

  return new Promise(async resolve => {
    await port.drain()
    await port.write(
      `LM,${rateTerm1},${axisSteps1},${deltaR1},${rateTerm2},${axisSteps2},${deltaR2}\r`
    )
    resolve({ type: 'LM', ...args })
  })
}

/**
 * "XM" — Stepper Move, for Mixed-axis Geometries
 * Command: XM,duration,AxisStepsA,AxisStepsB<CR>
 *
 * This command takes the AxisStepsA and AxisStepsB values, and creates a call
 * to the SM command with the SM command's AxisSteps1 value as AxisStepsA + AxisStepsB,
 * and AxisSteps2 as AxisStepsA - AxisStepsB.
 *
 * -  duration is an integer in the range from 1 to 16777215, giving time in
 *    milliseconds.
 *
 * -  AxisStepsA and AxisStepsB are integers, each in the range from -16777215
 *    to 16777215, giving movement distances in steps.
 *
 * Example: XM,1000,550,-1234\r Move 550 steps in the A direction and -1234
 * steps in the B direction, in duration 1000 ms.
 *
 * For more informations see: http://evil-mad.github.io/EggBot/ebb.html#XM
 */

// export async function stepperMoveForMixedAxisGeometries (
//   duration,
//   axisStepsA,
//   axisStepsB
// ) {
//   return new Promise(resolve => {
//     port.write(`XM,${duration},${axisStepsA},${axisStepsB}\r`)

//     setTimeout(() => {
//       resolve()
//     }, duration)
//   })
// }

/**
 * "QM" — Query Motor
 * Command: QM<CR>
 *  Use this command to see what the EBB is currently doing. It will return the current state of the 'motion system' and each motor's current state.
 *
 *  CommandStatus is nonzero if any "motion commands" are presently executing, and zero otherwise.
 *  Motor1Status is 1 if motor 1 is currently moving, and 0 if it is idle.
 *  Motor2Status is 1 if motor 2 is currently moving, and 0 if it is idle.
 */

export async function queryMotor (port) {
  return new Promise(async resolve => {
    await port.drain()
    await port.write('QM\r')
    resolve({ type: 'QM' })
  })
}
