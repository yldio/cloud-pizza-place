const {
  fetchConf
} = require('./services/conf')
const {
  countItems,
  insertItem
} = require('./services/baking-table')
const {
  pullItemMessages,
  pushWaitingItem,
  deleteMessage
} = require('./services/waiting-items-queue')
const { handler } = require('./bake-items')

jest.mock('./services/baking-table')
jest.mock('./services/waiting-items-queue')

jest.mock('./services/conf')
jest.mock('./services/baking-table')
jest.mock('./services/waiting-items-queue')

const mockConf = {
  BAKING_TABLE_CAPACITY_COUNT: 2
}

beforeEach(() => {
  fetchConf.mockResolvedValue(mockConf)
  pullItemMessages.mockResolvedValue([])
})

afterEach(() => {
  jest.clearAllMocks()
})

test('when baking table is full, should push to waiting items', async () => {
  countItems.mockResolvedValue(2)

  const newItem = {
    id: 111
  }

  await handler({
    Records: [{
      body: JSON.stringify(newItem)
    }]
  })

  expect(pullItemMessages).toBeCalledWith(mockConf, 0)
  expect(pushWaitingItem).toBeCalledWith(mockConf, newItem)
})

test('should bake waiting items', async () => {
  const waitingItem = {
    id: 1
  }
  const waitingItemMessage = {
    Body: JSON.stringify(waitingItem)
  }
  const newItem = {
    type: 'trigger'
  }

  countItems.mockResolvedValue(0)
  pullItemMessages.mockResolvedValue([
    waitingItemMessage
  ])

  await handler({
    Records: [{
      body: JSON.stringify(newItem)
    }]
  })

  expect(pullItemMessages).toBeCalledWith(mockConf, 2)
  expect(insertItem).toBeCalledTimes(1)
  expect(insertItem).toBeCalledWith(mockConf, waitingItem)
  expect(deleteMessage).toBeCalledTimes(1)
  expect(deleteMessage).toBeCalledWith(mockConf, waitingItemMessage)
  expect(pushWaitingItem).not.toHaveBeenCalled()
})

test('should bake new items after waiting items, ignoring trigger messages', async () => {
  const waitingItem = {
    id: 1
  }
  const waitingItemMessage = {
    Body: JSON.stringify(waitingItem)
  }
  const newItem = {
    id: 2
  }

  countItems.mockResolvedValue(0)
  pullItemMessages.mockResolvedValue([
    waitingItemMessage
  ])

  await handler({
    Records: [
      { body: JSON.stringify({ type: 'trigger' }) },
      { body: JSON.stringify(newItem) }
    ]
  })

  expect(pullItemMessages).toBeCalledWith(mockConf, 2)
  expect(insertItem).toBeCalledTimes(2)
  expect(insertItem).nthCalledWith(1, mockConf, waitingItem)
  expect(insertItem).nthCalledWith(2, mockConf, newItem)
  expect(pushWaitingItem).not.toHaveBeenCalled()
})
