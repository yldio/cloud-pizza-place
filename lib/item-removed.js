const {
  fetchConf
} = require('./services/conf')
const {
  pushTriggerMessage
} = require('./services/new-items-queue')
const {
  pushBakedItem
} = require('./services/baked-items-queue')

exports.handler = async (event, context) => {
  const conf = await fetchConf()
  let pushedTriggerMessage = false

  for (const record of event.Records) {
    if (record.eventName !== 'REMOVE') {
      continue
    }
    if (!pushedTriggerMessage) {
      await pushTriggerMessage(conf)
      pushedTriggerMessage = true
    }
    const item = {
      id: record.dynamodb.OldImage.id.S,
      insertedAt: record.dynamodb.OldImage.insertedAt.S,
      bakingTimeSecs: parseInt(record.dynamodb.OldImage.bakingTimeSecs.N, 10)
    }
    await pushBakedItem(conf, JSON.stringify(item))
  }
}
