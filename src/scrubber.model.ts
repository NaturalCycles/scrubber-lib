


export type ScrubberFn = (value: any) => any

export type ScrubberConfig = {
  [key: string]: string
}

export type ScrubbersImpl = {
  [scrubberName: string]: ScrubberFn
}

