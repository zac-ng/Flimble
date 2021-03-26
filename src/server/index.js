const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
let dotenv = require('dotenv');
const PORT = process.env.PORT || 2112
const IP = process.env.IP;

const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))

app.get('/', (req, res) =>{
    res.send("Index Page");
})
app.get('/bob', (req, res) =>
{
	const IP = '54.211.114.44'
	ssh.connect('54.211.114.44')	//ssh allows us to pass in a variable, thus we can pass in a number. This can allow us to query the api and then pass it in to be connected.
    console.log("Connected to " + IP + ". Redirecting to terminal");
	//res.redirect('http://54.145.239.130:3113/ssh/user');	//When running on EC2 redirect here.
	res.redirect('http://localhost:3113/ssh/user');	//When running on localhost, redirect here.
})

http.listen(PORT)  
console.log('Listening on port ' + PORT)
