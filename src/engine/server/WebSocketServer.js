import http from 'http'
import WebSocket from 'ws'
import Socket from './Socket'

export class WebSocketServer {
  constructor(config = {}) {
    this.config = config
    this.server = http.createServer()

    this.onConnectionCallback = null
    this.onMessageCallback = null
  }

  async initializeServer() {
    return new Promise((resolve, reject) => {
      const wss = new WebSocket.Server({
        server: this.server
      })

      wss.on('connection', ws => {
        const socket = new Socket(ws)
        const { send } = socket
        if (this.onConnectionCallback) {
          this.onConnectionCallback(send)
        }
        ws.on('message', message => {
          const { type, data } = JSON.parse(message)
          if (this.onMessageCallback) {
            this.onMessageCallback(type, data, send)
          }
        })

        // Send immediatly a feedback to the incoming connection
        ws.send('SERVER: Connection successfull')
      })

      const { port } = this.config
      this.server.listen(port, e => {
        if (e) {
          reject(e)
        } else {
          console.log(`WebSocketServer listening on port: ${port}`)
          resolve()
        }
      })
    })
  }

  onConnection(callback) {
    this.onConnectionCallback = callback
  }

  onMessage(callback) {
    this.onMessageCallback = callback
  }
}
