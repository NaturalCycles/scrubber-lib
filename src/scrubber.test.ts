import { deepFreeze } from '@naturalcycles/js-lib'
import { scrub } from './scrubber'
import { ANONYMIZED_EMAIL } from './scrubbers'
import {
  configEmailScrubberMock,
  configInvalidScrubberMock,
  configStaticScrubbersMock,
} from './test/scrubber.mock'

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

test('returns empty array', () => {
  const result = scrub([], configStaticScrubbersMock())
  expect(result).toEqual([])
})

test('fails when scrubber from config is not found (even if not used)', () => {
  expect(() => {
    scrub([], configInvalidScrubberMock())
  }).toThrow()
})
