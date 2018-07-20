const { DynamoDB } = require('aws-sdk')

const dynamodb = new DynamoDB()

const allocateCapacity = async (conf, size) => {
  try {
    await dynamodb.updateItem({
      TableName: conf['BAKING_TABLE_NAME'],
      Key: {
        id: {
          S: 'capacity'
        }
      },
      UpdateExpression: 'SET occupied = occupied + :incr',
      ConditionExpression: 'occupied <= :limit',
      ExpressionAttributeValues: {
        ':incr': {
          N: String(size)
        },
        ':limit': {
          N: String(conf['BAKING_TABLE_CAPACITY'] - size)
        }
      },
      ReturnValues: 'ALL_NEW'
    }).promise()
    return true
  } catch (err) {
    return false
  }
}

const deallocateCapacity = async (conf, size) => {
  try {
    await dynamodb.updateItem({
      TableName: conf['BAKING_TABLE_NAME'],
      Key: {
        id: {
          S: 'capacity'
        }
      },
      UpdateExpression: 'SET occupied = occupied - :incr',
      ExpressionAttributeValues: {
        ':incr': {
          N: String(size)
        }
      },
      ReturnValues: 'ALL_NEW'
    }).promise()
  } catch (err) {
  }
}

module.exports = {
  allocateCapacity,
  deallocateCapacity
}
