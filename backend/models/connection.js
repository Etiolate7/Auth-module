const mongoose = require('mongoose');

mongoose.connect(process.env.URL_DB, { connectTimeoutMS: 2000 })
 .then(() => console.log('Database connected'))
  .catch(error => console.error(error));