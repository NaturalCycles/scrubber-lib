import { ScrubberConfig, ScrubbersImpl } from './scrubber.model'
import { defaultScrubbers } from './scrubbers'

export function scrub<T extends any[]> (
  data: T,
  cfg: ScrubberConfig,
  additionalScrubbersImpl?: ScrubbersImpl,
): T {
  const scrubbers = { ...defaultScrubbers, ...additionalScrubbersImpl }
  checkIfScrubbersExistAndRaise(cfg, scrubbers)

  return data.map(o => applyScrubbers(o, cfg, scrubbers)) as T
}

/*
  Sugar syntax for applying on one individual object.
 */
export function scrubSingle<T extends any> (
  data: T,
  cfg: ScrubberConfig,
  additionalScrubbersImpl?: ScrubbersImpl,
): T {
  return scrub([data], cfg, additionalScrubbersImpl)[0]
}

function applyScrubbers<T extends any[]> (
  data: T,
  cfg: ScrubberConfig,
  scrubbers: ScrubbersImpl,
): T {
  const dataCopy = { ...data }

  Object.keys(dataCopy).forEach(key => {
    const scrubberCurrentField = cfg[key]

    if (!scrubberCurrentField) {
      // Deep transverse
      if (typeof dataCopy[key] === 'object') {
        dataCopy[key] = applyScrubbers(dataCopy[key], cfg, scrubbers)
      }

      return
    }

    const scrubber = scrubbers[scrubberCurrentField.scrubber]
    const params = scrubberCurrentField.params

    dataCopy[key] = scrubber(dataCopy[key], params)
  })

  return dataCopy as any
}

function checkIfScrubbersExistAndRaise (cfg: ScrubberConfig, scrubbers: ScrubbersImpl): void {
  const scrubbersOnConfig = Object.keys(cfg).map(field => cfg[field].scrubber)
  const scrubbersAvailable = Object.keys(scrubbers)

  scrubbersOnConfig.map(scrubber => {
    if (scrubbersAvailable.indexOf(scrubber) === -1) {
      throw Error(`${scrubber} not found`)
    }
  })
}
