# serverless-pizza-oven
Our pizza oven is serverless, hot and always ready for baking cheesy items from the YLD menu!

## What?

We're simulating a pizza oven for using AWS CloudFormation, SQS, Step Functions, DynamoDB and Lambda. It's all pay-per-use, so it should cost us practically nothing while it isn't being used.

More about this soon.

## Demo

![Demo Gif](docs/images/demo.gif)

To send 100 pizzas to the oven:

```
$ node examples/demo
  --n=100
  --in=https://sqs.eu-west-1.amazonaws.com/.../spo-NewItems
  --waiting=https://sqs.eu-west-1.amazonaws.com/.../spo-WaitingItems.fifo
  --out=https://sqs.eu-west-1.amazonaws.com/.../spo-BakedItems
```

## Developing

```
$ npm run test:watch
```

## Deploying

Create a package, specifying and S3 bucket for uploading our artifacts, e.g.:

```
$ npm run package -- --s3-bucket deploymentbucket-emxyh72p1x99
```

Then deploy to your AWS account:

```
$ npm run deploy
```
