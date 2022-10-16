const Users = require('../models/users')
const AppError = require('../utils/appError')

const authController = {}

authController.signUp = async (req, res, next) => {
  try {
    const newUser = await Users.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    })
    res.status(201).json({
      status: true,
      data: {
        user: newUser,
      },
    })
  } catch (err) {
    next(new AppError(err.message, 400))
  }
}

module.exports = authController
