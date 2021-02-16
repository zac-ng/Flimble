const express = require('express')
const app = express()
const http = require('http').Server(app)
const path = require('path')

//const PORT = process.env.PORT || 3113

//const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))

const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'))
// })
console.log("REQUIRED");
ssh.connect('52.91.189.151'); //ssh allows us to pass in a variable, thus we can pass in a number. This can allow us to query the api and then pass it in to be connected.
http.listen(0)  
//console.log('Listening on port ' + PORT)
