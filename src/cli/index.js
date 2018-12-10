import inquirer from 'inquirer'
import chalk from 'chalk'
import figlet from 'figlet'
import shell from 'shelljs'
import SerialPort from 'serialport'
import * as controllers from '../controllers'

export class CLI {
  constructor () {
    this.config = {
      controller: {},
      server: {}
    }

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

  async runSequence () {
    return new Promise(async resolve => {
      await this.selectController()
      await this.selectSerialPort()
      console.log('ok')
      resolve(this.config)
    })
  }

  async selectController () {
    return new Promise(resolve => {
      // const controllers = 
      const names = Object.keys(controllers)
      const questions = {
        type: 'list',
        name: 'name',
        message: 'Choose a controller',
        choices: names
      }

      return inquirer.prompt(questions).then(response => {
        const { name } = response
        this.config.controller.name = name
        console.log(this.config)
        resolve()
      })
    })
  }

  async selectSerialPort () {
    return new Promise(resolve => {
      const availablePorts = [
        {
          manufacturer: 'ShmalzHaus',
          vendorID: '045D'
        },
        {
          manufacturer: 'Windows',
          vendorID: '39847'
        }
      ]

      const questions = {
        type: 'list',
        name: 'name',
        message: 'Choose a serial port',
        choices: availablePorts,
        transformer: function (val) {
          // let formattedQuestion = ''
          // for (const [key, entry] of Object.entries(val)) {
          //   formattedQuestion += `${key}: ${entry}\n  `
          // }
          console.log(val)
          return 'asdklj'
        }
      }

      return inquirer.prompt(questions).then(response => {
        // const { name } = response
        // this.config.name = name
        console.log(response)
        resolve()
      })
    })
  }
}
