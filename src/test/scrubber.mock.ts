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

export function configMultiFieldMock (): ScrubberConfig {
  return {
    fields: {
      'field1, field2': {
        scrubber: 'staticScrubber',
        params: {
          replacement: 'modified',
        },
      },
    },
  }
}

export function configEmailScrubberMock (): ScrubberConfig {
  return {
    fields: {
      email: {
        scrubber: 'staticScrubber',
        params: {
          replacement: 'anonymized@email.com',
        },
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
