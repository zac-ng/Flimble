## Node Daemon Manager

Helps managing Node-based (not only) services with things like Monit, etc. 

Install: `npm i -g nodaemon`

#### Usage:
```sh
nodaemon <command> <path> [name [pidfile [args [logs [log [error-log]]]]]] [options]
```

#### Commands:
- start
- stop
- restart

#### Options:
- `-p` or `--path`: Path to the script file or folder with `index.js`
- `-n` or `--name`: Name of the daemon *(default: the name of the script's parent folder)*
- `-i` or `--pid`: Path to the pid file *(default: /tmp/nodaemon-%name%.pid)*
- `-a` or `--args`: Arguments string to pass to the process *(default: empty)*
- `-l` or `--logs`: Path to the logs dir *(default: /tmp/)*
- `--log`: Path to the log file *(default: /tmp/nodaemon-%name%.log)*
- `--error-log`: Path to the error log file *(default: the same as --log)*
- `--npm`: Use `npm run daemon` command instead of `node %path%`. In this case `%path%` should be a directory with `package.json` file. You can customize the command this way `--npm my-custom-command`, then it will be launched like that: `npm run my-custom-command`. Also, you have to add `& echo $! > $PIDFILE` into the end of npm script command in the `package.json` file.

#### Examples:

```sh
nodaemon start ./my-fancy-service
```

The same, but with explicit parameters:
```sh
nodaemon start \
  -p ./my-fancy-service/index.js \
  -n my-fancy-service \
  -i /tmp/nodaemon-my-fancy-service.pid \
  --log /tmp/nodaemon-my-fancy-service.log \
  --error-log /tmp/nodaemon-my-fancy-service.log
```

The same, but without argument names:
```sh
nodaemon start \
  ./my-fancy-service/index.js \
  my-fancy-service \
  /tmp/nodaemon-my-fancy-service.pid \
  '' \
  '' \
  /tmp/nodaemon-my-fancy-service.log \
  /tmp/nodaemon-my-fancy-service.log
```

The same, but using `npm run daemon`:
```sh
nodaemon start ./my-fancy-service --npm
```

Stopping: 
```sh
nodaemon stop ./my-fancy-service
```
*It will try to find the pid file `/tmp/nodaemon-my-fancy-service.pid`, read the pid and terminate the process.*


And here's a freaky version with some total mess as arguments:
```sh
nodaemon start \
  /some/dir/inside/a/dir/script.js \
  -n very-unique-name-which-is-not-going-to-be-used-anyway \
  --pid /tmp/the-pid-of-the-service.pid \
  -l /the/path/that/is/not/going/to/be/used/because/of/the/next/two/lines
  --log /var/log/my-uber-service.log \
  --error-log /dev/null
```

Note that in order to stop or restart that messy service you have to provide the pid path:
```sh
nodaemon stop the-name-that-does-not-matter -i /tmp/the-pid-of-the-service.pid
```

**Hint:** use `--logs` (or `-l`) parameter if you want to specify the logs dir but leave the log files' names to be generated automatically based on the service name.

---

### MIT License

Copyright (c) 2018

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

