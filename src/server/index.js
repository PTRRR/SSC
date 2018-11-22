import http from 'http'
import express from 'express'
import WebSocket from 'ws'
import { printTitle, printError } from '../utils'

export async function createServer(config, controller) {
  const app = express()
  const server = http.createServer(app)

  // Initialize WebSocket server
  const wss = new WebSocket.Server({ server })

  wss.on('connection', ws => {
    ws.on('message', message => {
      const { action, data } = JSON.parse(message)

      switch (action) {
      case 'get-config':
        ws.send(JSON.stringify({ action: action, data: controller.config }))
        break
      default:
        // Run the action
        if (controller[action]) {
          controller[action](data)
        } else {
          ws.send(
            `SERVER ERROR: The action:${action} is not defined on the current controller`
          )
          printError(
            `SERVER ERROR: The action:${action} is not defined on the current controller`
          )
        }
        break
      }
    })

    // Send immediatly a feedback to the incoming connection
    ws.send('SERVER: Connection successfull')
  })

  // Start server
  const { port } = config
  server.listen(port, () => {
    printTitle(`Server started listening on port: ${port}`)
  })
}
