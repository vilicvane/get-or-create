[![NPM Package](https://badge.fury.io/js/get-or-create.svg)](https://www.npmjs.com/package/get-or-create)

# Get or Create

A simple utility to get or create nested property and element in place.

## Install

```sh
yarn add get-or-create
```

## Usage

```ts
import getOrCreate from 'get-or-create';

let data = {};

let entry = getOrCreate(data)
  .property('foo', [])
  .element(element => element.id === 'abc', {id: 'abc'})
  .property('bar', [])
  .element(element => element.id === 'def', {id: 'def'})
  .exec();

entry.value = 123;
```

Mutated `data`:

```json
{
  "foo": [
    {
      "id": "abc",
      "bar": [
        {
          "id": "def",
          "value": 123
        }
      ]
    }
  ]
}
```

## License

MIT License.
