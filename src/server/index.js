const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
//let dotenv = require('dotenv');   //Commented out because heroku stores env variables without env.
const PORT = process.env.PORT || 2112

//const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))

const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'))
// })
app.get('/', (req, res) =>{
    res.send("");
})
app.get('/bob', (req, res) =>{
    ssh.connect('34.238.118.19')    //ssh allows us to pass in a variable, thus we can pass in a number. This can allow us to query the api and then pass it in to be connected.
    res.redirect('http://localhost:3113/ssh/host/127.0.0.1');
})
//ssh.connect('18.207.0.192'); //ssh allows us to pass in a variable, thus we can pass in a number. This can allow us to query the api and then pass it in to be connected.
http.listen(PORT)  
console.log('Listening on port ' + PORT)
