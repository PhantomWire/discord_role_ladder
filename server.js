const express = require('express');
const app = express();
const { readStoredData } = require('./storeUtils');
const PORT = 9000;

app.listen(PORT, () => `Phantom Wire User Role Ladder Server Started on Port ${PORT}`);

app.get(`/data`, (req, res, next) => {
  res.json(readStoredData());
  next();
});