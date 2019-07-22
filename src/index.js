import { argv } from 'yargs'
import { CLI } from './cli'
import { SSC } from './engine'

async function initializeServer () {
  const cli = new CLI()
  const config = await cli.runConfigSequence()
  await runSSC(config)  
}

async function initializeDevServer (configPath) {
  const config = await import(`./${configPath}`)
  await runSSC(config)
}

async function runSSC (config) {
  console.log('\n')
  console.log('-------- Starting SSC ----------')
  
  try {
    const ssc = new SSC(config)
    await ssc.start()
  } catch (e) {
    const { type, error } = e
    
    console.log('\n')
    
    if (error) {
      console.error(error)
    } else {
      console.log(e)
    }

    // Print some advices
    switch (type) {
      case 'serial':
        const { comName } = config.serial
        console.log(`Try: $ sudo chmod 777 ${comName}`)
      break;
    }

    console.log('\n')
    console.log('-------- Closing SSC ----------')
    process.exit(1)
  }
}

const { dev } = argv

if (dev) {
  initializeDevServer(dev)
} else {
  initializeServer()
}
