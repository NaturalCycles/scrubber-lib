import { deepFreeze } from '@naturalcycles/js-lib'
import { Scrubber } from './scrubber'
import { ScrubberConfig, ScrubberFn, ScrubbersImpl } from './scrubber.model'
import { ANONYMIZED_EMAIL } from './scrubbers'
import {
  configEmailScrubberMock,
  configInvalidScrubberMock,
  configStaticScrubbersMock,
} from './test/scrubber.mock'

// Convenient method for initializing object and scrubbing
const scrub = <T extends any[]>(
  data: T,
  cfg: ScrubberConfig,
  additionalScrubbersImpl?: ScrubbersImpl,
): T => {
  const scrubber = new Scrubber(cfg, additionalScrubbersImpl)
  return scrubber.scrub(data)
}

const scrubSingle = <T extends any>(
  data: T,
  cfg: ScrubberConfig,
  additionalScrubbersImpl?: ScrubbersImpl,
): T => {
  const scrubber = new Scrubber(cfg, additionalScrubbersImpl)
  return scrubber.scrubSingle(data)
}

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

test('keeps not modified fields', () => {
  const data = [{ safeField: 'keep', email: 'real@email.com' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, configEmailScrubberMock())
  expect(result).toEqual([{ safeField: 'keep', email: ANONYMIZED_EMAIL }])
})

test('supports additional scrubbers', () => {
  const mockScrubber: ScrubberFn = () => 'modified'
  const additionalScrubbers: ScrubbersImpl = { aNewScrubber: mockScrubber }

  const cfg: ScrubberConfig = {
    target: {
      scrubber: 'aNewScrubber',
    },
  }

  const data = [{ target: 'original' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result = scrub(data, cfg, additionalScrubbers)
  expect(result).toEqual([{ target: 'modified' }])
})

test('supports both .scrub and .scrubSingle', () => {
  const data = [{ pw: 'secret', name: 'Real Name' }]
  deepFreeze(data) // Ensure data doesnt mutate

  const result1 = scrub(data, configStaticScrubbersMock())
  const result2 = scrubSingle(data[0], configStaticScrubbersMock())

  expect(result1[0]).toEqual(result2)
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
