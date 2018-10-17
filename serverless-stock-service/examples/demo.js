const argv = require('minimist')(process.argv.slice(2))
const { Kinesis, S3 } = require('aws-sdk')
const axios = require('axios')
const asciichart = require('asciichart')

// Params
const url = argv.url
const bucketName = argv.bucket || 'sss-stock-drop'
const streamName = argv.stream || 'sss-StockUpdatedStream'
const itemType = argv.type || 'mushroom'

var erred = false
if (!bucketName) {
  console.error('provide a --bucket=stock-drop...')
  erred = true
}
if (!url) {
  console.error('provide a --url=https://...')
  erred = true
}
if (!streamName) {
  console.error('provide a --stream=StockStream...')
  erred = true
}
if (!itemType) {
  console.error('provide a --type=dough...')
  erred = true
}
if (erred) {
  process.exit(1)
}

const kinesis = new Kinesis()
const s3 = new S3()

const chartData = []

const addStock = async (expiresInMinutes) => {
  const quantity = 100
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60000)
  await s3.putObject({
    Bucket: bucketName,
    Body: `${itemType},${quantity},${expiresAt.toISOString()}`,
    Key: `${Date.now()}.csv`
  }).promise()
}

const useStock = async (quantity) => {
  try {
    await axios.post(url, {
      transactionId: String(Date.now()),
      items: [
        {
          typeId: itemType,
          quantity
        }
      ]
    })
  } catch (e) {
    console.log(e)
  }
}

const getFirstShardIterator = async () => {
  const shardsData = await kinesis.listShards({ StreamName: streamName }).promise()
  const iteratorData = await kinesis.getShardIterator({
    ShardId: shardsData.Shards[0].ShardId,
    ShardIteratorType: 'LATEST',
    StreamName: streamName
  }).promise()
  return iteratorData.ShardIterator
}

const run = async () => {
  // Add some soon-expiring stock
  await addStock(1)

  // Add stock every minute
  setInterval(async () => {
    await addStock(10)
  }, 60000)

  // Use stock every 10 seconds
  setInterval(async () => {
    await useStock(1 + Math.round(Math.random() * 20))
  }, 10000)

  // Update chart
  let nextShardIterator = await getFirstShardIterator()
  setInterval(async () => {
    const data = await kinesis.getRecords({
      ShardIterator: nextShardIterator
    }).promise()
    nextShardIterator = data.NextShardIterator
    for (const record of data.Records) {
      const update = JSON.parse(record.Data.toString('utf-8'))
      if (update.typeId === itemType) {
        chartData.push(update.quantity)
      }
    }
    if (chartData.length > 1) {
      console.log('\033c')
      console.log(asciichart.plot(chartData, {
        height: 15
      }))
    }
  }, 1000)
}

run()
  .catch(console.error)
