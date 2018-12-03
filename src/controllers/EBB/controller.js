export class EBBController {
  constructor (port) {
    this.port = port

    this.port.on('data', data => {
      console.log(data)
    })
  }
}
