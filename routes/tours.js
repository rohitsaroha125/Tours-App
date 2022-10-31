const express = require('express')
const tourControllers = require('../controllers/tourControllers')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

const router = express.Router()

// alias routes
router
  .route('/top-5-tours')
  .get(tourControllers.topAlias, tourControllers.getTours)
router.route('/getStats').get(tourControllers.getTourStats)

router
  .route('/')
  .get(tourControllers.getTours)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    tourControllers.createTour
  )

router
  .route('/:id')
  .get(tourControllers.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    tourControllers.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourControllers.deleteTour
  )

router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.getBodyData,
    reviewController.createReview
  )
  .get(reviewController.getReviews)

// router.post('/addTours', tourControllers.addTours)

router
  .route('/:tourId/reviews/:id')
  .get(reviewController.getReviewById)
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )

module.exports = router
