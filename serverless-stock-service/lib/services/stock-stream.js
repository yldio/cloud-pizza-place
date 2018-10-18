const { Kinesis } = require('aws-sdk')

const kinesis = new Kinesis()

const emitUpdate = async (conf, {
  typeId,
  quantity
}) => {
  const jsonDataAsStr = JSON.stringify({
    typeId,
    quantity
  })
  await kinesis.putRecord({
    Data: jsonDataAsStr,
    PartitionKey: typeId,
    StreamName: conf.STOCK_UPDATED_STREAM_NAME
  }).promise()
}

module.exports = {
  emitUpdate
}
