const { fetchConf } = require('./services/conf')
const { deallocateCapacity } = require('./services/baking-table')
const { pushTriggerMessage } = require('./services/new-items-queue')
const { pushBakedItem } = require('./services/baked-items-queue')

exports.handler = async (event, context) => {
  const conf = await fetchConf()

  await deallocateCapacity(conf, 1)
  await pushTriggerMessage(conf)
  await pushBakedItem(conf, JSON.stringify(event))
}
