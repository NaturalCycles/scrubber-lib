import { ScrubberFn, ScrubbersImpl } from './scrubber.model'

export const ANONYMIZED_EMAIL = 'anonymized@nc.com'

// export type dateScrubberFn = (value: string, params: { excludeDay?: boolean }) => string
// export type staticScrubberFn = (value: string, params: { replacement: string }) => string
export type emailScrubberFn = () => string

export const staticScrubber: ScrubberFn = (value, params = {}) => params.replacement

export const emailScrubber: emailScrubberFn = () => ANONYMIZED_EMAIL

export const undefinedScrubber: ScrubberFn = () => undefined

export const dateScrubber: ScrubberFn = (value, params = {}) => {
  return value.substr(0, 7) + '-01'
}

export const defaultScrubbers: ScrubbersImpl = {
  staticScrubber,
  emailScrubber,
  dateScrubber,
  undefinedScrubber,
}
