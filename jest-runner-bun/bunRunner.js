const JestCircus = require('jest-circus-bun/runner');

const JestNodeEnvironment = require ('jest-environment-node');

// globalConfig,
//   config,
//   environment,
//   runtime,
//   testPath,
//   sendMessageToJest

async function run() {
  try {
    const testPath = process.argv[2];
    const config = JSON.parse(new Buffer(process.argv[3], 'base64').toString('ascii'));
    const globalConfig = JSON.parse(new Buffer(process.argv[4], 'base64').toString('ascii'));

    Object.assign(config, {
      snapshotSerializers: [],
      fakeTimers: {},
      setupFilesAfterEnv: [],
      injectGlobals: false,
    });

    const result = await JestCircus(globalConfig, config, JestNodeEnvironment, {
      requireInternalModule: (module) => {
        console.log('requireInternalModule', module);
        try {
          return require(module);
        } catch (e) {
          console.log('requireInternalModule error', e);
          throw e;
        }
      },
      requireModule: require,

      unstable_shouldLoadAsEsm: () => {
        console.log('unstable_shouldLoadAsEsm')
        return false;
      },
      setGlobalsForRuntime: (runtimeGlobals) => {
        Object.assign(global, runtimeGlobals);
      },
    }, testPath, () => {
      console.log('XX message to jest');
    });

    console.log('#### RESULTS ####');
    console.log(JSON.stringify(result));

  } catch (e) {
    console.log('error', e);
  }
}

console.log('start');

run();

console.log('end2');
