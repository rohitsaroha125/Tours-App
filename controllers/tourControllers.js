const https = require('https')
const Tour = require('../models/tours')

const tourControllers = {}

tourControllers.getTours = async (req, res) => {
  try {
    const tourData = await Tour.find()
    res.status(200).json({
      status: true,
      data: tourData,
    })
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    })
  }
}

tourControllers.getTourById = async (req, res) => {
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
    console.log('error is ', err)
    res.status(404).json({
      status: false,
      message: 'Record not found',
    })
  }
}

tourControllers.createTour = async (req, res) => {
  const data = req.body
  try {
    const tourData = new Tour(data)
    const saveTour = await tourData.save()
    res.status(201).json({
      status: true,
      data: saveTour,
    })
  } catch (err) {
    res.status(400).json({
      status: false,
      message: 'Invalid data sent',
    })
  }
}

tourControllers.updateTour = async (req, res) => {
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
    res.status(500).json({
      status: false,
      message: err.message,
    })
  }
}

tourControllers.deleteTour = async (req, res) => {
  const { id } = req.params
  try {
    const tourData = await Tour.findByIdAndDelete({ _id: id })
    res.status(200).json({
      status: true,
      data: tourData,
    })
  } catch (err) {
    res.status(404).json({
      status: false,
      message: err.message,
    })
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

module.exports = tourControllers
