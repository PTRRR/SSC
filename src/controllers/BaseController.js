export default class BaseController {
	constructor (port, config) {
		this.port = port
		this.config = config
		this.commandStack = []
	}
	
	onGCode (gcode) {
		console.log(gcode)
	}
	
	async initialize () {
		console.log('initialize')
	}
	
	async initializeController (port, config) {
		return new Promise(resolve => {
			this.port = port
			this.config = config
			
			this.port.on('open', () => {
				console.log('open')
			})
			
			this.port.on('data', buffer => {
				const data = this.parseBuffer(buffer)
				
				if (this.commandStack.length > 0) {
					const { command, resolve: r } = this.commandStack.shift()
					console.log(`OK: ${command}`)
					r()
				}	else if (
					data.indexOf('ok') > -1 &&
					this.commandStack.length === 0
				) {
					resolve()
				}
			})
			
			this.port.open()	
		})
	}
	
	async writeCommand (command) {
		return new Promise((resolve, reject) => {
			this.port.write(`${command}\n`, error => {
				if (error) {
					reject(error)
				}
			})
			
			this.port.drain(resolve)
		})
	}
	
	async runCommand (command) {
		this.port.write(`${command}\n`)
	}
	
	parseBuffer (rawBuffer) {
		const buffer = new Buffer(rawBuffer, 'utf8')
		return buffer.toString()
	}
}
