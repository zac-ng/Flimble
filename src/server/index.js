const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const dotenv = require('dotenv');
const PORT = 2112

const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))


app.get('/', (req, res) =>{
    res.send("Index Page");
})
app.get('/bob', (req, res) =>
{
	const IP = '54.211.114.44'
	ssh.connect(IP)	//ssh allows us to pass in a variable, thus we can pass in a number. This can allow us to query the api and then pass it in to be connected.
    console.log("Connected to " + IP + "\n Redirecting to terminal");
	//res.redirect('http://75.101.232.49:3113/ssh/user');	//When running on EC2 redirect here.
	res.redirect('http://localhost:3113/ssh/user');	//When running on localhost, redirect here.
})

http.listen(PORT)  
console.log('Listening on port ' + PORT)
