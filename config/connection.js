const mongoose = require('mongoose')

module.exports = mongoose
  .connect(process.env.MONGODB_DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connection successful')
  })
  .catch((err) => {
    console.log('error is ', err)
  })
