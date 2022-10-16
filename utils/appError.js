class AppError extends Error {
  constructor(message, statusCode, err) {
    super(message)

    this.statusCode = statusCode
    this.status = false
    this.isOperational = true
    this.error = err
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
