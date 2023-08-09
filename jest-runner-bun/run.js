const os = require('os');
const fs = require('fs');
const path = require('path');
const { pass, fail } = require('create-jest-runner');
const babel = require('@babel/core');


const execSync = require('child_process').execSync;

module.exports = async ({ testPath, config, globalConfig}) => {
  const start = new Date();
  const cfg = {}
  const runnerConfig = Object.assign(
    { monorepo: false, outDir: 'dist', srcDir: 'src' },
    cfg.config
  );

  runnerConfig.isMonorepo =
    typeof runnerConfig.isMonorepo === 'function'
      ? runnerConfig.isMonorepo
      : () => runnerConfig.monorepo;

  let result = null;

  try {
    const bufferConfig = new Buffer(JSON.stringify(config));
    const bufferGlobalConfig = new Buffer(JSON.stringify(globalConfig));
    const configString = bufferConfig.toString('base64');
    const globalConfigString = bufferGlobalConfig.toString('base64');
    const command = `/Users/rickhanlonii/.nvm/versions/node/v18.14.0/bin/bun ${require.resolve('./bunRunner.js')} ${testPath} ${configString} ${globalConfigString}`;

    const stdout = execSync(command, {stdio : 'pipe' });
    // console.log(`stdout: ${stdout}`);
    // console.error(`stderr: ${stderr}`);

    result = JSON.parse(stdout.toString().split('#### RESULTS ####')[1].trim());
  } catch (err) {
    console.error('err', err);
    return fail({
      start,
      end: new Date(),
      test: { path: testPath, title: 'Babel', errorMessage: err.message },
    });
  }

  if (!result) {
    return fail({
      start,
      end: new Date(),
      test: {
        path: testPath,
        title: 'Babel',
        errorMessage: 'Babel failing to transform...',
      },
    });
  }


  return result;
};
