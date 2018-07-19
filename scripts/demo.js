const argv = require('minimist')(process.argv.slice(2))
const { SQS } = require('aws-sdk')
const ObjectId = require('node-time-uuid')

// Params
const numberOfItems = argv.n;
const inUrl = argv.in;
const outUrl = argv.out;
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
if (!outUrl) {
  console.error('provide an --out=https://sqs....');
  erred = true;
}
if (erred) {
  return;
}

// Do it
const sqs = new SQS()

const makeItem = () => ({
  id: (new ObjectId()).toString('hex'),
  bakingTimeSecs: 60 + Math.round(Math.random() * 540),
})

const run = async () => {
  for (var i = 0; i < numberOfItems; i++) {
    await sqs.sendMessage({
      MessageBody: JSON.stringify(makeItem()),
      QueueUrl: inUrl
    }).promise()
  }
}

run()
.catch(console.error)
