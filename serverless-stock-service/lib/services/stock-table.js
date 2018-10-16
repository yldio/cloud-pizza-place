const { DynamoDB } = require('aws-sdk')

const dynamodb = new DynamoDB()

const createBatch = async (conf, {
  batchId,
  typeId,
  quantity,
  expiresAt
}) => {
  const expiresAtEpoch = (expiresAt.valueOf() / 1000)

  await dynamodb.putItem({
    TableName: conf['STOCK_TABLE_NAME'],
    Item: {
      'id': {
        S: typeId
      },
      'batch_id': {
        S: batchId
      },
      'quantity': {
        N: String(quantity)
      },
      'expires_et': {
        N: String(expiresAtEpoch)
      }
    }
  }).promise()
}

const incStock = async (conf, {
  batchId,
  typeId,
  quantity
}) => {
  await dynamodb.updateItem({
    TableName: conf['STOCK_TABLE_NAME'],
    Key: {
      id: {
        S: typeId
      },
      batch_id: {
        S: 'all'
      }
    },
    UpdateExpression: `
      ADD quantity :incr,
          batches :batch
    `,
    ConditionExpression: 'NOT contains (batches, :batch)',
    ExpressionAttributeValues: {
      ':incr': {
        N: String(quantity)
      },
      ':batch': {
        SS: [batchId]
      }
    },
    ReturnValues: 'ALL_NEW'
  }).promise()
}

const expireStockByBatch = async (conf, {
  batchId,
  typeId,
  quantity
}) => {
  await dynamodb.updateItem({
    TableName: conf['STOCK_TABLE_NAME'],
    Key: {
      id: {
        S: typeId
      },
      batch_id: {
        S: 'all'
      }
    },
    UpdateExpression: `
      ADD quantity :incr
      DELETE batches :batch
    `,
    ConditionExpression: 'contains (batches, :batch_str)',
    ExpressionAttributeValues: {
      ':incr': {
        N: String(-1 * quantity)
      },
      ':batch': {
        SS: [batchId]
      },
      ':batch_str': {
        S: batchId
      }
    },
    ReturnValues: 'ALL_NEW'
  }).promise()
}

const removeStock = async (conf, {
  typeId,
  quantity
}) => {
  console.log(typeId, quantity)
  try {
    await dynamodb.updateItem({
      TableName: conf['STOCK_TABLE_NAME'],
      Key: {
        id: {
          S: typeId
        },
        batch_id: {
          S: 'all'
        }
      },
      UpdateExpression: `
        ADD quantity :incr
      `,
      ConditionExpression: 'quantity >= :limit',
      ExpressionAttributeValues: {
        ':incr': {
          N: String(-1 * quantity)
        },
        ':limit': {
          N: String(quantity)
        }
      },
      ReturnValues: 'ALL_NEW'
    }).promise()
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

const revertStock = (conf, item) => {
  return removeStock(conf, {
    ...item,
    quantity: item.quantity * -1
  })
}

module.exports = {
  createBatch,
  incStock,
  expireStockByBatch,
  removeStock,
  revertStock
}
