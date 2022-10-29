const express = require('express')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

const router = express.Router()

router.route('/').post(authController.protect, reviewController.createReview)

module.exports = router
