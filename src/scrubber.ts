import { ScrubberConfig, ScrubbersImpl } from './scrubber.model'
import { defaultScrubbers } from './scrubbers'

export function scrub<T extends any[]> (
  data: T,
  cfg: ScrubberConfig,
  scrubbersImpl?: ScrubbersImpl,
): T {
  return data.map(o => scrubSingle(o, cfg, scrubbersImpl)) as T
}

function scrubSingle<T extends any> (
  data: T,
  cfg: ScrubberConfig,
  scrubbersImpl?: ScrubbersImpl,
): T {
  const scrubbers = { ...defaultScrubbers, ...scrubbersImpl }
  const dataCopy = { ...data }

  Object.keys(dataCopy).forEach(key => {
    if (!cfg[key]) return

    const scrubber = scrubbers[cfg[key].scrubber]
    const params = cfg[key].params

    dataCopy[key] = scrubber(dataCopy[key], params)
  })
  return dataCopy as any
}
