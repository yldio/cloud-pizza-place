const { fetchConf } = require('./services/conf')
const { emitUpdate } = require('./services/stock-stream')

exports.handler = async (event, context) => {
  const conf = await fetchConf()

  for (const record of event.Records) {
    const doc = record.dynamodb.NewImage
    if (doc) {
      const isAggregate = doc.batch_id.S === 'all'
      if (!isAggregate) {
        continue
      }

      const typeId = doc.id.S
      const quantity = parseInt(doc.quantity.N, 10)
      const sequenceNumber = record.dynamodb.SequenceNumber

      await emitUpdate(conf, {
        typeId,
        quantity,
        sequenceNumber
      })
    }
  }
}
