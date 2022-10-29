const Reviews = require('../models/reviews')
const handleFactory = require('./handleFactory')

const reviewController = {}

reviewController.getBodyData = (req, res, next) => {
  const { user } = req
  const { tourId } = req.params
  req.body.user = user
  req.body.tour = tourId
  next()
}

reviewController.getReviews = handleFactory.getDocs(Reviews)
reviewController.getReviewById = handleFactory.getDoc(Reviews)
reviewController.createReview = handleFactory.createDoc(Reviews)
reviewController.updateReview = handleFactory.updateDoc(Reviews)
reviewController.deleteReview = handleFactory.deleteDoc(Reviews)

module.exports = reviewController
