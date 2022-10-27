const express = require('express')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.login)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
)

router.patch(
  '/updateDetails',
  authController.protect,
  authController.updateDetails
)

router.delete('/deleteUser', authController.protect, authController.deleteUser)

module.exports = router
