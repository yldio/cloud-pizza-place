const fetchConf = async () => {
  return {
    BAKED_ITEMS_QUEUE_URL: process.env['BAKED_ITEMS_QUEUE_URL'],
    BAKING_TABLE_CAPACITY: parseInt(process.env['BAKING_TABLE_CAPACITY'], 10),
    BAKING_TABLE_NAME: process.env['BAKING_TABLE_NAME'],
    ITEM_STATES_ARN: process.env['ITEM_STATES_ARN'],
    NEW_ITEMS_QUEUE_URL: process.env['NEW_ITEMS_QUEUE_URL'],
    WAITING_ITEMS_QUEUE_URL: process.env['WAITING_ITEMS_QUEUE_URL']
  }
}

module.exports = {
  fetchConf
}
