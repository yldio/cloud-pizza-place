const { fetchConf } = require('./services/conf')
const { allocateCapacity } = require('./services/baking-table')
const { startBaking } = require('./services/item-states')
const {
  deleteMessage,
  pullItemMessage,
  pushWaitingItem,
  resetMessageVisibility
} = require('./services/waiting-items-queue')
const { handler } = require('./bake-items')

jest.mock('./services/baking-table')
jest.mock('./services/conf')
jest.mock('./services/waiting-items-queue')
jest.mock('./services/item-states')

const mockConf = {
  BAKING_TABLE_CAPACITY: 2
}

beforeEach(() => {
  fetchConf.mockResolvedValue(mockConf)
  pullItemMessage.mockResolvedValue([])
})

afterEach(() => {
  jest.clearAllMocks()
})

test('should bake new items after waiting items, ignoring trigger messages', async () => {
  allocateCapacity.mockResolvedValue(true)

  const waitingItem = {
    id: 1
  }
  const waitingItemMessage = {
    Body: JSON.stringify(waitingItem)
  }
  const newItem = {
    id: 2
  }

  pullItemMessage.mockResolvedValueOnce(waitingItemMessage)
  pullItemMessage.mockResolvedValue()

  await handler({
    Records: [
      { body: JSON.stringify({ type: 'trigger' }) },
      { body: JSON.stringify(newItem) }
    ]
  })

  expect(pullItemMessage).toBeCalledTimes(4)
  expect(startBaking).toBeCalledTimes(2)
  expect(startBaking).nthCalledWith(1, mockConf, waitingItem)
  expect(startBaking).nthCalledWith(2, mockConf, newItem)
  expect(deleteMessage).toBeCalledTimes(1)
  expect(deleteMessage).nthCalledWith(1, mockConf, waitingItemMessage)
})

test('should push items to waiting queue after reaching capacity', async () => {
  allocateCapacity.mockResolvedValueOnce(true)
  allocateCapacity.mockResolvedValueOnce(false)

  const waitingItem = {
    id: 1
  }
  const waitingItemMessage = {
    Body: JSON.stringify(waitingItem)
  }
  const anotherWaitingItem = {
    id: 2
  }
  const anotherWaitingItemMessage = {
    Body: JSON.stringify(anotherWaitingItem)
  }
  const newItem = {
    id: 3
  }
  const anotherNewItem = {
    id: 4
  }

  pullItemMessage.mockResolvedValueOnce(waitingItemMessage)
  pullItemMessage.mockResolvedValueOnce(anotherWaitingItemMessage)
  pullItemMessage.mockResolvedValue()

  await handler({
    Records: [
      { body: JSON.stringify(newItem) },
      { body: JSON.stringify(anotherNewItem) }
    ]
  })

  expect(allocateCapacity).toBeCalledTimes(2)
  expect(pullItemMessage).toBeCalledTimes(2)
  expect(startBaking).toBeCalledTimes(1)
  expect(startBaking).nthCalledWith(1, mockConf, waitingItem)
  expect(deleteMessage).toBeCalledTimes(1)
  expect(deleteMessage).nthCalledWith(1, mockConf, waitingItemMessage)
  expect(resetMessageVisibility).toBeCalledTimes(1)
  expect(resetMessageVisibility).nthCalledWith(1, mockConf, anotherWaitingItemMessage)
  expect(pushWaitingItem).toBeCalledTimes(2)
})
