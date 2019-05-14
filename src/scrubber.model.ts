import { StringMap } from '@naturalcycles/js-lib'

export type ScrubberFn = (value?: any, params?: StringMap<any>) => any

export interface ScrubberConfig {
  [key: string]: ScrubberFieldConfig
}

export interface ScrubberFieldConfig {
  scrubber: string
  params?: StringMap<any>
}

export interface ScrubbersImpl {
  [scrubberName: string]: ScrubberFn
}
