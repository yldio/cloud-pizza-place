const {
  fetchConf
} = require('./services/conf')
const {
  countItems,
  insertItem
} = require('./services/baking-table')
const {
  pullItemMessages,
  pushWaitingItem,
  deleteMessage
} = require('./services/waiting-items-queue')

exports.handler = async (event, context) => {
  const conf = await fetchConf()

  const itemsCount = await countItems(conf)
  let availableCapacityCount = conf['BAKING_TABLE_CAPACITY_COUNT'] - itemsCount

  const waitingMessages = await pullItemMessages(conf, availableCapacityCount)
  const waitingAndNewMessages = waitingMessages.concat(event.Records)

  while (true) {
    const record = waitingAndNewMessages.shift()
    if (!record) {
      break
    }

    const item = JSON.parse(record.body || record.Body)

    if (item.type === 'trigger') {
      continue
    }

    if (availableCapacityCount > 0) {
      availableCapacityCount -= 1
      await insertItem(conf, item)
      if (waitingMessages.includes(record)) {
        await deleteMessage(conf, record)
      }
      continue
    }

    await pushWaitingItem(conf, item)
  }
}
