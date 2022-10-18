const express = require('express')
const tourControllers = require('../controllers/tourControllers')
const authController = require('../controllers/authController')

const router = express.Router()

// alias routes
router
  .route('/top-5-tours')
  .get(tourControllers.topAlias, tourControllers.getTours)
router.route('/getStats').get(tourControllers.getTourStats)

router.route('/').get(authController.protect ,tourControllers.getTours).post(authController.protect, tourControllers.createTour)

router
  .route('/:id')
  .get(authController.protect, tourControllers.getTourById)
  .patch(authController.protect, tourControllers.updateTour)
  .delete(authController.protect, tourControllers.deleteTour)

// router.post('/addTours', tourControllers.addTours)

module.exports = router
