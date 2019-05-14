import {ScrubberFn, ScrubbersImpl} from "./scrubber.model";

export const staticScrubber: ScrubberFn = () => "abc"
export const emailScrubber: ScrubberFn = () => "test@nc.com"

export const defaultScrubbers: ScrubbersImpl = {
  staticScrubber, emailScrubber
}
