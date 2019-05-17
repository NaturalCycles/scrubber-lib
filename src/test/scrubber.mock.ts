import { ScrubberConfig } from '../scrubber.model'

export function configStaticScrubbersMock (): ScrubberConfig {
  return {
    pw: {
      scrubber: 'staticScrubber',
      params: {
        replacement: 'notsecret',
      },
    },
    name: {
      scrubber: 'staticScrubber',
      params: {
        replacement: 'Jane Doe',
      },
    },
  }
}

export function configEmailScrubberMock (): ScrubberConfig {
  return {
    email: {
      scrubber: 'emailScrubber',
    },
  }
}

export function configInvalidScrubberMock (): ScrubberConfig {
  return {
    email: {
      scrubber: 'nonExistingScrubber',
    },
  }
}
