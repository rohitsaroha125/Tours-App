const express = require('express')
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const AppError = require('./utils/appError')
const tourRoutes = require('./routes/tours')
const authRoutes = require('./routes/auth')
const reviewRoutes = require('./routes/review')
const errorController = require('./controllers/errorController')

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
})

const app = express()

// security http headers
app.use(helmet())

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests try back in some time',
})

// rate limiting security
app.use('/tours', limiter)

app.use(express.json({ limit: '10kb' }))

app.use(mongoSanitize())
app.use(xss())
app.use(hpp())

dotenv.config()
// eslint-disable-next-line no-unused-vars
const connection = require('./config/connection')

app.use('/tours', tourRoutes)
app.use('/users', authRoutes)
app.use('/reviews', reviewRoutes)

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
