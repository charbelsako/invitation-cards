import { createApp } from './app';
import { config } from './utils/config';
import { connectToDatabase } from './utils/database';

const app = createApp();

connectToDatabase()
  .catch((error) => {
    console.error('Failed to connect to MongoDB.', error);
  })
  .finally(() => {
    app.listen(config.port, () => {
      console.log(`Invitation API running on http://localhost:${config.port}`);
    });
  });
