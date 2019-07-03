import {
  charsFromRightScrubber,
  isoDateStringScrubber,
  randomEmailScrubber,
  randomScrubber,
  saltedHashScrubber,
  staticScrubber,
  undefinedScrubber,
} from './scrubbers'

type Nanoid = () => string
const nanoid = require('nanoid') as Nanoid

describe('undefinedScrubber', () => {
  test('replaces any value with undefined', () => {
    expect(undefinedScrubber(true)).toBeUndefined()
    expect(undefinedScrubber(1)).toBeUndefined()
    expect(undefinedScrubber('foo')).toBeUndefined()
  })
})

describe('staticScrubber', () => {
  test.each([[undefined, 'replacement'], ['', 'replacement']])(
    'handles undefined values "%s" > "%s"',
    (input, replacement) => {
      const result = staticScrubber('', { replacement: 'replacement' })
      expect(result).toEqual(replacement)
    },
  )

  test('replaces any string with replacement', () => {
    const o = 'bar'

    expect(staticScrubber('', { replacement: o })).toEqual(o)
    expect(staticScrubber('foo', { replacement: o })).toEqual(o)
  })
})

describe('isoDateStringScrubber', () => {
  test.each([[undefined, undefined], ['', undefined]])(
    'handles undefined values "%s" > "%s"',
    (date, expected) => {
      const result = isoDateStringScrubber(date, { excludeDay: true })
      expect(result).toEqual(expected)
    },
  )

  test('scrubs only day', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeDay: true })
    expect(result).toEqual('2019-05-01')
  })

  test('scrubs only month', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeMonth: true })
    expect(result).toEqual('2019-01-12')
  })

  test('scrubs both day and month', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeDay: true, excludeMonth: true })
    expect(result).toEqual('2019-01-01')
  })

  test('scrubs only year', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeYear: true })
    expect(result).toEqual('1970-05-12')
  })

  test('scrubs both day and year', () => {
    const result = isoDateStringScrubber('2019-05-12', { excludeDay: true, excludeYear: true })
    expect(result).toEqual('1970-05-01')
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
    expect(result).toEqual('765XX')
  })

  test('does not fail/crash if count > input length', () => {
    const result = charsFromRightScrubber('123', { count: 5, replacement: 'X' })
    expect(result).toEqual('XXX')
  })
})

describe('randomScrubber', () => {
  test('generates with default arguments', () => {
    const result = randomScrubber('secret')
    expect(result).not.toEqual('secret')
  })

  test('accepts length', () => {
    const result = randomScrubber('secret', { length: 5 })
    expect(result).toHaveLength(5)
  })

  test('accepts alphabet and length', () => {
    const result = randomScrubber('secret', { alphabet: 'a', length: 5 })
    expect(result).toEqual('aaaaa')
  })
})

describe('randomEmailScrubber', () => {
  test('generates with default arguments', () => {
    const result = randomEmailScrubber('secret')
    expect(result).not.toEqual('secret')
    expect(result).toContain('@example.com')
  })

  test('accepts alphabet, length and domain', () => {
    const result = randomEmailScrubber('secret', {
      alphabet: 'a',
      length: 5,
      domain: '@customdomain.com',
    })
    expect(result).toEqual('aaaaa@customdomain.com')
  })
})

describe('saltedHashScrubber', () => {
  test('generates hash using initializationVector', () => {
    const initializationVector = nanoid()
    const result = saltedHashScrubber('secret', { initializationVector })
    expect(result).not.toEqual('secret')
    const result2 = saltedHashScrubber('secret', { initializationVector })
    expect(result).toEqual(result2)
    const initializationVector2 = nanoid()
    const result3 = saltedHashScrubber('secret', { initializationVector: initializationVector2 })
    expect(result).not.toEqual(result3)
  })
})
