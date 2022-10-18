const jwt = require('jsonwebtoken')
const Users = require('../models/users')
const { use } = require('../routes/tours')
const AppError = require('../utils/appError')

const authController = {}

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

authController.signUp = async (req, res, next) => {
  try {
    const newUser = await Users.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    })

    const token = createToken(newUser._id)

    res.status(201).json({
      status: true,
      token,
      data: {
        user: newUser,
      },
    })
  } catch (err) {
    next(new AppError(err.message, 400))
  }
}

authController.login = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return next(new AppError('Both email and password are required', 400))
  }
  try {
    const findUser = await Users.findOne({ email }).select('+password')
    const correct = await findUser.correctPassword(password, findUser.password)

    if (!findUser || !correct) {
      return next(new AppError('Incorrect email or password', 401))
    }

    const token = createToken(findUser._id)

    res.status(200).json({
      status: true,
      token,
    })
  } catch (err) {
    next(new AppError('Something went wrong', 500, err))
  }
}

authController.protect = async (req, res, next) => {
  // getting token and check if it's there
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('You are not logged in!', 401))
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // check if user exists
    const user = await Users.findById(decoded.id)
    if (!user) {
      return next(new AppError('User belonging to token is not there', 401))
    }

    // check if password changed after
    if (user.changePasswordAfter(decoded.iat)) {
      return next(new AppError('Password changed after token generated', 401))
    }

    req.user = user

    next()
  } catch (err) {
    next(new AppError(err.message, 400))
  }
}

module.exports = authController
