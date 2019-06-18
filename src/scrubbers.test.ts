import {
  charsFromRightScrubber,
  isoDateStringScrubber,
  staticScrubber,
  undefinedScrubber,
} from './scrubbers'

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
