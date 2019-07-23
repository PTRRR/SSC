import SerialPort from 'serialport'
import BaseController from '../BaseController'

export default class SmoothieController extends BaseController{
	constructor (port, config) {
		super(port, config)
		this.isInitialized = false
		this.stack = []
		this.hasLogged = false
	}
	
	async initialize () {
		await this.setupParser()
		await this.runInitialSequence()
	}
	
	async setupParser () {
		return new Promise(resolve => {
			// Add parser
			const delimiter = '\r\n'
			const { Readline } = SerialPort.parsers
			this.parser = this.port.pipe(new Readline({ delimiter }))
			
			this.parser.on('data', async data => {
				if (data.indexOf('ok') > -1 && !this.isInitialized) {
					this.isInitialized = true
					resolve()
				} else {
					const nextCommand = this.stack.shift()
					
					if (nextCommand) {
						const { command, resolveCommand } = nextCommand
						
						if (command) {					
							console.log(command)
						}
						
						if (resolveCommand) {
							resolveCommand()								
						}
					}
				}
			})
		})	
	}
	
	async runInitialSequence () {
		await this.runCommand('M204 S300')
		await this.runCommand('G0 Z60')
		await this.runHomingSequence()
		await this.runCommand('G0 Z40')
		await this.runCommand('G0 Y0 F30000')
		await this.runCommand('G0 Y60\nG0 Y120 Z60 F4000\nG0 Y300 F40000\nG0 Y420 F4000')
		process.exit()
	}
	
	async runHomingSequence () {
		return new Promise(async (resolve, reject) => {
			console.log('RUN HOMING SEQUENCE')
			await this.writeCommand('$H')
			resolve()
		})
	}
	
	async runCommand (rawCommands) {
		return new Promise(async (resolve, reject) => {
			const commands = rawCommands
				.split('\n')
				.map(it => it)
				
			for (const command of commands) {
				this.stack.push({
					command: `RUN: ${command}`
				})	
			}
			
			this.stack.push({
				resolveCommand: resolve
			})
			
			for (const command of commands) {
				await this.writeCommand(command)	
			}
			
			await this.writeCommand('M400')
		})
	}
}
