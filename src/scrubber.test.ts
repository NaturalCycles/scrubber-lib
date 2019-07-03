import { deepFreeze } from '@naturalcycles/test-lib'
import { Scrubber } from './scrubber'
import { ScrubberConfig, ScrubberFn, ScrubbersImpl } from './scrubber.model'
import {
  configEmailScrubberMock,
  configInvalidScrubberMock,
  configMultiFieldMock,
  configStaticScrubbersMock,
} from './test/scrubber.mock'

// Convenient method for initializing object and scrubbing
const scrub = <T>(
  data: T,
  cfg: ScrubberConfig = configStaticScrubbersMock(),
  additionalScrubbersImpl?: ScrubbersImpl,
): T => {
  const scrubber = new Scrubber(cfg, additionalScrubbersImpl)
  return scrubber.scrub(data)
}

test('returns a single object when input is a single object', () => {
  const data = { pw: 'secret', name: 'Real Name' }
  const scrubber = new Scrubber(configStaticScrubbersMock())
  const result = scrubber.scrub(data)

  expect(result).toEqual({ pw: 'notsecret', name: 'Jane Doe' })
})

test('returns an array with one object when input is an array with one object', () => {
  const data = { pw: 'secret', name: 'Real Name' }
  const scrubber = new Scrubber(configStaticScrubbersMock())
  const result = scrubber.scrub([data])

  expect(result).toEqual([{ pw: 'notsecret', name: 'Jane Doe' }])
})

test('applies to more than a field', () => {
  const data = [{ pw: 'secret', name: 'Real Name' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, configStaticScrubbersMock())
  expect(result).toEqual([{ pw: 'notsecret', name: 'Jane Doe' }])
})

test('applies to nested fields (deep transverse, 2 levels)', () => {
  const data = [{ account: { pw: 'secret', name: 'Real Name' } }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, configStaticScrubbersMock())
  expect(result).toEqual([{ account: { pw: 'notsecret', name: 'Jane Doe' } }])
})

test('applies to nested fields (deep transverse, 3 levels)', () => {
  const data = [{ object: { account: { pw: 'secret', name: 'Real Name' } } }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, configStaticScrubbersMock())
  expect(result).toEqual([{ object: { account: { pw: 'notsecret', name: 'Jane Doe' } } }])
})

test('applies to nested arrays', () => {
  const obj1 = { pw: 'shouldChange', safe: 'shouldStay' }
  const obj2 = { name: 'personalInformation', safe2: 'isSafe' }
  const users = [{ users: [obj1, obj2] }]
  deepFreeze(users)

  const result = scrub(users, configStaticScrubbersMock())
  expect(result[0]['users'][0]).toEqual({ pw: 'notsecret', safe: 'shouldStay' })
  expect(result[0]['users'][1]).toEqual({ name: 'Jane Doe', safe2: 'isSafe' })
  expect(Array.isArray(result[0]['users'])).toBeTruthy() // makes sure we don't convert array to objects
})

test('keeps not modified fields', () => {
  const data = [{ safeField: 'keep', email: 'real@email.com' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, configEmailScrubberMock())
  expect(result).toEqual([{ safeField: 'keep', email: 'anonymized@email.com' }])
})

test('supports additional scrubbers', () => {
  const mockScrubber: ScrubberFn = () => 'modified'
  const additionalScrubbers: ScrubbersImpl = { aNewScrubber: mockScrubber }

  const cfg: ScrubberConfig = {
    fields: {
      target: {
        scrubber: 'aNewScrubber',
      },
    },
  }

  const data = [{ target: 'original' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, cfg, additionalScrubbers)
  expect(result).toEqual([{ target: 'modified' }])
})

test('supports comma-separated fields in field name', () => {
  const data = [{ field1: 'orig1', field2: 'orig2' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, configMultiFieldMock())
  expect(result).toEqual([{ field1: 'modified', field2: 'modified' }])
})

test('returns empty array for empty arrays', () => {
  const result = scrub([], configStaticScrubbersMock())
  expect(result).toEqual([])
})

test('fails when scrubber from config is not found (even if not used)', () => {
  expect(() => {
    scrub([], configInvalidScrubberMock())
  }).toThrow()
})

describe('error handling', () => {
  const faultyScrubber: ScrubberFn = () => {
    throw Error('ops')
  }

  const cfg: ScrubberConfig = {
    fields: {
      target: {
        scrubber: 'faultyScrubber',
      },
    },
  }

  const object = { target: 'foo' }

  test('logs errors by default', () => {
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()

    const scrubber = new Scrubber(cfg, { faultyScrubber })
    scrubber.scrub(object)

    expect(console.log).toMatchSnapshot()
    expect(console.error).toMatchSnapshot()
  })

  test('re-throw error if enabled on config', () => {
    const cfgWithErrorsEnabled: ScrubberConfig = { ...cfg, throwOnError: true }

    const scrubber = new Scrubber(cfgWithErrorsEnabled, { faultyScrubber })

    expect(() => {
      scrubber.scrub(object)
    }).toThrow()
  })
})

test('scrubs different types of data', () => {
  const result = scrub([
    {
      null: null,
      undefined,
      array: [1, 2, { pw: 'secret' }],
      function: () => 1,
      symbol: Symbol(42),
      map: new Map([['b', 'c']]),
      set: new Set([1, 2, 3, 4]),
      date: new Date(0),
    },
  ])

  expect(result).toMatchSnapshot()
})

test('initializationVector is passed as param to scrubbers', () => {
  const mockScrubber = jest.fn(() => 'modified') as any
  const additionalScrubbers: ScrubbersImpl = { aNewScrubber: mockScrubber }

  const cfg: ScrubberConfig = {
    fields: {
      pw: {
        scrubber: 'aNewScrubber',
      },
    },
  }

  const data = [{ pw: 'secret' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const scrubber = new Scrubber(cfg, additionalScrubbers)
  scrubber.scrub(data)

  expect(mockScrubber).toHaveBeenLastCalledWith('secret', {
    initializationVector: expect.any(String),
  })
  scrubber.scrub(data)

  const vector1 = mockScrubber.mock.calls[0][1]
  const vector2 = mockScrubber.mock.calls[1][1]

  expect(vector1).toEqual(vector2)
})

test('example (readme)', () => {
  const cfg: ScrubberConfig = {
    fields: {
      name: {
        scrubber: 'staticScrubber',
        params: {
          replacement: 'John Doe',
        },
      },
      password: {
        scrubber: 'undefinedScrubber',
      },
    },
    throwOnError: true,
  }

  const object = { name: 'Real Name', password: 'secret' }

  const scrubber = new Scrubber(cfg)
  const newObject = scrubber.scrub(object)

  console.log(newObject)
})
