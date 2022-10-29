const AppError = require('../utils/appError')
const APIFeature = require('../utils/fetchClass')

const handleFactory = {}

handleFactory.deleteDoc = (Model) => async (req, res, next) => {
  const { id } = req.params
  try {
    const tourData = await Model.findByIdAndDelete({ _id: id })
    res.status(200).json({
      status: true,
      data: tourData,
    })
  } catch (err) {
    next(new AppError('Record not found', 404, err))
  }
}

handleFactory.updateDoc = (Model) => async (req, res, next) => {
  const { id } = req.params
  const data = req.body
  try {
    const tourData = await Model.findByIdAndUpdate({ _id: id }, data, {
      new: true,
      runValidators: true,
    })
    res.status(200).json({
      status: true,
      data: tourData,
    })
  } catch (err) {
    next(new AppError('Invalid Inputs', 400, err))
  }
}

handleFactory.createDoc = (Model) => async (req, res, next) => {
  try {
    const review = await Model.create(req.body)
    res.status(201).json({
      status: true,
      data: review,
    })
  } catch (err) {
    next(new AppError('Invalid Inputs', 400, err))
  }
}

handleFactory.getDoc = (Model, popOptions) => async (req, res, next) => {
  const { id } = req.params
  try {
    let query = Model.findOne({
      _id: id,
    })

    if (popOptions) {
      query = query.populate(popOptions)
    }

    const doc = await query

    if (!doc) {
      return next(new AppError('Record not found', 404))
    }

    res.status(200).json({
      status: true,
      data: doc,
    })
  } catch (err) {
    next(new AppError('No tour found with that id', 404, err))
  }
}

handleFactory.getDocs = (Model) => async (req, res, next) => {
  try {
    //execute query
    const toursData = new APIFeature(Model, req.query)
      .filter()
      .sort()
      .fields()
      .paginate()

    const tours = await toursData.query

    res.status(200).json({
      status: true,
      total: tours.length,
      data: tours,
    })
  } catch (err) {
    console.log('error is ', err)
    next(new AppError('Records not found', 404, err))
  }
}

module.exports = handleFactory
