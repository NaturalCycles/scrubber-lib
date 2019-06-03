import { ScrubberConfig, ScrubbersImpl } from './scrubber.model'
import { defaultScrubbers } from './scrubbers'

export class Scrubber {
  scrubbers: ScrubbersImpl

  constructor (private readonly cfg: ScrubberConfig, additionalScrubbersImpl?: ScrubbersImpl) {
    this.scrubbers = { ...defaultScrubbers, ...additionalScrubbersImpl }
    this.checkIfScrubbersExistAndRaise(cfg, this.scrubbers)
  }

  scrub<T extends any[]> (data: T): T {
    return data.map(o => this.applyScrubbers(o)) as T
  }

  /*
  Syntax sugar for applying on individual object.
  */
  scrubSingle<T> (data: T): T {
    return this.applyScrubbers(data)
  }

  private applyScrubbers<T> (data: T): T {
    const dataCopy = Array.isArray(data) ? [...data] : { ...data }

    Object.keys(dataCopy).forEach(key => {
      const scrubberCurrentField = this.cfg[key]

      if (!scrubberCurrentField) {
        // Deep traverse
        if (typeof dataCopy[key] === 'object' && dataCopy[key]) {
          dataCopy[key] = this.applyScrubbers(dataCopy[key])
        }

        return
      }

      // logging is always. wrap in try/catch if cfg.throwOnError \/
      const scrubber = this.scrubbers[scrubberCurrentField.scrubber]
      const params = scrubberCurrentField.params

      dataCopy[key] = scrubber(dataCopy[key], params)
    })

    return dataCopy as any
  }

  private checkIfScrubbersExistAndRaise (cfg: ScrubberConfig, scrubbers: ScrubbersImpl): void {
    const scrubbersOnConfig = Object.keys(cfg).map(field => cfg[field].scrubber)
    const scrubbersAvailable = Object.keys(scrubbers)

    scrubbersOnConfig.forEach(scrubber => {
      if (!scrubbersAvailable.includes(scrubber)) {
        throw Error(`${scrubber} not found`)
      }
    })
  }
}
