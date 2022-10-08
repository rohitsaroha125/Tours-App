const express = require('express')
const tourControllers = require('../controllers/tourControllers')

const router = express.Router()

router.get('/', tourControllers.getTours)
router.get('/:id', tourControllers.getTourById)
router.post('/', tourControllers.createTour)
router.patch('/:id', tourControllers.updateTour)
router.delete('/:id', tourControllers.deleteTour)

// router.post('/addTours', tourControllers.addTours)

module.exports = router
