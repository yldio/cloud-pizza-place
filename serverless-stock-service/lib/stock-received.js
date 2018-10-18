const { fetchConf } = require('./services/conf')
const { getStock } = require('./services/stock-bucket')
const { incStock, createBatch } = require('./services/stock-table')

exports.handler = async (event, context) => {
  const conf = await fetchConf()

  for (const record of event.Records) {
    const rows = await getStock(conf, {
      batchId: `${record.s3.bucket.name}/${record.s3.object.key}`,
      bucketName: record.s3.bucket.name,
      key: record.s3.object.key
    })
    for (const row of rows) {
      await incStock(conf, row)
      await createBatch(conf, row)
    }
  }
}
