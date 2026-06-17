const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.json({
    message: 'Jenkins AWS Secrets Docker practical is running',
    status: 'ok'
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
