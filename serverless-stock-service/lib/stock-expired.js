const { fetchConf } = require('./services/conf')
const { expireStockByBatch } = require('./services/stock-table')

exports.handler = async (event, context) => {
  const conf = await fetchConf()

  for (const record of event.Records) {
    if (record.eventName === 'REMOVE') {
      const typeId = record.dynamodb.OldImage.id
      const batchId = record.dynamodb.OldImage.batch_id
      const quantity = record.dynamodb.OldImage.quantity
      if (!batchId) {
        continue
      }
      try {
        await expireStockByBatch(conf, {
          batchId: batchId.S,
          typeId: typeId.S,
          quantity: parseInt(quantity.N, 10)
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
