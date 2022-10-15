const express = require('express')
const dotenv = require('dotenv')
const AppError = require('./utils/appError')
const tourRoutes = require('./routes/tours')

const app = express()
app.use(express.json())
dotenv.config()
// eslint-disable-next-line no-unused-vars
const connection = require('./config/connection')

app.use('/tours', tourRoutes)

app.all('*', (req, res, next) => {
  next(new AppError('Wrong Route', 404))
})

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || false

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  })
})

const port = 5000
app.listen(port, () => {
  console.log('server running on ', port)
})
