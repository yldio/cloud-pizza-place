const {
  STOCK_TABLE_NAME,
  STOCK_UPDATED_STREAM_NAME
} = process.env

const fetchConf = async () => {
  return {
    STOCK_TABLE_NAME: STOCK_TABLE_NAME || 'sss-StockTable',
    STOCK_UPDATED_STREAM_NAME: STOCK_UPDATED_STREAM_NAME || 'sss-StockUpdatedStream'
  }
}

module.exports = {
  fetchConf
}
