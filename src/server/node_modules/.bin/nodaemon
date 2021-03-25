#! /usr/bin/env node
'use strict';

const fs = require('fs'),
	parseArgs = require('./arguments-parser'),
	showHelp = require('./show-help'),
	fx = require('./fx');

const nodaemon = (config = {}) => {
	const args = parseArgs(),
		command = args.$[0];

	if(!['start', 'stop', 'restart'].includes(command)) {
		console.error(`ERROR: unsupported command: '${command}'`);
		showHelp();
		process.exit(1);
	}

	if(!config.path)
		config.path = args.path || args.p || args.$[1];

	if(!config.path)
		process.exit(console.error('ERROR: you haven\'t provided the path') || 1);

	if(typeof config.npm !== 'boolean')
		config.npm = (args.npm === true ? 'daemon' : args.npm) || false;

	if(!config.npm) {
		try {
			if(!fs.statSync(config.path).isFile() && !fs.statSync(config.path + '/index.js').isFile())
				throw new Error('wrong path');
		}
		catch(error) {
			console.error(`ERROR: '${config.path}' is not a file and not a folder with 'index.js'!`);
			process.exit(1);
		}
	} else {
		try {
			if(!fs.statSync(config.path).isDirectory() || !fs.statSync(config.path + '/package.json').isFile())
				throw new Error('wrong path');
		}
		catch(error) {
			console.error(`ERROR: '${config.path}' is not a directory or doesn't contain 'package.json'!`);
			process.exit(1);
		}
	}

	if(!config.name)
		config.name = args.name || args.n || args.$[2] || fx.dirname(config.path);

	if(!config.pid)
		config.pid = args.pid || args.i || args.$[3] || `/tmp/nodaemon-${config.name}.pid`;

	if(!config.args)
		config.args = args.args || args.a || args.$[4] || '';

	if(!config.logs)
		config.logs = args.logs || args.l || args.$[5] || '/tmp';

	if(!config.stdlog)
		config.stdlog = args.log || args.$[6] || `${config.logs}/nodaemon-${config.name}.log`;

	if(!config.errlog)
		config.errlog = args['error-log'] || args.$[7] || config.stdlog;

	if(command === 'start')
		return fx.process.start(config);

	if(command === 'stop')
		return fx.process.stop(config);

	if(command === 'restart')
		return fx.process.restart(config);
};

if(require.main === module)
	nodaemon();
else
	module.exports = nodaemon;
