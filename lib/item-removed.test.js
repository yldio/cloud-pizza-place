const {
  fetchConf
} = require('./services/conf')
const {
  pushTriggerMessage
} = require('./services/new-items-queue')
const {
  pushBakedItem
} = require('./services/baked-items-queue')
const { handler } = require('./item-removed')

jest.mock('./services/conf')
jest.mock('./services/new-items-queue')
jest.mock('./services/baked-items-queue')

const mockConf = {
  ETC: ''
}

beforeEach(() => {
  fetchConf.mockResolvedValue(mockConf)
})

afterEach(() => {
  jest.clearAllMocks()
})

test('should not do anything when no items have been removed', async () => {
  await handler({
    Records: [
      { eventName: 'ETC' },
      { eventName: 'ETC' }
    ]
  })

  expect(pushTriggerMessage).toBeCalledTimes(0)
  expect(pushBakedItem).toBeCalledTimes(0)
})

test('should send trigger and push baked item when it is removed from oven', async () => {
  await handler({
    Records: [
      { eventName: 'ETC' },
      {
        'dynamodb': {
          'OldImage': {
            'bakingTimeSecs': {
              'N': '540'
            },
            'insertedAt': {
              'S': '2018-07-18T20:07:37.558Z'
            },
            'id': {
              'S': '101'
            }
          }
        },
        'eventName': 'REMOVE'
      },
      {
        'dynamodb': {
          'OldImage': {
            'bakingTimeSecs': {
              'N': '540'
            },
            'insertedAt': {
              'S': '2018-07-18T20:07:37.558Z'
            },
            'id': {
              'S': '102'
            }
          }
        },
        'eventName': 'REMOVE'
      }
    ]
  })

  const expectedItems = [
    {
      id: '101',
      insertedAt: '2018-07-18T20:07:37.558Z',
      bakingTimeSecs: 540
    },
    {
      id: '102',
      insertedAt: '2018-07-18T20:07:37.558Z',
      bakingTimeSecs: 540
    }
  ]

  expect(pushTriggerMessage).toBeCalledWith(mockConf)
  expect(pushTriggerMessage).toBeCalledTimes(1)
  expect(pushBakedItem).nthCalledWith(1, mockConf, JSON.stringify(expectedItems[0]))
  expect(pushBakedItem).nthCalledWith(2, mockConf, JSON.stringify(expectedItems[1]))
})
