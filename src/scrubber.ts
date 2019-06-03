import { ScrubberConfig, ScrubbersImpl } from './scrubber.model'
import { defaultScrubbers } from './scrubbers'

export class Scrubber {
  private readonly scrubbers: ScrubbersImpl

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
      const scrubberCurrentField = this.cfg.fields[key]

      if (!scrubberCurrentField) {
        // Deep traverse
        if (typeof dataCopy[key] === 'object' && dataCopy[key]) {
          dataCopy[key] = this.applyScrubbers(dataCopy[key])
        }

        return
      }

      const scrubber = this.scrubbers[scrubberCurrentField.scrubber]
      const { params } = scrubberCurrentField

      // Always log on errors, re-throw if enabled on config
      try {
        dataCopy[key] = scrubber(dataCopy[key], params)
      } catch (e) {
        console.log(
          `Error when applying scrubber '${scrubberCurrentField.scrubber}' to field '${key}'`,
        )
        console.log(e)

        if (this.cfg.throwOnError) throw e
      }
    })

    return dataCopy as any
  }

  private checkIfScrubbersExistAndRaise (cfg: ScrubberConfig, scrubbers: ScrubbersImpl): void {
    const scrubbersOnConfig = Object.keys(cfg.fields).map(field => cfg.fields[field].scrubber)
    const scrubbersAvailable = Object.keys(scrubbers)

    scrubbersOnConfig.forEach(scrubber => {
      if (!scrubbersAvailable.includes(scrubber)) {
        throw Error(`${scrubber} not found`)
      }
    })
  }
}
