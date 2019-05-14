import {ScrubberConfig, ScrubbersImpl} from "./scrubber.model";
import {defaultScrubbers} from "./scrubbers";

export function scrub<T extends any[]> (data: T, cfg: ScrubberConfig, scrubbersImpl?: ScrubbersImpl): T {
  return data.map(o => scrubSingle(o, cfg, scrubbersImpl)) as T
}

function scrubSingle<T extends any> (data: T, cfg: ScrubberConfig, scrubbersImpl?: ScrubbersImpl): T {
  const scrubbers = {...defaultScrubbers, ...scrubbersImpl}
  const data2 = { ...data}
  Object.keys(data2).forEach(key => {
    if (cfg[key]) {
      data2[key] = scrubbers[cfg[key]](data2[key])
    }
  })
  return data2 as any
}
