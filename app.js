const express = require('express')
const dotenv = require('dotenv')
const tourRoutes = require('./routes/tours')

const app = express()
app.use(express.json())
dotenv.config()
// eslint-disable-next-line no-unused-vars
const connection = require('./config/connection')

app.use('/tours', tourRoutes)

const port = 5000
app.listen(port, () => {
  console.log('server running on ', port)
})
