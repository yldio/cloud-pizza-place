const fetchConf = async () => {
  return {
    BAKED_ITEMS_QUEUE_URL: process.env['BAKED_ITEMS_QUEUE_URL'],
    BAKING_TABLE_CAPACITY_COUNT: parseInt(process.env['BAKING_TABLE_CAPACITY_COUNT'], 10),
    BAKING_TABLE_NAME: process.env['BAKING_TABLE_NAME'],
    NEW_ITEMS_QUEUE_URL: process.env['NEW_ITEMS_QUEUE_URL'],
    WAITING_ITEMS_QUEUE_URL: process.env['WAITING_ITEMS_QUEUE_URL']
  }
}

module.exports = {
  fetchConf
}
