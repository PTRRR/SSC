import fs from 'fs'
import qoa from 'qoa'
import chalk from 'chalk'
import figlet from 'figlet'
import SerialPort from 'serialport'
import * as controllers from '../controllers'

const selector = '>'

export class CLI {
  constructor () {
    this.configsDirectory = 'configs'

    console.log(
      chalk.rgb(255, 0, 0)(
        figlet.textSync('SSC', {
          font: 'Standard',
          horizontalLayout: 'full',
          verticalLayout: 'default'
        })
      )
    )
  }

  async runConfigSequence () {
    return new Promise(async (resolve, reject) => {
      const existingConfig = await this.selectExistingConfig()

      if (!existingConfig) {
        const name = await this.selectController()

        let controllerConfig = {}
        if (controllers[name].prompt) {
          controllerConfig = await controllers[name].prompt()
        }

        const serverPort = await this.selectServerPort()
        const comName = await this.selectSerialPort()

        const config = {
          controller: {
            name,
            config: controllerConfig
          },
          server: { 
            port: serverPort
          },
          serial: { comName }
        }

        const saveConfig = await this.saveConfig()
        if (saveConfig) {
          const fileName = await this.setConfigName() || 'config'

          fs.writeFileSync(`${this.configsDirectory}/${fileName}.json`,
            JSON.stringify(config),
            error => {
              if (error) {
                reject(error)
              }
            }
          )

          console.log(`A new "${this.configsDirectory}/${fileName}.json" file has been created.`);
        }

        resolve(config)
      } else {
        resolve(existingConfig)
      }
    })
  }

  async readFile (path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { encoding: 'utf-8' }, (error, data) => {
        if (!error) {
          resolve(data)
        } else {
          reject(error)
        }
      })
    })
  }

  async selectExistingConfig () {
    return new Promise(async resolve => {
      if (!fs.existsSync(this.configsDirectory)){
        fs.mkdirSync(this.configsDirectory)
      }

      const configs = fs.readdirSync(this.configsDirectory)

      if (configs.length === 0) {
        resolve(null)
        return
      }

      const interactive = {
        type: 'interactive',
        query: '\nDo you want to choose an existing config?\n',
        handle: 'bool',
        symbol: selector,
        menu: [ true, false ]
      }

      const { bool } = await qoa.interactive(interactive)
      if (bool) {
        const interactive = {
          type: 'interactive',
          query: '\nSelect one config:\n',
          handle: 'configName',
          symbol: selector,
          menu: configs
        }

        const { configName } = await qoa.interactive(interactive)
        const content = await this.readFile(`${this.configsDirectory}/${configName}`)
        resolve(JSON.parse(content))
      } else {
        resolve(null)
      }
    })
  }

  async selectController () {
    return new Promise(async resolve => {
      const menu = Object.keys(controllers)
      const questions = {
        type: 'interactive',
        query: '\nChoose a controller:\n',
        handle: 'name',
        symbol: selector,
        menu
      }

      const { name } = await qoa.interactive(questions)
      resolve(name)
    })
  }

  async selectServerPort () {
    return new Promise(async resolve => {
      const input = {
        type: 'input',
        query: '\nEnter a server port [1234]:',
        handle: 'port'
      }

      const { port } = await qoa.input(input)
      resolve(port)
    })
  }

  async selectSerialPort () {
    return new Promise(async resolve => {
      const list = await SerialPort.list()

      const questions = {
        type: 'interactive',
        query: '\nChoose a serial port:\n',
        handle: 'comName',
        symbol: selector,
        menu: list.map((it, index) => it.comName)
      }

      const { comName } = await qoa.interactive(questions)
      resolve(comName)
    })
  }

  async setConfigName () {
    return new Promise(async resolve => {
      const input = {
        type: 'input',
        query: '\nEnter a config name:',
        handle: 'name'
      }

      const { name } = await qoa.input(input)
      resolve(name)
    })
  }

  async saveConfig () {
    return new Promise(async resolve => {
      const questions = {
        type: 'interactive',
        query: '\nSave the config?\n',
        handle: 'bool',
        symbol: selector,
        menu: [ true, false ]
      }
  
      const { bool } = await qoa.interactive(questions)
      resolve(bool)
    })
  }
}
