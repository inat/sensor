'use strict';

const commandLineArgs = require('command-line-args');
const shell = require('shelljs');

const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean, defaultValue: false},
  {name: 'verbose', alias: 'v', type: Boolean, defaultValue: false},
  {name: 'delay', alias: 'd', type: Number, defaultValue: 1000},
  {name: 'targets', alias: 't', type: String, multiple: true},
  {name: 'command', alias: 'c', type: String, multiple: true},
];

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  console.log('please check this.');
  console.log(optionDefinitions);
  process.exit(1);
}

let command = options.command.join(' ');
let memo = {};

function check() {
  let mod = false;
  for (let target of options.targets) {
    let stat = `stat -f '%m %N' ${target}`;
    let res = shell.exec(stat, {silent: !options.verbose});
    if (res.code !== 0) {
      throw new Error('error');
    }
    let stdout = res.stdout.trim();
    if (!(target in memo) || (stdout !== memo[target])) {
      memo[target] = stdout;
      mod = true;
    }
  }
  return mod;
}

function exec(mod) {
  if (!mod) {
    return;
  }
  if (options.verbose) {
    shell.exec(`echo execute at $(date): ${command}`);
  }
  shell.exec(command);
}

setInterval(function() {
  exec(check());
}, options.delay);
