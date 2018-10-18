const { SQS } = require('aws-sdk')

const sqs = new SQS()

const triggerMessage = JSON.stringify({ type: 'trigger' })

const pushTriggerMessage = async (conf) => {
  await sqs.sendMessage({
    MessageBody: triggerMessage,
    QueueUrl: conf.NEW_ITEMS_QUEUE_URL
  }).promise()
}

module.exports = {
  pushTriggerMessage
}
