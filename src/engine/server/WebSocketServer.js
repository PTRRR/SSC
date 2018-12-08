import http from 'http'
import WebSocket from 'ws'
import { SocketClient } from './SocketClient'

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
        // Create a client object
        const socket = new SocketClient(ws)

        // Handle on connection event
        if (this.onConnectionCallback) {
          this.onConnectionCallback((type, data) => {
            socket.send(type, data)
          })
        }

        // Handle on message event
        ws.on('message', message => {
          const { type, data } = JSON.parse(message)
          if (this.onMessageCallback) {
            this.onMessageCallback(type, data, (type, data) => {
              socket.send(type, data)
            })
          }
        })
      })

      // Start the serveron the selected port
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
