import * as io from 'socket.io-client'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import Swal from 'sweetalert2'
/* import * as fit from 'xterm/dist/addons/fit/fit'
 */
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBars, faClipboard, faDownload, faKey, faCog } from '@fortawesome/free-solid-svg-icons'
library.add(faBars, faClipboard, faDownload, faKey, faCog)
dom.watch()

require('xterm/css/xterm.css')
require('../css/style.css')

var errorExists;
var socket;
const term = new Terminal();
var header = document.getElementById('header')
var fitAddon = new FitAddon()
var terminalContainer = document.getElementById('terminal-container')
term.loadAddon(fitAddon)
term.open(terminalContainer)
term.focus()
fitAddon.fit()

window.addEventListener('resize', resizeScreen, false)

function resizeScreen () {
  fitAddon.fit()
  socket.emit('resize', { cols: term.cols, rows: term.rows })
}

socket = io.connect({
  path: '/ssh/socket.io'
})

term.onData(function (data) {
  socket.emit('data', data);
  console.log("Data recieved");
})

socket.on('data', function (data) {
  term.write(data)
})

socket.on('connect', function () {
  socket.emit('geometry', term.cols, term.rows)
})

socket.on('setTerminalOpts', function (data) {
  term.setOption('cursorBlink', data.cursorBlink)
  term.setOption('scrollback', data.scrollback)
  term.setOption('tabStopWidth', data.tabStopWidth)
  term.setOption('bellStyle', data.bellStyle)
})

socket.on('headerBackground', function (data) {
  header.style.backgroundColor = data
})

socket.on('header', function (data) {
  if (data) {
    header.innerHTML = data
    header.style.display = 'block'
    // header is 19px and footer is 19px, recaculate new terminal-container and resize
    terminalContainer.style.height = 'calc(100% - 38px)'
    resizeScreen()
  }
})

socket.on('disconnect', function (err) {
  if (!errorExists) {
  Swal.fire({
      icon: 'warning',
      title: 'Disconnected',
      text: 'You were disconnected',
      footer: 'Redirecting in 5 seconds'
    })
  }
  socket.io.reconnection(false)
  window.setTimeout(() => {
    window.location.href = "http://" + window.location.hostname + ":5000/"
  }, 5000)
})

socket.on('error', function (err) {
  if (!errorExists) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'There was an error on our servers!',
      footer: 'Redirecting in 5 seconds.'
    })
    window.setTimeout(() => {
      window.location.href = "http://" + window.location.hostname + ":5000/"
    }, 5000)
  }
})