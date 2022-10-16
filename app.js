const express = require('express')
const dotenv = require('dotenv')
const AppError = require('./utils/appError')
const tourRoutes = require('./routes/tours')
const authRoutes = require('./routes/auth')
const errorController = require('./controllers/errorController')

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
})

const app = express()
app.use(express.json())
dotenv.config()
// eslint-disable-next-line no-unused-vars
const connection = require('./config/connection')

app.use('/tours', tourRoutes)
app.use('/users', authRoutes)

app.all('*', (req, res, next) => {
  next(new AppError('Wrong Route', 404))
})

app.use(errorController)

const port = 5000
app.listen(port, () => {
  console.log('server running on ', port)
})

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message)
})
