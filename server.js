const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/kifleandmilka', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/kifleandmilka');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
