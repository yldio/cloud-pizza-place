const { SQS } = require('aws-sdk')

const sqs = new SQS()

const pullItemMessage = async (conf) => {
  const response = await sqs.receiveMessage({
    QueueUrl: conf.WAITING_ITEMS_QUEUE_URL,
    MaxNumberOfMessages: 1
  }).promise()

  return response.Messages && response.Messages[0]
}

const deleteMessage = async (conf, message) => {
  await sqs.deleteMessage({
    QueueUrl: conf.WAITING_ITEMS_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle
  }).promise()
}

const resetMessageVisibility = async (conf, message) => {
  await sqs.changeMessageVisibility({
    QueueUrl: conf.WAITING_ITEMS_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
    VisibilityTimeout: 0
  }).promise()
}

const pushWaitingItem = async (conf, itemStr) => {
  await sqs.sendMessage({
    MessageBody: itemStr,
    QueueUrl: conf.WAITING_ITEMS_QUEUE_URL
  }).promise()
}

module.exports = {
  deleteMessage,
  pullItemMessage,
  pushWaitingItem,
  resetMessageVisibility
}
