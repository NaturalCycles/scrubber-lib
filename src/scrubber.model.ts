import { StringMap } from '@naturalcycles/js-lib'

export type ScrubberFn<T = any, PARAMS = {}> = (value: T, params?: PARAMS) => T

export interface ScrubberConfig {
  fields: StringMap<ScrubberFieldConfig>
  throwOnError?: boolean
}

export interface ScrubberFieldConfig {
  scrubber: string
  params?: StringMap<any>
}

export interface ScrubbersImpl {
  [scrubberName: string]: ScrubberFn<any, any>
}
