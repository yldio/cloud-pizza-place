const {
  SQS
} = require('aws-sdk')

const sqs = new SQS()

const pushBakedItem = async (conf, itemStr) => {
  await sqs.sendMessage({
    MessageBody: itemStr,
    QueueUrl: conf.BAKED_ITEMS_QUEUE_URL
  })
}

module.exports = {
  pushBakedItem
}
