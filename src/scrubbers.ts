import * as crypto from 'crypto'
import { ScrubberFn, ScrubbersImpl } from './scrubber.model'

import { customAlphabet } from 'nanoid'

/*
 Undefined scrubber

 Replace value with `undefined`
 */
export type UndefinedScrubberFn = ScrubberFn<any, undefined>

export const undefinedScrubber: UndefinedScrubberFn = () => undefined

/*
 Preserve original scrubber

 Useful for profiles that inherit from another and want to keep original value
 (eg: "removing" scrubber from parent)
 */
export type PreserveOriginalScrubberFn = ScrubberFn<any, undefined>

export const preserveOriginalScrubber: PreserveOriginalScrubberFn = value => value

/*
 Static scrubber

 Replace value with `params.replacement`
 */
export interface StaticScrubberParams {
  replacement: string | number
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

/*
 Unix timestamp (timestamp in seconds) scrubber
 */
export interface UnixTimestampScrubberParams {
  excludeTime?: boolean
  excludeDay?: boolean
  excludeMonth?: boolean
  excludeYear?: boolean
}
export type UnixTimestampScrubberFn = ScrubberFn<
  number | string | undefined,
  UnixTimestampScrubberParams
>

export const unixTimestampScrubber: UnixTimestampScrubberFn = (value, params = {}) => {
  if (!value) return

  const date = new Date((value as number) * 1000)

  if (value && params.excludeTime) {
    date.setSeconds(0)
    date.setMinutes(0)
    date.setHours(0)
  }

  if (value && params.excludeDay) {
    date.setDate(1)
  }

  if (value && params.excludeMonth) {
    date.setMonth(0)
  }

  if (value && params.excludeYear) {
    date.setFullYear(1970)
  }

  return Math.round(date.getTime() / 1000)
}

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

/*
  Random scrubber

  Uses the package nanoid to generate a random string given an alphabet and a length
 */
const ALPHABET_NUMBER = '0123456789'
const ALPHABET_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const ALPHABET_ALPHANUMERIC_LOWERCASE = [ALPHABET_NUMBER, ALPHABET_LOWERCASE].join('')

export interface RandomScrubberParams {
  alphabet?: string
  length?: number
}

export type RandomScrubberFn = ScrubberFn<string, RandomScrubberParams>

export const randomScrubber: RandomScrubberFn = (value, additionalParams) => {
  const params = { alphabet: ALPHABET_ALPHANUMERIC_LOWERCASE, length: 16, ...additionalParams }
  return customAlphabet(params.alphabet, params['length'])()
}

/*
  Random email scrubber

  Uses the package nanoid to generate a random string given an alphabet and a length
  and appends a given domain (should include '@') at the end of it
 */
export interface RandomEmailScrubberParams {
  alphabet?: string
  length?: number
  domain?: string
}

export type RandomEmailScrubberFn = ScrubberFn<string, RandomEmailScrubberParams>

export const randomEmailScrubber: RandomEmailScrubberFn = (value, additionalParams) => {
  const params = {
    alphabet: ALPHABET_ALPHANUMERIC_LOWERCASE,
    length: 16,
    domain: '@example.com',
    ...additionalParams,
  }
  return customAlphabet(params.alphabet, params['length'])() + params.domain
}

/*
  Random email in content scrubber

  Extends the random email scrubber and allows scrubbing emails within strings while maintaining the rest of the string
 */
export interface RandomEmailInContentScrubberParams {
  alphabet?: string
  length?: number
  domain?: string
}

export type RandomEmailInContentScrubberFn = ScrubberFn<string, RandomEmailInContentScrubberParams>

export const randomEmailInContentScrubber: RandomEmailInContentScrubberFn = (
  value,
  additionalParams,
) => {
  // Email regex, allows letters
  const emailRegex = /([a-zA-Z1-9\._-]*@[a-zA-Z1-9\._-]*\.[a-zA-Z_-]{2,3})/
  const matches = emailRegex.exec(value)
  if (!matches) {
    // No email found, return as is
    return value
  } else {
    // Replace all matches with random email
    const match = matches.pop() as string
    value = value.replace(match, randomEmailScrubber(value, additionalParams))

    return value
  }
}

/*
  Salted hash scrubber.

  Takes an initializationVector param and uses it to salt the value before hashing it.
 */
export interface SaltedHashScrubberParams {
  initializationVector: string
}

export type SaltedHashScrubberFn = ScrubberFn<string, SaltedHashScrubberParams>

export const saltedHashScrubber: SaltedHashScrubberFn = (value, params) => {
  if (!params || !params.initializationVector) {
    throw new Error('Initialization vector is missing')
  }

  return crypto.createHash('sha256').update(value).update(params.initializationVector).digest('hex')
}

/*
  Salted hash email scrubber.

  Takes an initializationVector param and uses it to salt the value before hashing it and suffixing email domain
 */
export interface SaltedHashEmailScrubberParams {
  initializationVector: string
  domain?: string
}

export type SaltedHashEmailScrubberFn = ScrubberFn<string, SaltedHashEmailScrubberParams>

export const saltedHashEmailScrubber: SaltedHashEmailScrubberFn = (value, additionalParams) => {
  const params = {
    domain: '@example.com',
    ...additionalParams,
  } as SaltedHashEmailScrubberParams

  if (!params || !params.initializationVector) {
    throw new Error('Initialization vector is missing')
  }

  return saltedHashScrubber(value, params) + params.domain
}

/*
 Bcrypt string scrubber. Scrubs both salt and hash while maintaining algo and cost factor, thus resulting in a valid,
 but nonsense bcrypt string

 */
export type BcryptStringScrubberFn = ScrubberFn<string | undefined, BcryptStringScrubberParams>

/*
 replacements string is a comma seperated list of key-value pairs (seperated by :) that maps bcrypt string prefix
 (algo + cost factor) to a resulting string replacement.

 e.g. replacements: '$2a$10$:$2a$10$456,$2a$12$:$2a$12$123'
 */
export interface BcryptStringScrubberParams {
  replacements: string
}

export const bcryptStringScrubber: BcryptStringScrubberFn = (value, params) => {
  if (!value) return value

  // Keep value until 3rd $
  const cutoff = nthChar(value, '$', 3)
  if (!cutoff) return `$2a$12$${customAlphabet(ALPHABET_ALPHANUMERIC_LOWERCASE, 53)()}`

  const prefix = value.substring(0, cutoff)

  if (params?.replacements) {
    for (const kvPair of params.replacements.split(',')) {
      const [k, v] = kvPair.split(':')
      if (prefix === k) return v
    }
  }

  return `${prefix}${customAlphabet(ALPHABET_ALPHANUMERIC_LOWERCASE, 53)()}`
}

function nthChar(str: string, character: string, n: number): number | undefined {
  let count = 0
  let i = 0
  while (count < n) {
    i = str.indexOf(character, i) + 1
    if (i < 1) {
      return
    }
    count++

    if (count === n) return i
  }
}

export const defaultScrubbers: ScrubbersImpl = {
  staticScrubber,
  preserveOriginalScrubber,
  isoDateStringScrubber,
  unixTimestampScrubber,
  undefinedScrubber,
  charsFromRightScrubber,
  randomScrubber,
  randomEmailScrubber,
  randomEmailInContentScrubber,
  saltedHashScrubber,
  saltedHashEmailScrubber,
  bcryptStringScrubber,
}
