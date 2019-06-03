import { StringMap } from '@naturalcycles/js-lib'

export type ScrubberFn<T = any, PARAMS = {}> = (value: T, params?: PARAMS) => T

export interface ScrubberConfig {
  [key: string]: ScrubberFieldConfig
}

export interface ScrubberFieldConfig {
  scrubber: string
  params?: StringMap<any>
}

export interface ScrubbersImpl {
  [scrubberName: string]: ScrubberFn<any, any>
}
