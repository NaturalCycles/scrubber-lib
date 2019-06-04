## @naturalcycles/scrubber-lib

> Scrub data in JavaScript plain objects by using rules defined in a configuration object

[![npm](https://img.shields.io/npm/v/@naturalcycles/scrubber-lib/latest.svg)](https://www.npmjs.com/package/@naturalcycles/scrubber-lib)
[![](https://circleci.com/gh/NaturalCycles/scrubber-lib.svg?style=shield&circle-token=123)](https://circleci.com/gh/NaturalCycles/scrubber-lib)
[![Maintainability](https://api.codeclimate.com/v1/badges/f0dc9286576fec8a6468/maintainability)](https://codeclimate.com/repos/5b896d73aae5fd17b200b306/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f0dc9286576fec8a6468/test_coverage)](https://codeclimate.com/repos/5b896d73aae5fd17b200b306/test_coverage)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## How to use

Install it:

```
yarn add -D @naturalcycles/scrubber-lib
```

Define a scrubber configuration object:

```javascript
import { ScrubberConfig, Scrubber } from '@naturalcycles/scrubber-lib'

const cfg: ScrubberConfig = {
  fields: {
    name: {
      scrubber: 'staticScrubber',
      params: {
        replacement: 'John Doe',
      },
    },
    password: {
      scrubber: 'undefinedScrubber',
    },
  },
  throwOnError: true,
}
```

Scrub a single object:

```javascript
const object = { name: 'Real Name', password: 'secret' }

const scrubber = new Scrubber(cfg)
const scrubbedObject = scrubber.scrubSingle(object)

// scrubbedObject =  name: 'John Doe', password: undefined }
```

Scrub an array of objects:

```javascript
const objects = [object1, object2, object3]

const scrubbedObjects = scrubber.scrub(objects)
```

## Public API

```javascript
constructor (private cfg: ScrubberConfig, additionalScrubbersImpl?: ScrubbersImpl)
scrub<T extends any[]> (data: T): T
scrubSingle<T> (data: T): T
```

## Features

- **Objects are deep traversed**
- **Immutable** changes (does not mutate the original object)
- TypeScript library, compatible both on browsers and NodeJS
- Fields are scrubbed if object keys match the field names on the configuration file
- Provides a few built-in scrubber functions
- Allows additional scrubber functions
- Validates config object on class initialization to ensure all defined scrubber functions exist
- Supports field names to be comma-separated on configuration file
- Error handling: all errors are logged and allows a `cfg.throwOnError` optional configuration to
  re-throw errors

## Possible use cases

Allows, for example, removal of sensitive data for:

- Logs
- Error reporting to third-party services
- Data exports (such as staging or other data exports)
- Anonymizing production users (GDPR "_right to be forgotten_")

# Packaging

- `engines.node >= 10.13`: Latest Node.js LTS
- `main: dist/index.js`: commonjs, es2018
- `types: dist/index.d.ts`: typescript types
- `/src` folder with source `*.ts` files included
