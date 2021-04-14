require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

//    Setup Postgres Connection Pool    //

const { Pool } = require('pg');

const config = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  //ssl: true
};

const pool = new Pool(config);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

//    Setup Redis Database    //

const redis = require('redis');
const redis_client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

redis_client.on('error', err => {
    console.log('Error ' + err);
});

//    Load in API routes   //

const register = require('./api/register')(pool, redis_client);
const login = require('./api/login')(pool, redis_client);
const refreshtoken = require('./api/refresh_token')(pool, redis_client);
const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'));
const { isAuth } = require('./auth/auth')
const PORT = process.env.PORT || 5000;

//    Serve Static Files    //

app.use(express.static(path.join(__dirname,"..", "client", "src", "static")))

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/refresh_token', refreshtoken);
app.use(express.static(path.join(__dirname,"..", "client", "build")))
//app.use(express.static(path.join(__dirname,"..", "client", "public")))

// app.use((req, res, next) => {
//   console.log("This use has been called")
//   res.sendFile(path.join(__dirname,"..", "client", "build", "index.html"));
// });

//      Routes      //

app.get('/', (req, res) => {
  console.log("This get has been called");
  res.sendFile(path.join(__dirname,"..", "client", "build", "index.html"));
});

app.get('/bob', (req, res) =>
{
	const IP = '3.82.242.133'
	ssh.connect(IP)	//ssh allows us to pass in a variable, thus we can pass in a number. This can allow us to query the api and then pass it in to be connected.
    console.log("Connected to " + IP + "\n Redirecting to terminal");
	//res.redirect('http://75.101.232.49:3113/ssh/user');	//When running on EC2 redirect here.
	res.redirect('http://localhost:3113/ssh/user');	//When running on localhost, redirect here.
})

app.post('/authenticate', (req, res) => {
  try{
    const userId = isAuth(req);
    console.log("USER ID: " + userId);
    if(userId != null)
    {
      res.json(({
        "error": null,
        code: 1
      }))
    }
    else
    {
      console.log("Error")
      res.json({
        "error": "No access token sent.",
        "code": -1
      }
      )
    }
  }
  catch(err)
  {
    console.log(err);
    res.json({
      "error": "An error was encountered on the server, please try again later.",
      "code": -2
    })
  }
})


//Placing React Router at bottom to render react only.

const rootRouter = express.Router();

rootRouter.get('(/*)?', async (req, res, next) => {
  res.sendFile(path.join(__dirname,"..", "client", "build", 'index.html'));
});
app.use(rootRouter);

http.listen(process.env.SERVER_PORT);
console.log('Listening on port ' + process.env.SERVER_PORT);