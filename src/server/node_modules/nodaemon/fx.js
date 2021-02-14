'use strict';

const fs = require('fs'),
	path = require('path'),
	cp = require('child_process');

const dirname = file => {
	try {
		if(fs.statSync(file).isFile())
			return /.*\/([^\/]+)\/?$/g.exec(fs.realpathSync(path.dirname(file)))[1];
		else
			return path.parse(file).base;
	}
	catch(error) {
		console.error(`Something's wrong with the provided path <${file}>:`, error.message);
		process.exit(1);
	}
};

const readFile = f => fs.existsSync(f) ? fs.readFileSync(f) : null;
const writeFile = (f, data) => fs.writeFileSync(f, data);

const isProcessRunning = pid => {
	if(pid && fs.existsSync(pid)) {
		try {
			return process.kill(readFile(pid), 0);
		}
		catch(error) {
			return error.code === 'EPERM'; // if <true> — process is running, you just have no rights to manage it
		}
	}
	else
		return false;
};

const processStart = config => {
	if(isProcessRunning(config.pid)) {
		console.error(`ERROR: couldn't start process ${config.name}, because it's already running: ${readFile(config.pid)}`);
		return false;
	}

	let command = '';

	if(config.npm)
		command = `PIDFILE=${config.pid} /usr/bin/env npm run ${config.npm} ${config.args} 1>> ${config.stdlog} 2>> ${config.errlog}`;
	else
		command = `/usr/bin/env node ${config.path} ${config.args} 1>> ${config.stdlog} 2>> ${config.errlog} & echo $!`;

	try {
		let p = cp.spawnSync(command, [], {
			cwd: fs.realpathSync(path.dirname(config.path)),
			shell: true
		});

		if(!p.error) {
			if(!config.npm)
				writeFile(config.pid, p.stdout.toString('ascii'));

			return true;
		}
		else
			throw new Error(p.error);
	}
	catch(error) {
		console.error(`ERROR: couldn't start the process ${config.name} due to error:`, error);
		return false;
	}
};

const processStop = config => {
	if(!isProcessRunning(config.pid)) {
		console.error(`ERROR: couldn't stop process ${config.name}, it isn't running.`);
		return false;
	}

	try {
		return process.kill(readFile(config.pid), 'SIGTERM');
	}
	catch(error) {
		console.error(`ERROR: couldn't stop process ${config.name} [${readFile(config.pid)}]:`, error.message);
		return false;
	}
};

const processRestart = config => processStop(config) && processStart(config);

module.exports = {
	dirname,
	isProcessRunning,
	process: {
		start: processStart,
		stop: processStop,
		restart: processRestart
	}
};
