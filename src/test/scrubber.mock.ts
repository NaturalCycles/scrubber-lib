import { ScrubberConfig } from '../scrubber.model'

export function configStaticScrubbersMock (): ScrubberConfig {
  return {
    fields: {
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
    },
  }
}

export function configThrowOnErrorMock (): ScrubberConfig {
  return {
    fields: {
      name: {
        scrubber: 'staticScrubber',
        params: {
          replacement: 'Jane Doe',
        },
      },
    },
    throwOnError: true,
  }
}

export function configEmailScrubberMock (): ScrubberConfig {
  return {
    fields: {
      email: {
        scrubber: 'emailScrubber',
      },
    },
  }
}

export function configInvalidScrubberMock (): ScrubberConfig {
  return {
    fields: {
      email: {
        scrubber: 'nonExistingScrubber',
      },
    },
  }
}
