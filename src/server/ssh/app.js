module.exports = function(IP, PORT, pool){
  var path = require('path')
  var publicPath = path.join(__dirname, '../', '../', 'client', 'ssh', 'public')
  var express = require('express')
  const cookieParser = require('cookie-parser');
  const { verify } = require('jsonwebtoken');

  async function getLogin(token){
    return new Promise((resolve, reject) => {
      console.log("Token: " + token);
      const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET);
      (async () => {
        console.log("Pool connected");
        const client = await pool.connect();
        let query = "SELECT username, ssh_password FROM user_login WHERE userid = $1;";
        let data = [userId];
        console.log("Query: " + query);
        try {
            let result = await client.query(query, data);
            if(result.rows.length > 0)
            {
                console.log("Username: " + result.rows[0].username + "\nPassword: " + result.rows[0].ssh_password);
                resolve([result.rows[0].username, result.rows[0].ssh_password]);
            }
            else
            {
              reject([null, null])
            }
        } finally {
            // Make sure to release the client before any error handling,
            // just in case the error handling itself throws an error.
            client.release()
        }
        })().catch(err => console.log(err.stack))
    });
  }

  const config = {
    listen: {
      port: PORT
    },
    user: {
      name: 'user',
      password: 'user',
      privatekey: null
    },
    ssh: {
      host: IP,
      port: 22,
      term: 'xterm-color',
      readyTimeout: 50000,
      keepaliveInterval: 120000,
      keepaliveCountMax: 10,
      allowedSubnets: []
    },
    terminal: {
      cursorBlink: true,
      scrollback: 10000,
      tabStopWidth: 8,
      bellStyle: 'sound'
    },
    header: {
      text: null,
      background: 'green'
    },
    session: {
      name: 'WebSSH2',
      secret: 'mysecret'
    },
    options: {
      challengeButton: true,
      allowreauth: true
    },
    algorithms: {
      kex: [
        'ecdh-sha2-nistp256',
        'ecdh-sha2-nistp384',
        'ecdh-sha2-nistp521',
        'diffie-hellman-group-exchange-sha256',
        'diffie-hellman-group14-sha1'
      ],
      cipher: [
        'aes128-ctr',
        'aes192-ctr',
        'aes256-ctr',
        'aes128-gcm',
        'aes128-gcm@openssh.com',
        'aes256-gcm',
        'aes256-gcm@openssh.com',
        'aes256-cbc'
      ],
      hmac: [
        'hmac-sha2-256',
        'hmac-sha2-512',
        'hmac-sha1'
      ],
      compress: [
        'none',
        'zlib@openssh.com',
        'zlib'
      ]
    },
    serverlog: {
      client: false,
      server: false
    },
    accesslog: false,
    verify: false,
    safeShutdownDuration: 300
  }

  var session = require('express-session')({
    secret: config.session.secret,
    name: config.session.name,
    resave: true,
    saveUninitialized: false,
    unset: 'destroy'
  })
  var app = express()
  var server = require('http').Server(app)
  var myutil = require('./util')
  myutil.setDefaultCredentials(config.user.name, config.user.password, config.user.privatekey)
  var validator = require('validator')
  var io = require('socket.io')(server, { serveClient: false, path: '/ssh/socket.io' })
  var socket = require('./socket')
  var expressOptions = require('./expressOptions')
  var favicon = require('serve-favicon')
  const { ModuleFilenameHelpers } = require('webpack')

  // express
  app.use(safeShutdownGuard)
  app.use(session)
  app.use(myutil.basicAuth)
  app.disable('x-powered-by')

  // static files
  app.use('/ssh', express.static(publicPath, expressOptions))
  app.use(cookieParser());

  // favicon from root if being pre-fetched by browser to prevent a 404
  app.use(favicon(path.join(publicPath, 'favicon.ico')))

  app.get('/user/reauth', function (req, res, next) {
    var r = req.headers.referer || '/'
    res.status(401).send('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=' + r + '"></head><body bgcolor="#000"></body></html>')
  })

  // eslint-disable-next-line complexity
  app.get('/user/ssh', async function (req, res, next) {
    const login = await getLogin(req.cookies.accesstoken)
    if(login[0] == null)
      res.redirect('/login')
    console.log("Login retrieved: " + login);
    req.session.username = 'user'
    req.session.password = 'user'
    res.sendFile(path.join(path.join(publicPath, 'client.htm')))
    // capture, assign, and validated variables
    req.session.ssh = {
      host: config.ssh.host || (validator.isIP(req.params.host + '') && req.params.host) ||
        (validator.isFQDN(req.params.host) && req.params.host) ||
        (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(req.params.host) &&
        req.params.host),
      port: (validator.isInt(req.query.port + '', { min: 1, max: 65535 }) &&
        req.query.port) || config.ssh.port,
      localAddress: config.ssh.localAddress,
      localPort: config.ssh.localPort,
      header: {
        name: req.query.header || config.header.text,
        background: req.query.headerBackground || config.header.background
      },
      algorithms: config.algorithms,
      keepaliveInterval: config.ssh.keepaliveInterval,
      keepaliveCountMax: config.ssh.keepaliveCountMax,
      allowedSubnets: config.ssh.allowedSubnets,
      term: (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(req.query.sshterm) &&
        req.query.sshterm) || config.ssh.term,
      terminal: {
        cursorBlink: (validator.isBoolean(req.query.cursorBlink + '') ? myutil.parseBool(req.query.cursorBlink) : config.terminal.cursorBlink),
        scrollback: (validator.isInt(req.query.scrollback + '', { min: 1, max: 200000 }) && req.query.scrollback) ? req.query.scrollback : config.terminal.scrollback,
        tabStopWidth: (validator.isInt(req.query.tabStopWidth + '', { min: 1, max: 100 }) && req.query.tabStopWidth) ? req.query.tabStopWidth : config.terminal.tabStopWidth,
        bellStyle: ((req.query.bellStyle) && (['sound', 'none'].indexOf(req.query.bellStyle) > -1)) ? req.query.bellStyle : config.terminal.bellStyle
      },
      allowreplay: config.options.challengeButton || (validator.isBoolean(req.headers.allowreplay + '') ? myutil.parseBool(req.headers.allowreplay) : false),
      allowreauth: config.options.allowreauth || false,
      mrhsession: ((validator.isAlphanumeric(req.headers.mrhsession + '') && req.headers.mrhsession) ? req.headers.mrhsession : 'none'),
      serverlog: {
        client: config.serverlog.client || false,
        server: config.serverlog.server || false
      },
      readyTimeout: (validator.isInt(req.query.readyTimeout + '', { min: 1, max: 300000 }) &&
        req.query.readyTimeout) || config.ssh.readyTimeout
    }
    if (req.session.ssh.header.name) validator.escape(req.session.ssh.header.name)
    if (req.session.ssh.header.background) validator.escape(req.session.ssh.header.background)
    //Debug statements
  })

  // express error handling
  app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
  })

  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  // socket.io
  // expose express session with socket.request.session
  io.use(function (socket, next) {
    (socket.request.res) ? session(socket.request, socket.request.res, next)
      : next(next)
  })

  // bring up socket
  io.on('connection', socket)

  // safe shutdownf
  var shutdownMode = false
  var shutdownInterval = 0
  var connectionCount = 0

  function safeShutdownGuard (req, res, next) {
    if (shutdownMode) res.status(503).end('Service unavailable: Server shutting down')
    else return next()
  }

  io.on('connection', function (socket) {
    connectionCount++

    socket.on('disconnect', function () {
      if ((--connectionCount <= 0) && shutdownMode) {
        stop('All clients disconnected')
      }
    })
  })

  const signals = ['SIGTERM', 'SIGINT']
  signals.forEach(signal => process.on(signal, function () {
    if (shutdownMode) stop('Safe shutdown aborted, force quitting')
    else if (connectionCount > 0) {
      var remainingSeconds = config.safeShutdownDuration
      shutdownMode = true

      var message = (connectionCount === 1) ? ' client is still connected'
        : ' clients are still connected'
      console.error(connectionCount + message)
      console.error('Starting a ' + remainingSeconds + ' seconds countdown')
      console.error('Press Ctrl+C again to force quit')

      shutdownInterval = setInterval(function () {
        if ((remainingSeconds--) <= 0) {
          stop('Countdown is over')
        } else {
          io.sockets.emit('shutdownCountdownUpdate', remainingSeconds)
        }
      }, 1000)
    } else stop()
  }))

  // clean stop
  function stop (reason) {
    shutdownMode = false
    if (reason) console.log('Stopping: ' + reason)
    if (shutdownInterval) clearInterval(shutdownInterval)
    io.close()
    server.close()
  }
  return {server: server, config:config}
}