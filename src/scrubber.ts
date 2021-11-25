import { nanoid } from 'nanoid'
import { StringMap } from '@naturalcycles/js-lib'
import { ScrubberConfig, ScrubbersImpl } from './scrubber.model'
import { defaultScrubbers } from './scrubbers'

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
    this.cfg.splitFields = this.splitFields(cfg)
    this.checkIfScrubbersExistAndRaise(cfg, this.scrubbers)
  }

  scrub<T>(data: T): T {
    return this.applyScrubbers(data)
  }

  private applyScrubbers<T>(data: T, parents?: string[]): T {
    const dataCopy = Array.isArray(data) ? [...data] : { ...data }

    Object.keys(dataCopy).forEach(key => {
      let scrubberCurrentField = this.cfg.fields[key]

      if (
        !scrubberCurrentField &&
        this.cfg.splitFields &&
        this.cfg.splitFields[key] &&
        parents &&
        this.arraysEqual(this.cfg.splitFields[key], parents)
      ) {
        const recomposedKey = [...parents, key].join('.')
        scrubberCurrentField = this.cfg.fields[recomposedKey]
      }

      if (!scrubberCurrentField) {
        // Ignore unsupported object types
        if (
          dataCopy[key] instanceof Map ||
          dataCopy[key] instanceof Set ||
          Buffer.isBuffer(dataCopy[key])
        ) {
          return
        }

        // Deep traverse
        if (typeof dataCopy[key] === 'object' && dataCopy[key]) {
          const parentsNext = parents ? [...parents, key] : [key]
          dataCopy[key] = this.applyScrubbers(dataCopy[key], parentsNext)
        }

        return
      }

      const scrubber = this.scrubbers[scrubberCurrentField.scrubber]!
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
        const fieldCfg = newCfg.fields[key]!

        delete newCfg.fields[key]

        fieldNames.forEach(fieldName => {
          newCfg.fields[fieldName.trim()] = fieldCfg
        })
      }
    })

    return newCfg
  }

  private checkIfScrubbersExistAndRaise(cfg: ScrubberConfig, scrubbers: ScrubbersImpl): void {
    if (!cfg.fields) throw new Error("Missing the 'fields' key on ScrubberConfig")

    const scrubbersOnConfig = Object.keys(cfg.fields).map(field => cfg.fields[field]!.scrubber)
    const scrubbersAvailable = Object.keys(scrubbers)

    scrubbersOnConfig.forEach(scrubber => {
      if (!scrubbersAvailable.includes(scrubber)) {
        throw new Error(`${scrubber} not found`)
      }
    })
  }

  private splitFields(cfg: ScrubberConfig): StringMap<string[]> {
    const output: StringMap<string[]> = {}
    for (const field of Object.keys(cfg.fields)) {
      const splitField = field.split('.')

      if (splitField.length > 1) {
        const key = splitField.pop() as string
        output[key] = splitField
      }
    }
    return output
  }

  private arraysEqual(a: any[] | undefined, b: any[] | undefined) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false

    for (const [i, element] of a.entries()) {
      if (element !== b[i]) return false
    }
    return true
  }
}
