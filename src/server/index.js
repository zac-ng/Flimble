require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const cookieParser = require('cookie-parser');

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
const authenticate = require('./api/auth/authenticate');
const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'));
const PORT = process.env.PORT || 5000;

//    Serve Static Files    //

app.use(express.static(path.join(__dirname,"..", "client", "src", "static")))

app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(express.json());
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/refresh_token', refreshtoken);
app.use('/api/authenticate', authenticate);
app.use(express.static(path.join(__dirname,"..", "client", "build")))

//    Middleware    //

app.use('/user/ssh', (req, res, next) => {
	ssh.connect(process.env.SERVER_PORT, req, res, pool);
})

//    React Route   //

app.get('(/*)?', async (req, res, next) => {
  res.sendFile(path.join(__dirname,"..", "client", "build", 'index.html'));
});

http.listen(process.env.SERVER_PORT);
console.log('Listening on port ' + process.env.SERVER_PORT);