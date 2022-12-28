import { nanoid } from 'nanoid'
import {
  bcryptStringScrubber,
  BcryptStringScrubberParams,
  charsFromRightScrubber,
  isoDateStringScrubber,
  preserveOriginalScrubber,
  randomEmailInContentScrubber,
  randomEmailScrubber,
  randomScrubber,
  saltedHashEmailScrubber,
  saltedHashScrubber,
  staticScrubber,
  undefinedScrubber,
  unixTimestampScrubber,
} from './scrubbers'

const bryptStr1 = '$2a$12$HYNzBb8XYOZZeRwZDiVux.orKNqkSVAoXBDc9Gw7nSxr8rcZupbRK'
const bryptStr2 = '$2a$10$HYNzBb8XYOZZeRwZDiVux.orKNqkSVAoXBDc9Gw7nSxr8rcZupbRK'

describe('undefinedScrubber', () => {
  test('replaces any value with undefined', () => {
    expect(undefinedScrubber(true)).toBeUndefined()
    expect(undefinedScrubber(1)).toBeUndefined()
    expect(undefinedScrubber('foo')).toBeUndefined()
  })
})

describe('preserveOriginalScrubber', () => {
  test('preserves the original value', () => {
    expect(preserveOriginalScrubber(true)).toBe(true)
    expect(preserveOriginalScrubber(1)).toBe(1)
    expect(preserveOriginalScrubber('foo')).toBe('foo')
    expect(preserveOriginalScrubber(null)).toBeNull()
  })
})

describe('staticScrubber', () => {
  test.each([
    [undefined, 'replacement'],
    ['', 'replacement'],
  ])('handles undefined values "%s" > "%s"', (input, replacement) => {
    const result = staticScrubber('', { replacement: 'replacement' })
    expect(result).toEqual(replacement)
  })

  test('replaces any string with replacement', () => {
    const o = 'bar'

    expect(staticScrubber('', { replacement: o })).toEqual(o)
    expect(staticScrubber('foo', { replacement: o })).toEqual(o)
  })

  test('replace number', () => {
    const secretNum = 666
    const r = 123

    expect(staticScrubber(secretNum, { replacement: r })).toEqual(r)
  })
})

describe('unixTimestampScrubber', () => {
  test.each([
    [undefined, undefined],
    ['', undefined],
  ])('handles undefined values "%s" > "%s"', (date, expected) => {
    const result = unixTimestampScrubber(date, { excludeDay: true })
    expect(result).toEqual(expected)
  })

  test('scrubs only time (string)', () => {
    // Wednesday, July 3, 2019 9:35:21 AM to
    // Wednesday, July 3, 2019 00:00:00 AM
    const result = unixTimestampScrubber('1562146521', { excludeTime: true })
    expect(result).toBe(1562112000)
  })

  test('scrubs only time', () => {
    // Wednesday, July 3, 2019 9:35:21 AM to
    // Wednesday, July 3, 2019 00:00:00 AM
    const result = unixTimestampScrubber(1562146521, { excludeTime: true })
    expect(result).toBe(1562112000)
  })

  test('scrubs only day', () => {
    // Wednesday, July 3, 2019 9:35:21 AM to
    // Wednesday, July 1, 2019 9:35:21 AM
    const result = unixTimestampScrubber(1562146521, { excludeDay: true })
    expect(result).toBe(1561973721)
  })

  test('scrubs day and month', () => {
    // Wednesday, July 3, 2019 9:35:21 AM to
    // Wednesday, January 1, 2019 9:35:21 AM
    const result = unixTimestampScrubber(1562146521, { excludeDay: true, excludeMonth: true })
    expect(result).toBe(1546335321)
  })

  test('scrubs only year', () => {
    // Wednesday, July 3, 2019 9:35:21 AM to
    // Wednesday, July 3, 1970 9:35:21 AM
    const result = unixTimestampScrubber(1562146521, { excludeYear: true })
    expect(result).toBe(15845721)
  })
})

describe('isoDateStringScrubber', () => {
  test.each([
    [undefined, undefined],
    ['', undefined],
  ])('handles undefined values "%s" > "%s"', (date, expected) => {
    const result = isoDateStringScrubber(date, { excludeDay: true })
    expect(result).toEqual(expected)
  })

  test('scrubs only day', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeDay: true })
    expect(result).toBe('2019-05-01')
  })

  test('scrubs only month', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeMonth: true })
    expect(result).toBe('2019-01-12')
  })

  test('scrubs both day and month', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeDay: true, excludeMonth: true })
    expect(result).toBe('2019-01-01')
  })

  test('scrubs only year', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeYear: true })
    expect(result).toBe('1970-05-12')
  })

  test('scrubs both day and year', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeDay: true, excludeYear: true })
    expect(result).toBe('1970-05-01')
  })
})

describe('charsFromRightScrubber', () => {
  test.each([
    [undefined, undefined],
    ['', undefined],
    ['11225', '112XX'],
    ['ABC DEF', 'ABC DXX'],
    ['ABC', 'AXX'],
    ['AB', 'XX'],
    ['A', 'X'],
  ])('anonymizes zip codes "%s" > "%s"', (zip, expected) => {
    const result = charsFromRightScrubber(zip, { count: 2, replacement: 'X' })
    expect(result).toEqual(expected)
  })

  test('removes 2 chars', () => {
    const result = charsFromRightScrubber('76543', { count: 2, replacement: 'X' })
    expect(result).toBe('765XX')
  })

  test('does not fail/crash if count > input length', () => {
    const result = charsFromRightScrubber('123', { count: 5, replacement: 'X' })
    expect(result).toBe('XXX')
  })
})

test('charsFromRightScrubber - Full replacement', () => {
  const result = charsFromRightScrubber('blabla_123', {
    count: 3,
    replacement: '456',
    replaceFull: true,
  })
  expect(result).toBe('blabla_456')
})

describe('randomScrubber', () => {
  test('generates with default arguments', () => {
    const result = randomScrubber('secret')
    expect(result).not.toBe('secret')
  })

  test('accepts length', () => {
    const result = randomScrubber('secret', { length: 5 })
    expect(result).toHaveLength(5)
  })

  test('accepts alphabet and length', () => {
    const result = randomScrubber('secret', { alphabet: 'a', length: 5 })
    expect(result).toBe('aaaaa')
  })
})

describe('randomEmailScrubber', () => {
  test('generates with default arguments', () => {
    const result = randomEmailScrubber('secret')
    expect(result).not.toBe('secret')
    expect(result).toContain('@example.com')
  })

  test('accepts alphabet, length and domain', () => {
    const result = randomEmailScrubber('secret', {
      alphabet: 'a',
      length: 5,
      domain: '@customdomain.com',
    })
    expect(result).toBe('aaaaa@customdomain.com')
  })
})

describe('randomEmailInContentScrubber', () => {
  test('scrub content without email', () => {
    const content = 'I am a string without and email in it @hello!'
    const result = randomEmailInContentScrubber(content)
    expect(result).toEqual(content)
  })

  test('scrub email in URL', () => {
    const email = 'real@gmail.com'
    const prefix = '/api/user/'
    const result = randomEmailInContentScrubber(prefix + email)
    expect(result).not.toContain(email)
    expect(result).toContain(prefix)
  })

  test('scrub complex email in text', () => {
    const email = 'real_email-address.2@gmail2.com.br'
    const suffix = ', not a gmail2.com.br address'
    const text = 'This should be a random email: ' + email + suffix
    const result = randomEmailInContentScrubber(text)

    expect(result).not.toContain(email)
    expect(result).not.toContain('real')
    expect(result).not.toContain('example.com.br') // test multi.dot domains
    expect(result).toContain(suffix)
  })
})

describe('saltedHashScrubber', () => {
  test('generates hash using initializationVector', () => {
    const initializationVector = nanoid()

    const result = saltedHashScrubber('secret', { initializationVector })
    expect(result).not.toBe('secret')

    const result2 = saltedHashScrubber('secret', { initializationVector })
    expect(result).toEqual(result2)

    const initializationVector2 = nanoid()
    const result3 = saltedHashScrubber('secret', { initializationVector: initializationVector2 })
    expect(result).not.toEqual(result3)
  })
})

describe('saltedHashEmailScrubber', () => {
  test('generates hash using initializationVector and suffixes domain', () => {
    const initializationVector = 'staticvector'

    const result = saltedHashEmailScrubber('secret', {
      initializationVector,
      domain: '@naturalcycles.com',
    })
    console.log(result)
    expect(result).not.toBe('secret')
    expect(result).toMatchSnapshot()
  })
})

describe('bcryptStringScrubber', () => {
  test('generates valid bcrypt string while maintaining algo and cost factor', () => {
    const result = bcryptStringScrubber(bryptStr1)
    expect(result).not.toEqual(bryptStr1)
    expect(result!.substr(0, 7)).toBe('$2a$12$')
    expect(result!.length).toEqual(bryptStr1.length)
  })

  test('ensure older cost factor is preserved', () => {
    const result = bcryptStringScrubber(bryptStr2)
    expect(result).not.toEqual(bryptStr2)
    expect(result!.substr(0, 7)).toBe('$2a$10$')
  })
  test('handling undefined and empty', () => {
    const undefinedResult = bcryptStringScrubber(undefined)
    expect(undefinedResult).toBeUndefined()

    const emptyResult = bcryptStringScrubber('')
    expect(emptyResult).toBe('')
  })
  test('handling non-valid bcrypt strings, should return valid bcrypt string', () => {
    const result = bcryptStringScrubber('stringWithToFew$')
    expect(result!.substr(0, 7)).toBe('$2a$12$')
    expect(result!.length).toEqual(bryptStr1.length)
  })
  test('handling replacements map', () => {
    const params: BcryptStringScrubberParams = {
      replacements: '$2a$10$:$2a$10$456,$2a$12$:$2a$12$123',
    }
    const result = bcryptStringScrubber(bryptStr1, params)
    expect(result).toBe('$2a$12$123')

    const result2 = bcryptStringScrubber(bryptStr2, params)
    expect(result2).toBe('$2a$10$456')
  })
})
