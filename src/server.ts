import express from 'express';
import { setupApp } from './setupServer';

const app = express();
setupApp(app);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
