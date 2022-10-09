const express = require('express')
const tourControllers = require('../controllers/tourControllers')

const router = express.Router()

// alias routes
router
  .route('/top-5-tours')
  .get(tourControllers.topAlias, tourControllers.getTours)
router.route('/getStats').get(tourControllers.getTourStats)

router.route('/').get(tourControllers.getTours).post(tourControllers.createTour)

router
  .route('/:id')
  .get(tourControllers.getTourById)
  .patch(tourControllers.updateTour)
  .delete(tourControllers.deleteTour)

// router.post('/addTours', tourControllers.addTours)

module.exports = router
