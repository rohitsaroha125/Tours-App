const Users = require('../models/users')
const handleFactory = require('./handleFactory')

const userControllers = {}

userControllers.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

userControllers.getDetails = handleFactory.getDoc(Users)

module.exports = userControllers
