const {
  STOCK_TABLE_NAME
} = process.env

const fetchConf = async () => {
  return {
    STOCK_TABLE_NAME: STOCK_TABLE_NAME || 'sss-StockTable'
  }
}

module.exports = {
  fetchConf
}
