'use strict';

module.exports = () => console.info(`
Usage: nodaemon <command> <path> [name [pidfile [args [logs [log [error-log]]]]]] [options]

Commands:
  start
  stop
  restart

Options:
  -p --path    Path to the script file or folder with 'index.js'
  -n --name    Name of the daemon (default: the name of the script's parent folder)
  -i --pid     Path to the pid file (default: /tmp/nodaemon-%name%.pid)
  -a --args    Arguments string to pass to the process (default: empty)
  -l --logs    Path to the logs dir (default: /tmp/)
  --log        Path to the log file (default: /tmp/nodaemon-%name%.log)
  --error-log  Path to the error log file (default: the same as --log)
  --npm        Use 'npm run daemon' command instead of 'node %path%'.
               In this case %path% should be a directory with 'package.json' file.
               You can customize the command this way '--npm my-custom-command',
               then it will be launched like that: 'npm run my-custom-command'.
               Also, you have to add '& echo $! > $PIDFILE' into the end of the npm script command inside the 'package.json' file.
`);
