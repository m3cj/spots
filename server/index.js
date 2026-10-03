import config from './config.js';
import { createApp } from './app.js';

const server = createApp().listen(config.port, () => {
  console.log(`SpotS API listening on port ${config.port} (${config.isProd ? 'production' : 'development'})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
