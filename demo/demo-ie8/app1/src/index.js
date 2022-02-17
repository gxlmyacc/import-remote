import app2 from './app2';

function run() {
  app2.import('app').then(v => {
    console.error('app2 imported:', v);
  });
}

run();
