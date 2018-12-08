export class SocketClient {
  constructor(socket) {
    this.socket = socket
  }

  send(type, message) {
    try {
      this.socket.send(JSON.stringify({ type, message }))
    } catch (e) {
      console.error(e)
    }
  }

  sendError(error) {
    this.send('error', error)
  }

  close() {
    try {
      this.send('closing')
      this.socket.close()
    } catch (e) {
      console.error(e)
    }
  }
}
