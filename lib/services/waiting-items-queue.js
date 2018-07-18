const {
  SQS
} = require('aws-sdk')

const sqs = new SQS()

const MAX_MESSAGES_PER_PULL = 10

const pullItemMessages = async (conf, limit) => {
  const maxPulls = Math.ceil(limit / MAX_MESSAGES_PER_PULL)
  const messages = []

  for (var i = 0; i < maxPulls; i++) {
    const response = await sqs.receiveMessage({
      QueueUrl: conf.WAITING_ITEMS_QUEUE_URL,
      MaxNumberOfMessages: MAX_MESSAGES_PER_PULL
    }).promise()

    if (response.Messages.length > 0) {
      messages.apply(messages, response.Messages)
    } else if (response.Messages.length < MAX_MESSAGES_PER_PULL) {
      break
    }
  }

  return messages
}

const deleteMessage = async (conf, message) => {
  await sqs.deleteMessage({
    QueueUrl: conf.WAITING_ITEMS_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle
  }).promise()
}

const pushWaitingItem = async (conf, itemStr) => {
  await sqs.sendMessage({
    MessageBody: itemStr,
    QueueUrl: conf.WAITING_ITEMS_QUEUE_URL
  })
}

module.exports = {
  pullItemMessages,
  deleteMessage,
  pushWaitingItem
}
