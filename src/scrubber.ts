import { ScrubberConfig, ScrubbersImpl } from './scrubber.model'
import { defaultScrubbers } from './scrubbers'

import { nanoid } from 'nanoid'

export class Scrubber {
  private readonly scrubbers: ScrubbersImpl
  private readonly initializationVector: string

  constructor(
    private cfg: ScrubberConfig,
    additionalScrubbersImpl?: ScrubbersImpl,
    initialzationVector?: string,
  ) {
    const defaultCfg: Partial<ScrubberConfig> = { throwOnError: false, preserveFalsy: true }

    this.initializationVector = initialzationVector ? initialzationVector : nanoid()
    this.scrubbers = { ...defaultScrubbers, ...additionalScrubbersImpl }
    this.cfg = { ...defaultCfg, ...this.expandCfg(cfg) }
    this.checkIfScrubbersExistAndRaise(cfg, this.scrubbers)
  }

  scrub<T>(data: T): T {
    return this.applyScrubbers(data)
  }

  private applyScrubbers<T>(data: T): T {
    const dataCopy = Array.isArray(data) ? [...data] : { ...data }

    Object.keys(dataCopy).forEach(key => {
      const scrubberCurrentField = this.cfg.fields[key]

      if (!scrubberCurrentField) {
        // Ignore unsupported object types
        if (
          dataCopy[key] instanceof Map ||
          dataCopy[key] instanceof Set ||
          dataCopy[key] instanceof Buffer
        ) {
          return
        }

        // Deep traverse
        if (typeof dataCopy[key] === 'object' && dataCopy[key]) {
          dataCopy[key] = this.applyScrubbers(dataCopy[key])
        }

        return
      }

      const scrubber = this.scrubbers[scrubberCurrentField.scrubber]
      const params = {
        initializationVector: this.initializationVector,
        ...scrubberCurrentField.params,
      }

      // Always log on errors, re-throw if enabled on config
      try {
        if (!this.cfg.preserveFalsy || dataCopy[key]) {
          dataCopy[key] = scrubber(dataCopy[key], params)
        }
      } catch (err) {
        console.log(
          `Error when applying scrubber '${scrubberCurrentField.scrubber}' to field '${key}'`,
        )
        console.error(err)

        if (this.cfg.throwOnError) throw err
      }
    })

    return dataCopy as any
  }

  /*
   * Allows comma-separated field names to be used as keys on YAML for better reusability
   * YAML:
   *  field1, field2, field3:
   *    scrubber: <scrubberName>
   *
   * Will become:
   *  field1:
   *    scrubber: <scrubberName>
   *  field2:
   *    scrubber: <scrubberName>
      ...
   *
   *
   * This function returns a new ScrubberConfig where each field is denormalized,
   * allowing fast lookup by keys
   */
  private expandCfg(cfg: ScrubberConfig): ScrubberConfig {
    const newCfg = { ...cfg }

    Object.keys(newCfg.fields).forEach(key => {
      if (key.includes(',')) {
        const fieldNames = key.split(',')
        const fieldCfg = newCfg.fields[key]

        delete newCfg.fields[key]

        fieldNames.forEach(fieldName => {
          newCfg.fields[fieldName.trim()] = fieldCfg
        })
      }
    })

    return newCfg
  }

  private checkIfScrubbersExistAndRaise(cfg: ScrubberConfig, scrubbers: ScrubbersImpl): void {
    if (!cfg.fields) throw Error("Missing the 'fields' key on ScrubberConfig")

    const scrubbersOnConfig = Object.keys(cfg.fields).map(field => cfg.fields[field].scrubber)
    const scrubbersAvailable = Object.keys(scrubbers)

    scrubbersOnConfig.forEach(scrubber => {
      if (!scrubbersAvailable.includes(scrubber)) {
        throw Error(`${scrubber} not found`)
      }
    })
  }
}
