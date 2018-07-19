const { fetchConf } = require('./services/conf')
const { allocateCapacity } = require('./services/baking-table')
const { startBaking } = require('./services/item-states')
const {
  deleteMessage,
  pullItemMessage,
  pushWaitingItem,
  resetMessageVisibility
} = require('./services/waiting-items-queue')

exports.handler = async (event, context) => {
  const conf = await fetchConf()

  const records = event.Records

  while (true) {
    let isWaitingItem = true
    let record = await pullItemMessage(conf)
    if (!record) {
      isWaitingItem = false
      record = records.shift()
    }
    if (!record) {
      break
    }

    const item = JSON.parse(record.body || record.Body)
    if (item.type === 'trigger') {
      continue
    }

    const couldAllocateCapacity = await allocateCapacity(conf, 1)
    if (couldAllocateCapacity) {
      await startBaking(conf, item)
      if (isWaitingItem) {
        await deleteMessage(conf, record)
      }
      continue
    }

    if (isWaitingItem) {
      await resetMessageVisibility(conf, record)
    } else {
      await pushWaitingItem(conf, JSON.stringify(item))
    }
  }
}
