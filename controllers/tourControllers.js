// const https = require('https')
const Tour = require('../models/tours')
const APIFeature = require('../utils/fetchClass')
const AppError = require('../utils/appError')

const tourControllers = {}

tourControllers.topAlias = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,ratingsAverage,price,difficulty'

  next()
}

tourControllers.getTours = async (req, res, next) => {
  try {
    //execute query
    const toursData = new APIFeature(Tour, req.query)
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
    next(new AppError('Records not found', 404))
  }
}

tourControllers.getTourById = async (req, res, next) => {
  const { id } = req.params
  try {
    const tourData = await Tour.findById({
      _id: id,
    })
    res.status(200).json({
      status: true,
      data: tourData,
    })
  } catch (err) {
    next(new AppError('Records not found', 404))
  }
}

tourControllers.createTour = async (req, res, next) => {
  const data = req.body
  try {
    const tourData = new Tour(data)
    const saveTour = await tourData.save()
    res.status(201).json({
      status: true,
      data: saveTour,
    })
  } catch (err) {
    next(new AppError('Invalid Inputs', 400))
  }
}

tourControllers.updateTour = async (req, res, next) => {
  const { id } = req.params
  const data = req.body
  try {
    const tourData = await Tour.findByIdAndUpdate({ _id: id }, data, {
      new: true,
    })
    res.status(200).json({
      status: true,
      data: tourData,
    })
  } catch (err) {
    next(new AppError('Invalid Inputs', 400))
  }
}

tourControllers.deleteTour = async (req, res, next) => {
  const { id } = req.params
  try {
    const tourData = await Tour.findByIdAndDelete({ _id: id })
    res.status(200).json({
      status: true,
      data: tourData,
    })
  } catch (err) {
    next(new AppError('Record not found', 404))
  }
}

// tourControllers.addTours = async (req, response) => {
//   const url = 'https://www.natours.dev/api/v1/tours'

//   response.setHeader('Content-Type', 'text/html')
//   let flag = 0
//   https
//     .get(url, (res) => {
//       let data = ''
//       res.on('data', (chunk) => {
//         data += chunk
//       })
//       res.on('end', async () => {
//         data = JSON.parse(data)
//         const apiData = data.data.data
//         await apiData.forEach(async (item) => {
//           try {
//             const dbData = {
//               name: item.name,
//               ratingsAverage: item.ratingsAverage,
//               ratingsQuantity: item.ratingsQuantity,
//               durations: item.durations,
//               maxGroupSize: item.maxGroupSize,
//               difficulty: item.difficulty,
//               price: item.price,
//               priceDiscount: item.priceDiscount,
//               summary: item.summary,
//               description: item.description,
//               imageCover: item.imageCover,
//               images: item.images,
//               startDates: item.startDates,
//             }
//             await Tour.create(dbData)
//           } catch (err) {
//             console.log('error is ', err.message)
//             response.write('Error occured', err.message)
//             flag = 1
//           }
//         })
//         if (flag === 0) {
//           response.status(201).json({
//             status: true,
//             message: 'All data added',
//           })
//         } else {
//           response.end()
//         }
//       })
//     })
//     .on('error', (err) => {
//       console.log(err.message)
//       response.status(400).json({
//         status: false,
//         message: 'some issue occured',
//       })
//     })

//   //   res.json({
//   //     data,
//   //   })
// }

tourControllers.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4 } },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ])
    res.status(200).json({
      status: true,
      data: stats,
    })
  } catch (err) {
    res.status(404).json({
      status: false,
      message: 'Record not found',
    })
  }
}

module.exports = tourControllers
