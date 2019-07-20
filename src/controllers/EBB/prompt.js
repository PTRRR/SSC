import qoa from 'qoa'

const defaultConfig = {
  minStepsPerMillisecond: 0.07,
  maxStepsPerMillisecond: 15,
  servoRate: 40000,
  minServoHeight: 20000,
  maxServoHeight: 16000,
  maxWidth: 210,
  maxHeight: 148,
  drawingSpeed: 30,
  movingSpeed: 70,
  minDeltaPositionForDistinctLines: 2
}

export default async function () {
  return new Promise (async resolve => {
    const minServoHeight = {
      type: 'input',
      query: `\nInput min servo height [${defaultConfig.minServoHeight}]:`,
      handle: 'minServoHeight'
    }
  
    const maxServoHeight = {
      type: 'input',
      query: `Input max servo height [${defaultConfig.maxServoHeight}]:`,
      handle: 'maxServoHeight'
    }
  
    const servoRate = {
      type: 'input',
      query: `Input servo rate [${defaultConfig.servoRate}]:`,
      handle: 'maxServoHeight'
    }
  
    const maxWidth = {
      type: 'input',
      query: `Input max width [${defaultConfig.maxWidth} mm]:`,
      handle: 'maxWidth'
    }
  
    const maxHeight = {
      type: 'input',
      query: `Input max height [${defaultConfig.maxHeight} mm]:`,
      handle: 'maxHeight'
    }
  
    const minStepsPerMillisecond = {
      type: 'input',
      query: `Input min steps per millisecond [${defaultConfig.minStepsPerMillisecond}]:`,
      handle: 'minStepsPerMillisecond'
    }
  
    const maxStepsPerMillisecond = {
      type: 'input',
      query: `Input max steps per millisecond [${defaultConfig.maxStepsPerMillisecond}]:`,
      handle: 'maxStepsPerMillisecond'
    }
  
    const inputs = await qoa.prompt([
      minServoHeight,
      maxServoHeight,
      servoRate,
      maxWidth,
      maxHeight,
      minStepsPerMillisecond,
      maxStepsPerMillisecond
    ])
    
    // Add default values if not defined.
    for (const [key, value] of Object.entries(inputs)) {
      if (!value) {
        inputs[key] = defaultConfig[key]
      }
    }

    resolve({ ...inputs })
  })
}