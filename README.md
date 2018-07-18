# serverless-pizza-oven
Our pizza oven is serverless, always hot and always ready for baking!

## What

This is an example service using AWS CloudFormation, SQS, DynamoDB and Lambda.

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

## Demo

Coming soon.
