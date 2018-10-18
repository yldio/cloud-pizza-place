const { S3 } = require('aws-sdk')

const s3 = new S3()

const getStock = async (conf, {
  batchId,
  bucketName,
  key
}) => {
  const data = await s3.getObject({
    Bucket: bucketName,
    Key: key
  }).promise()
  return data.Body.toString('utf-8')
    .split('\n')
    .map(row => {
      const cols = row.split(',')
      if (cols.length !== 3) {
        // Invalid row length
        return
      }
      return {
        batchId,
        typeId: cols[0],
        quantity: parseInt(cols[1], 10),
        expiresAt: new Date(cols[2])
      }
    })
    .filter(x => x)
}

module.exports = {
  getStock
}
