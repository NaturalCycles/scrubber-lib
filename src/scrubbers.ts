import { ScrubberFn, ScrubbersImpl } from './scrubber.model'
type NanoidGenerate = (alphabet: string, length?: number) => string

const nanoidGenerate = require('nanoid/generate') as NanoidGenerate

/*
 Undefined scrubber

 Replace value with `undefined`
 */
export type UndefinedScrubberFn = ScrubberFn<any, undefined>

export const undefinedScrubber: UndefinedScrubberFn = () => undefined

/*
 Static scrubber

 Replace value with `params.replacement`
 */
export interface StaticScrubberParams {
  replacement: string
}
export type StaticScrubberFn = ScrubberFn<any, StaticScrubberParams>

export const staticScrubber: StaticScrubberFn = (value, params = { replacement: '' }) =>
  params.replacement

/*
 ISO Date string scrubber

 excludeDay: 2019-05-25 -> 2019-05-01
 excludeMonth: 2019-05-25 -> 2019-01-25
 excludeYear: 2019-05-25 -> 1970-05-25
 */
export interface ISODateStringScrubberParams {
  excludeDay?: boolean
  excludeMonth?: boolean
  excludeYear?: boolean
}
export type ISODateStringScrubberFn = ScrubberFn<string | undefined, ISODateStringScrubberParams>

export const isoDateStringScrubber: ISODateStringScrubberFn = (value, params = {}) => {
  if (!value) return

  if (value && params.excludeDay) {
    value = value.substr(0, 8) + '01'
  }

  if (value && params.excludeMonth) {
    value = value.substr(0, 5) + '01' + value.substr(7, 3)
  }

  if (value && params.excludeYear) {
    value = '1970' + value.substr(4, 9)
  }

  return value
}

// TODO: unixTimestampScrubber (unix or ms) that also allows day, month anonymization

/*
  Chars From Right scrubber

  Replace `params.count` characters, from the right to the left, with `params.replacement`
  Useful for anonymizing zip codes
 */
export interface CharsFromRightScrubberParams {
  count: number
  replacement: string
}
export type CharsFromRightScrubberFn = ScrubberFn<string | undefined, CharsFromRightScrubberParams>

export const charsFromRightScrubber: CharsFromRightScrubberFn = (
  value,
  params = { count: 99, replacement: 'X' },
) => {
  if (!value) return

  const { count, replacement } = params

  const lengthToReplace = Math.min(count, value.length)
  return value.substr(0, value.length - count) + replacement.repeat(lengthToReplace)
}

export const defaultScrubbers: ScrubbersImpl = {
  staticScrubber,
  isoDateStringScrubber,
  undefinedScrubber,
  charsFromRightScrubber,
}

/*
  Random scrubber

  Uses the package nanoid to generate a random string given an alphabet and a length
 */
const ALPHABET_NUMBER = '0123456789'
const ALPHABET_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const ALPHABET_ALPHANUMERIC_LOWERCASE = [ALPHABET_NUMBER, ALPHABET_LOWERCASE].join('')

export interface RandomScrubberParams {
  alphabet: string
  length: number
}

export type RandomScrubberFn = ScrubberFn<string, RandomScrubberParams>

export const randomScrubber: RandomScrubberFn = (
  value,
  params = { alphabet: ALPHABET_ALPHANUMERIC_LOWERCASE, length: 16 },
) => nanoidGenerate(params.alphabet, params.length)
