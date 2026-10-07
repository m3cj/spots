import config from './config.js';
import { createApp } from './app.js';
import { startEventExpiryJob } from './jobs/expireEvents.js';

const expiryJob = startEventExpiryJob();

const server = createApp().listen(config.port, () => {
  console.log(`SpotS API listening on port ${config.port} (${config.isProd ? 'production' : 'development'})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    expiryJob?.stop?.();
    server.close(() => process.exit(0));
  });
}
