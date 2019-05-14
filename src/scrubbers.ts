import { ScrubberFn, ScrubbersImpl } from './scrubber.model'

export const ANONYMIZED_EMAIL = 'anonymized@nc.com'

// export type staticScrubberFn = (value: string, params: { replacement: string }) => string
export type emailScrubberFn = () => string

export const staticScrubber: ScrubberFn = (value, params = {}) => params.replacement

export const emailScrubber: emailScrubberFn = () => ANONYMIZED_EMAIL

export const defaultScrubbers: ScrubbersImpl = {
  staticScrubber,
  emailScrubber,
}
