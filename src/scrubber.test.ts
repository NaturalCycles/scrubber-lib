import { deepFreeze } from '@naturalcycles/test-lib'
import { nanoid } from 'nanoid'
import { Scrubber } from './scrubber'
import { ScrubberConfig, ScrubberFn, ScrubbersImpl } from './scrubber.model'
import { saltedHashEmailScrubber, saltedHashScrubber } from './scrubbers'
import {
  configEmailScrubberMock,
  configInvalidScrubberMock,
  configMultiFieldMock,
  configParentScrubbersMock,
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
  expect(result[0]!['users'][0]).toEqual({ pw: 'notsecret', safe: 'shouldStay' })
  expect(result[0]!['users'][1]).toEqual({ name: 'Jane Doe', safe2: 'isSafe' })
  expect(Array.isArray(result[0]!['users'])).toBeTruthy() // makes sure we don't convert array to objects
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

describe('falsy values handling', () => {
  const cfg: ScrubberConfig = {
    fields: {
      target: {
        scrubber: 'undefinedScrubber',
      },
    },
  }

  test.each([-1, true, false, undefined, '', 0, null, NaN])(
    'does not preserve "%s" if configuration is false',
    input => {
      const cfgWithPreserveDisabled: ScrubberConfig = { ...cfg, preserveFalsy: false }

      const scrubber = new Scrubber(cfgWithPreserveDisabled)
      const result = scrubber.scrub({ target: input })

      expect(result.target).toBeUndefined()
    },
  )

  test.each([false, undefined, '', 0, null, NaN])(
    'preserves "%s" if configuration is true',
    input => {
      const cfgWithPreserveEnabled: ScrubberConfig = { ...cfg, preserveFalsy: true }

      const scrubber = new Scrubber(cfgWithPreserveEnabled)
      const result = scrubber.scrub({ target: input })

      expect(result.target).toEqual(input)
    },
  )
})

describe('error handling', () => {
  const faultyScrubber: ScrubberFn = () => {
    throw new Error('ops')
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
      undefined, // eslint-disable-line id-blacklist
      array: [1, 2, { pw: 'secret' }],
      function: () => 1,
      symbol: Symbol(42),
      map: new Map([['b', 'c']]),
      set: new Set([1, 2, 3, 4]),
      buffer: Buffer.from('data'),
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

test('Ensure initializationVector is random and affects saltedHashScrubber', () => {
  const mockScrubber = jest.fn(saltedHashScrubber) as any
  const additionalScrubbers: ScrubbersImpl = { aNewScrubber: mockScrubber }

  const cfg: ScrubberConfig = {
    fields: {
      id: {
        scrubber: 'aNewScrubber',
      },
    },
  }

  const toBeSalted = 'id1'
  const data = [{ id: toBeSalted }]
  const scrubber1 = new Scrubber(cfg, additionalScrubbers)
  scrubber1.scrub(data)
  expect(mockScrubber).toHaveBeenCalledWith(toBeSalted, {
    initializationVector: expect.any(String),
  })
  const vector1 = mockScrubber.mock.calls[0][1]
  const result1 = mockScrubber.mock.results[0].value

  const scrubber2 = new Scrubber(cfg, additionalScrubbers) // New vector to be generated by constructor
  scrubber2.scrub(data)
  const vector2 = mockScrubber.mock.calls[1][1]
  const result2 = mockScrubber.mock.results[1].value

  expect(vector1).not.toEqual(vector2)
  expect(result1).not.toEqual(toBeSalted)
  expect(result1).not.toEqual(result2)
})

test('initializationVector passed to scrubber constructor is passed to scrubbers', () => {
  const mockScrubber = jest.fn(saltedHashScrubber) as any
  const additionalScrubbers: ScrubbersImpl = { aNewScrubber: mockScrubber }

  const cfg: ScrubberConfig = {
    fields: {
      id: {
        scrubber: 'aNewScrubber',
      },
    },
  }

  const toBeSalted = 'id1'
  const data = [{ id: toBeSalted }]
  const initializationVector = nanoid()
  const scrubber1 = new Scrubber(cfg, additionalScrubbers, initializationVector)
  scrubber1.scrub(data)
  expect(mockScrubber).toHaveBeenCalledWith(toBeSalted, {
    initializationVector: expect.stringMatching(initializationVector),
  })
  const vector1 = mockScrubber.mock.calls[0][1]
  const result1 = mockScrubber.mock.results[0].value

  const scrubber2 = new Scrubber(cfg, additionalScrubbers, initializationVector)
  scrubber2.scrub(data)
  const vector2 = mockScrubber.mock.calls[1][1]
  const result2 = mockScrubber.mock.results[1].value

  expect(vector1).toEqual(vector2)
  expect(result1).not.toEqual(toBeSalted)
  expect(result1).toEqual(result2)
})

test('supplying an initializationVector in config should take precedence', () => {
  const configVector = '123'
  const mockScrubber = jest.fn(saltedHashScrubber) as any
  const additionalScrubbers: ScrubbersImpl = { aNewScrubber: mockScrubber }

  const cfg: ScrubberConfig = {
    fields: {
      id: {
        scrubber: 'aNewScrubber',
        params: {
          initializationVector: configVector,
        },
      },
    },
  }

  const toBeSalted = 'id1'
  const data = [{ id: toBeSalted }]
  const initializationVector = nanoid()
  const scrubber1 = new Scrubber(cfg, additionalScrubbers, initializationVector)
  const result = scrubber1.scrub(data)

  // Result should stay the same since 123 is used as init vector
  expect(result.pop()).toMatchSnapshot()
})

test('supplying an initializationVector in config of saltedHashEmailScrubber should produce consistent results', () => {
  const configVector = '123'
  const domain = '@example.com.br'
  const mockScrubber = jest.fn(saltedHashEmailScrubber) as any
  const additionalScrubbers: ScrubbersImpl = { aNewScrubber: mockScrubber }

  const cfg: ScrubberConfig = {
    fields: {
      email: {
        scrubber: 'aNewScrubber',
        params: {
          initializationVector: configVector,
          domain,
        },
      },
    },
  }

  const toBeSalted = 'test@email.se'
  const data = [{ email: toBeSalted }]
  const scrubber1 = new Scrubber(cfg, additionalScrubbers)
  const result = scrubber1.scrub(data).pop() as any

  // Result should stay the same since config vector is static
  expect(result).toMatchSnapshot()
  expect(result).not.toEqual(data)
  const emailRes = result['email']
  expect(emailRes).toContain(domain)
  expect(emailRes).not.toContain(toBeSalted)
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

test('Support scrubbing based on parent', () => {
  const data = { api: { key: 'notsosecret' }, encryption: { key: '123456' } }
  const scrubber = new Scrubber(configParentScrubbersMock())
  const result = scrubber.scrub(data)

  expect(result).toEqual({ api: { key: 'notsosecret' }, encryption: { key: 'replaced' } })
})

test('Support scrubbing based on multi-level parent', () => {
  const data = { multi: { api: { secret: 'notsosecret' }, interim: { secret: '123456' } } }
  const scrubber = new Scrubber(configParentScrubbersMock())
  const result = scrubber.scrub(data)

  expect(result).toEqual({
    multi: { api: { secret: 'notsosecret' }, interim: { secret: 'replaced' } },
  })
})
