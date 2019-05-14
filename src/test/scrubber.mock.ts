import {ScrubberConfig} from "../scrubber.model";

export function configMock(): ScrubberConfig {
  return {
    pw: 'staticScrubber',
    name: 'staticScrubber'
  }
}

export function configMock2(): ScrubberConfig {
  return {
    password: 'staticScrubber',
    email: 'emailScrubber'
  }
}
