const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const sharp = require('sharp')
const Users = require('../models/users')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const authController = {}

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) {
      newObj[field] = obj[field]
    }
  })
  return newObj
}

authController.signUp = async (req, res, next) => {
  try {
    const newUser = await Users.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    })

    const token = createToken(newUser._id)

    const cookieOptions = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)

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

    const cookieOptions = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)

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

    // check if user is inactive
    // if (!user.active) {
    //   return next(new AppError('User not active'), 404)
    // }

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

authController.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not allowed to access this route'), 404)
    }
    next()
  }

authController.forgotPassword = async (req, res, next) => {
  try {
    // find user by that email
    const findUser = await Users.findOne({ email: req.body.email })
    if (!findUser) {
      return next(new AppError('No user with this email found', 404))
    }

    // generate a random token
    const resetToken = findUser.createPasswordResetToken()
    await findUser.save({ validateBeforeSave: false })

    // send email for token
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Reset password ${resetUrl}`

    try {
      await sendEmail({
        email: findUser.email,
        subject: 'Reset Password',
        message,
      })

      res.status(200).json({
        status: true,
        message: 'Email sent',
      })
    } catch (err) {
      findUser.passwordResetToken = undefined
      findUser.passwordResetExpiry = undefined

      findUser.save({ validateBeforeSave: false })
      return next(new AppError(err.message, 500, err))
    }
  } catch (err) {
    next(new AppError(err.message, 400, err))
  }
}

authController.resizeImage = (req, res, next) => {
  if (!req.file) return next()

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next()
}

authController.resetPassword = async (req, res, next) => {
  try {
    // get user details by hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')
    const findUser = await Users.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: {
        $gt: Date.now(),
      },
    })

    // set new password if user exists and token not expired
    if (!findUser) {
      return next(new AppError('Token is invalid or expired', 400))
    }
    findUser.password = req.body.password
    findUser.passwordConfirm = req.body.passwordConfirm
    findUser.passwordResetToken = undefined
    findUser.passwordResetExpiry = undefined
    findUser.passwordChangedAt = Date.now() - 1000
    await findUser.save()

    // set token and login user
    const token = createToken(findUser._id)

    const cookieOptions = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)

    res.status(200).json({
      status: true,
      token,
    })
  } catch (err) {
    return next(new AppError(err.message, 500, err))
  }
}

authController.updatePassword = async (req, res, next) => {
  try {
    // get user from collection
    const { user } = req
    const findUser = await Users.findById(user._id).select('+password')

    if (!findUser) {
      return next(new AppError('User not found', 404))
    }

    // check if posted password is equal to password in db
    const correctPassword = await findUser.correctPassword(
      req.body.currentPassword,
      findUser.password
    )

    if (!correctPassword) {
      return next(new AppError('Current password not matching', 400))
    }

    // update password findbyidandupdate will not work intended since we have pre hooks for save
    findUser.password = req.body.password
    findUser.passwordConfirm = req.body.passwordConfirm
    findUser.passwordChangedAt = Date.now() - 1000
    await findUser.save()

    // log user in and send jwt
    const token = createToken(findUser._id)

    const cookieOptions = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)

    res.status(200).json({
      status: true,
      token,
    })
  } catch (err) {
    return next(new AppError(err.message, 500, err))
  }
}

authController.updateDetails = async (req, res, next) => {
  try {
    console.log('file is ', req.file)
    // create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route not used for password update', 400))
    }

    // update user document
    const { user } = req
    const filterObject = filterObj(req.body, 'name', 'email')

    if (req.file) filterObject.photo = req.file.filename

    const updateUser = await Users.findByIdAndUpdate(
      { _id: user.id },
      filterObject,
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      status: true,
      data: {
        user: updateUser,
      },
    })
  } catch (err) {
    return next(new AppError(err.message, 500, err))
  }
}

authController.deleteUser = async (req, res, next) => {
  try {
    const { user } = req
    const updateUser = await Users.findByIdAndUpdate(
      { _id: user.id },
      {
        active: false,
      },
      {
        new: true,
      }
    )
    res.status(200).json({
      status: true,
      data: {
        user: updateUser,
      },
    })
  } catch (err) {
    return next(new AppError(err.message, 500, err))
  }
}

module.exports = authController
