const { fetchConf } = require('./services/conf')
const { removeStock, revertStock } = require('./services/stock-table')

exports.handler = async (event, context) => {
  const conf = await fetchConf()

  const items = JSON.parse(event.body).items
  const completedItems = []

  // NOTE: for a more resilient transaction, we should be writing
  // to the database with deduplication based on id and multi-phase commit.
  // That would allow for asynchronous batch allocation as well.

  try {
    for (const item of items) {
      if (await removeStock(conf, item)) {
        completedItems.push(item)
      } else {
        throw new Error('Incomplete')
      }
    }
  } catch (e) {
    for (const item of completedItems) {
      await revertStock(conf, item)
    }
    return {
      statusCode: 555
    }
  }
  return {
    statusCode: 201
  }
}
