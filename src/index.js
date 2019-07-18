import { CLI } from './cli'
import { SSC } from './engine'

async function runServer () {
  const cli = new CLI()
  const config = await cli.runConfigSequence()

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
  }
}

runServer()
