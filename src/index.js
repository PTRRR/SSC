import os from 'os'
import config from './config'
import { CLI } from './cli'
import { SSCEngine } from './engine'

async function app () {
  const cli = new CLI()
  cli.runSequence().then(async config => {
    console.log(config)
    const platform = os.platform()
    const engine = new SSCEngine({
      platform,
      ...config
    })

    try {
      await engine.start()
    } catch (e) {
      // TODO: Improve Error messages
      console.error(e)
      console.log('Closing engine')
    }
  })
}

app()
