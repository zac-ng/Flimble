const express = require('express')
const app = express()
const http = require('http').Server(app)
const path = require('path')

const PORT = process.env.PORT || 2112

const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

http.listen(PORT)
console.log('Listening on port ' + PORT)
