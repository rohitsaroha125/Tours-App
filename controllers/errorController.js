const AppError = require('../utils/appError')

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}`
  console.log('message is ', message)
  return new AppError(message, 400, err)
}

const serveDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  })
}

const serveProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  } else {
    res.status(err.statusCode).json({
      status: 500,
      message: 'Something went wrong',
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || false

  if (process.env.NODE_ENV === 'development') {
    serveDevError(err, res)
  } else {
    let error = Object.create(err)
    if (error.name === 'CastError') {
      console.log('hello')
      error = handleCastErrorDb(error)
    }
    serveProdError(error, res)
  }
}
