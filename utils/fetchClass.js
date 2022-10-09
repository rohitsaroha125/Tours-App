class APIFeature {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const queryObject = { ...this.queryString }
    const excludeFields = ['page', 'limit', 'sort', 'fields']
    excludeFields.forEach((el) => delete queryObject[el])

    let queryStr = JSON.stringify(queryObject)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    this.query = this.query.find(JSON.parse(queryStr))
    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortingOptions = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortingOptions)
    }

    return this
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    }
    return this
  }

  paginate() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 10
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

module.exports = APIFeature
