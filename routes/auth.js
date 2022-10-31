const express = require('express')
const multer = require('multer')
const AppError = require('../utils/appError')
const authController = require('../controllers/authController')
const userControllers = require('../controllers/userController')

const router = express.Router()
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   },
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Please upload image file', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

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
  upload.single('photo'),
  authController.resizeImage,
  authController.updateDetails
)

router.delete('/deleteUser', authController.protect, authController.deleteUser)

router.get(
  '/getDetails',
  authController.protect,
  userControllers.getMe,
  userControllers.getDetails
)

module.exports = router
