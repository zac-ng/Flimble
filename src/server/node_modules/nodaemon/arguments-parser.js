'use strict';

const typefy = x => {
	try {
		return JSON.parse(x);
	}
	catch(error) {
		return x;
	}
};

const startsWithDashes = s => /^\-[^\s\-]|--\S+/.test(s);
const stripStartingDashes = s => /^\-+(.*)/.exec(s)[1];
const parseKeyValue = s => (stuff => ({key: stuff[1], value: stuff[2]}))(/^\-+([^=]+)=(.*)/.exec(s));

module.exports = () => {
	let argv = process.argv.slice(2),
		args = {$: []};

	for(let i = 0; i < argv.length; i++) {
		let a = argv[i];

		if(startsWithDashes(a)) {
			if(!a.includes('=')) {
				if(argv[i+1] && !startsWithDashes(argv[i+1])) { // the next argument exists and it's not a key
					args[stripStartingDashes(a)] = typefy(argv[i+1]);
					i++;
				}
				else
					args[stripStartingDashes(a)] = true;
			}
			else
				(({key, value}) => args[key] = typefy(value))(parseKeyValue(a));
		}
		else
			args.$.push(typefy(a));
	}

	return args;
};
