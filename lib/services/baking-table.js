const {
  DynamoDB
} = require('aws-sdk')

const dynamodb = new DynamoDB()

const countItems = async (conf) => {
  const response = await dynamodb.query({
    TableName: conf['BAKING_TABLE_NAME'],
    Select: 'COUNT'
  })

  return response.Count
}

const insertItem = async (conf, item) => {
  const now = new Date()
  const removeAtEpoch = (now.valueOf() / 1000) + item.bakingTimeSecs

  await dynamodb.putItem({
    Item: {
      'id': {
        S: item.id
      },
      'bakingTimeSecs': {
        N: String(item.bakingTimeSecs)
      },
      'insertedAt': {
        S: now.toISOString()
      },
      'remove_et': {
        N: removeAtEpoch
      }
    }
  })
}

module.exports = {
  countItems,
  insertItem
}
