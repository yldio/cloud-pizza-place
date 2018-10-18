# serverless-stock-service
In part 2 of our Cloud Deep Dive, we create a service to keep track of the toppings our pizza restaurant has in stock.

## What?

Still using AWS CloudFormation, we now process feeds dropped into S3, keeping track of used and expired stock in DynamoDB, with an API Gateway Lambda and streaming updates to other services via Kinesis. It's mostly pay-per-use, so it should cost practically nothing when unused.

## Developing

Our project consists of:
- A CloudFormation template [`template.yml`](template.yml)
- Our Lambda JavaScript code [`lib/**`](lib)
- Scripts and dependencies specification [`package.json`](package.json)

(NOTE: The [aws-sdk](https://github.com/aws/aws-sdk-js) library is already available in the Lambda execution environment, so we only have it as a dev dependency.)

To develop, we've mainly relied on the [AWS CLI](https://aws.amazon.com/cli/) and invoking functions locally using the [AWS SAM CLI](https://github.com/awslabs/aws-sam-cli).

```
$ npm run dev:aws:upload-stock-csv
$ npm run dev:invoke:post-transaction
$ npm run dev:invoke:stock-expired
$ npm run dev:invoke:stock-received
```

(You can see an example of tests using [Jest](https://jestjs.io) in the [serverless pizza oven](../serverless-pizza-oven) directory.)

## Deploying

If you want to try it out, I'd recommend creating/using your own AWS account and deploying into that. Every account gets a generous helping of resources on the [AWS Free Tier](https://aws.amazon.com/free/), so you can give it quite a workout before having to start paying.

Create a package, specifying an S3 bucket for uploading our artifacts, e.g.:

```
$ npm run package -- --s3-bucket deploymentbucket-emxyh72p1x99
```

Then deploy to your AWS account:

```
$ npm run deploy
```
