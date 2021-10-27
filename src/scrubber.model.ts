import { AnyObject, StringMap } from '@naturalcycles/js-lib'

export type ScrubberFn<T = any, PARAMS = AnyObject> = (value: T, params?: PARAMS) => T

export interface ScrubberConfig {
  fields: StringMap<ScrubberFieldConfig>

  // If false, Scrubber catches any exceptions that may occur when using scrubbers,
  // logs and ignore them. If true, exceptions are logged and raised
  throwOnError?: boolean

  // If false, falsy values on fields are passed to scrubber and each scrubber
  // might handle it differently. If true, falsy values are preserved
  preserveFalsy?: boolean
}

export interface ScrubberFieldConfig {
  scrubber: string
  params?: StringMap<any>
}

export interface ScrubbersImpl {
  [scrubberName: string]: ScrubberFn<any, any>
}
