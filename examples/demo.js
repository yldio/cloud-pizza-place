const argv = require('minimist')(process.argv.slice(2))
const { SQS, DynamoDB } = require('aws-sdk')
const ObjectId = require('node-time-uuid')
const babar = require('babar')

// Params
const numberOfItems = argv.n;
const inUrl = argv.in;
const waitingUrl = argv.waiting;
const outUrl = argv.out;
const tableName = argv.table || 'BakingTable';

let lastId = argv.lastId || 0;

var erred = false;
if (!numberOfItems || numberOfItems < 0) {
  console.error('provide a positive number of items --n=1');
  erred = true;
}
if (!inUrl) {
  console.error('provide an --in=https://sqs...');
  erred = true;
}
if (!waitingUrl) {
  console.error('provide an --waiting=https://sqs...');
  erred = true;
}
if (!outUrl) {
  console.error('provide an --out=https://sqs...');
  erred = true;
}
if (!tableName) {
  console.error('provide an --table=BakingTable');
  erred = true;
}
if (erred) {
  return;
}

// Do it
const sqs = new SQS()
const dynamodb = new DynamoDB()

const makeItem = () => ({
  id: (new ObjectId()).toString('hex'),
  bakingTimeSecs: 15,// + Math.round(Math.random() * 30),
})

const initialCountsByQueueUrl = {}

const getApproximateQueueCounts = async (queueUrl) => {
  const response = await sqs.getQueueAttributes({
    QueueUrl: queueUrl,
    AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
  }).promise()

  const counts = {
    available: Number(response.Attributes['ApproximateNumberOfMessages']),
    inFlight: Number(response.Attributes['ApproximateNumberOfMessagesNotVisible'])
  }

  if (!initialCountsByQueueUrl[queueUrl]) {
    initialCountsByQueueUrl[queueUrl] = counts
  }
  return {
    available: counts.available - initialCountsByQueueUrl[queueUrl].available,
    inFlight: counts.inFlight,
  }
}

const getOccupiedCapacityCount = async () => {
  const response = await dynamodb.getItem({
    TableName: tableName,
    Key: {
      id: {
        S: 'capacity'
      }
    }
  }).promise()
  return Number(response.Item.occupied.N)
}

let initialOutCount = null

const showStats = async () => {
  const counts = await Promise.all([
    getApproximateQueueCounts(inUrl),
    getApproximateQueueCounts(waitingUrl),
    getOccupiedCapacityCount(),
    getApproximateQueueCounts(outUrl),
  ])

  const inCount = counts[0].available
  const outCount = counts[3].available
  const bakingCount = counts[2]
  const waitingCount = counts[1].available
  const maxY = Math.max(numberOfItems, inCount, waitingCount, bakingCount, outCount)

  const chart = babar([
    ['-4', inCount],
    ['-3', waitingCount],
    ['-2', bakingCount],
    ['-1', outCount],
  ], {
    width: 80,
    grid: 'blue',
    height: 10,
    color: 'yellow',
    maxY
  })
  .replace('-1   ', 'OUT 🍕')
  .replace('-2       ', 'BAKING 🔥‍')
  .replace('-3         ', 'WAITING 🔜')
  .replace('-4  ', 'IN 👩‍🍳')

  console.log('\033c')
  console.log(chart)
}

const run = async () => {
  setInterval(() => {
    showStats()
    .catch(console.error)
  }, 1000)

  for (var i = 0; i < numberOfItems; i++) {
    await sqs.sendMessage({
      MessageBody: JSON.stringify(makeItem()),
      QueueUrl: inUrl
    }).promise()
  }
}

run()
.catch(console.error)
