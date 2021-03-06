## [2.7.2](https://github.com/NaturalCycles/scrubber-lib/compare/v2.7.1...v2.7.2) (2020-08-27)


### Bug Fixes

* yarn upgrade and adapting to nanoid 3.x ([886b9c0](https://github.com/NaturalCycles/scrubber-lib/commit/886b9c01cc34333f8be0f8fb0a50692eb2566788))

## [2.7.1](https://github.com/NaturalCycles/scrubber-lib/compare/v2.7.0...v2.7.1) (2020-08-27)


### Bug Fixes

* support algo-specific replacements ([60596ba](https://github.com/NaturalCycles/scrubber-lib/commit/60596ba9fc489e465c18a41dced750fbf81fa0fe))

# [2.7.0](https://github.com/NaturalCycles/scrubber-lib/compare/v2.6.0...v2.7.0) (2020-08-26)


### Features

* enable scrubbing of bcrypt without losing algo and cost factor ([d4e7193](https://github.com/NaturalCycles/scrubber-lib/commit/d4e7193d1491afa6f046e59d9b796c1542ae5451))

# [2.6.0](https://github.com/NaturalCycles/scrubber-lib/compare/v2.5.1...v2.6.0) (2019-11-21)


### Features

* add preserveOrignal scrubber ([#14](https://github.com/NaturalCycles/scrubber-lib/issues/14)) ([cf7662c](https://github.com/NaturalCycles/scrubber-lib/commit/cf7662c3ee56842b44548e6db96446ca9b5c2b68))

## [2.5.1](https://github.com/NaturalCycles/scrubber-lib/compare/v2.5.0...v2.5.1) (2019-11-07)


### Bug Fixes

* add Buffer to list of unsupported types ([2c088ac](https://github.com/NaturalCycles/scrubber-lib/commit/2c088ac3f0fa6bbda05cd5d028d0bfc5287c5522))

# [2.5.0](https://github.com/NaturalCycles/scrubber-lib/compare/v2.4.0...v2.5.0) (2019-07-10)


### Bug Fixes

* support multi-dotted domains ([8ecf825](https://github.com/NaturalCycles/scrubber-lib/commit/8ecf825))


### Features

* add salted email hashing scrubber ([ebaca11](https://github.com/NaturalCycles/scrubber-lib/commit/ebaca11))
* scrubber param init vector should take precedence ([5234594](https://github.com/NaturalCycles/scrubber-lib/commit/5234594))

# [2.4.0](https://github.com/NaturalCycles/scrubber-lib/compare/v2.3.0...v2.4.0) (2019-07-09)


### Bug Fixes

* escape dot in regex ([97ff850](https://github.com/NaturalCycles/scrubber-lib/commit/97ff850))


### Features

* added scrubbing of email in text ([0c181bd](https://github.com/NaturalCycles/scrubber-lib/commit/0c181bd))

# [2.3.0](https://github.com/NaturalCycles/scrubber-lib/compare/v2.2.0...v2.3.0) (2019-07-03)


### Features

* add support for passing initializationVector ([df0c31b](https://github.com/NaturalCycles/scrubber-lib/commit/df0c31b))

# [2.2.0](https://github.com/NaturalCycles/scrubber-lib/compare/v2.1.0...v2.2.0) (2019-07-03)


### Features

* update default scrubbers ([#7](https://github.com/NaturalCycles/scrubber-lib/issues/7)) ([d38e940](https://github.com/NaturalCycles/scrubber-lib/commit/d38e940))

# [2.1.0](https://github.com/NaturalCycles/scrubber-lib/compare/v2.0.0...v2.1.0) (2019-07-03)


### Bug Fixes

* as any magic ([c74d29c](https://github.com/NaturalCycles/scrubber-lib/commit/c74d29c))


### Features

* add cfg.preserveFalsy ([6538a78](https://github.com/NaturalCycles/scrubber-lib/commit/6538a78))
* add unixTimestampScrubber ([462bd5c](https://github.com/NaturalCycles/scrubber-lib/commit/462bd5c))
* saltedHashScrubber ([2809466](https://github.com/NaturalCycles/scrubber-lib/commit/2809466))

# [2.0.0](https://github.com/NaturalCycles/scrubber-lib/compare/v1.2.0...v2.0.0) (2019-07-02)


### Features

* simplify return type ([#5](https://github.com/NaturalCycles/scrubber-lib/issues/5)) ([8922267](https://github.com/NaturalCycles/scrubber-lib/commit/8922267))


### BREAKING CHANGES

* public API changed

# [1.2.0](https://github.com/NaturalCycles/scrubber-lib/compare/v1.1.0...v1.2.0) (2019-07-01)


### Features

* add random email scrubber ([#4](https://github.com/NaturalCycles/scrubber-lib/issues/4)) ([e876f09](https://github.com/NaturalCycles/scrubber-lib/commit/e876f09))

# [1.1.0](https://github.com/NaturalCycles/scrubber-lib/compare/v1.0.0...v1.1.0) (2019-06-19)


### Features

* add randomScrubber ([#3](https://github.com/NaturalCycles/scrubber-lib/issues/3)) ([2ea5f24](https://github.com/NaturalCycles/scrubber-lib/commit/2ea5f24))

# 1.0.0 (2019-06-05)


### Features

* init project by create-module ([af8931b](https://github.com/NaturalCycles/scrubber-lib/commit/af8931b))
* initial release ([#1](https://github.com/NaturalCycles/scrubber-lib/issues/1)) ([1c77c5c](https://github.com/NaturalCycles/scrubber-lib/commit/1c77c5c))
