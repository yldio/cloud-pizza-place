const { StepFunctions } = require('aws-sdk')

const sf = new StepFunctions()

const startBaking = async (conf, item) => {
  const itemStr = JSON.stringify(item)
  await sf.startExecution({
    stateMachineArn: conf['ITEM_STATES_ARN'],
    input: itemStr,
    name: item.id
  }).promise()
}

module.exports = {
  startBaking
}
