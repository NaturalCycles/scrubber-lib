import { ScrubberConfig, ScrubbersImpl } from './scrubber.model'
import { defaultScrubbers } from './scrubbers'

export class Scrubber {
  cfg: ScrubberConfig
  scrubbers: ScrubbersImpl

  constructor (cfg: ScrubberConfig, additionalScrubbersImpl?: ScrubbersImpl) {
    const scrubbers = { ...defaultScrubbers, ...additionalScrubbersImpl }
    this.checkIfScrubbersExistAndRaise(cfg, scrubbers)

    this.cfg = cfg
    this.scrubbers = scrubbers
  }

  scrub<T extends any[]> (data: T): T {
    return data.map(o => this.applyScrubbers(o)) as T
  }

  /*
  Syntax sugar for applying on individual object.
  */
  scrubSingle<T extends any> (data: T): T {
    return this.scrub([data])[0]
  }

  private applyScrubbers<T extends any[]> (data: T): T {
    const dataCopy = { ...data }

    Object.keys(dataCopy).forEach(key => {
      const scrubberCurrentField = this.cfg[key]

      if (!scrubberCurrentField) {
        // Deep transverse
        if (typeof dataCopy[key] === 'object') {
          dataCopy[key] = this.applyScrubbers(dataCopy[key])
        }

        return
      }

      const scrubber = this.scrubbers[scrubberCurrentField.scrubber]
      const params = scrubberCurrentField.params

      dataCopy[key] = scrubber(dataCopy[key], params)
    })

    return dataCopy as any
  }

  private checkIfScrubbersExistAndRaise (cfg: ScrubberConfig, scrubbers: ScrubbersImpl): void {
    const scrubbersOnConfig = Object.keys(cfg).map(field => cfg[field].scrubber)
    const scrubbersAvailable = Object.keys(scrubbers)

    scrubbersOnConfig.map(scrubber => {
      if (scrubbersAvailable.indexOf(scrubber) === -1) {
        throw Error(`${scrubber} not found`)
      }
    })
  }
}
