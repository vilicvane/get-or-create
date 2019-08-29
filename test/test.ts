import getOrCreate from '../bld/library';

test('should create hierarchy with mutated entry', () => {
  let data: {
    foo?: {
      id: string;
      bar?: {
        id: string;
        value?: number;
      }[];
    }[];
  } = {};

  let entry = getOrCreate(data)
    .property('foo', [])
    .element(element => element.id === 'abc', {id: 'abc'})
    .property('bar', [])
    .element(element => element.id === 'def', {id: 'def'})
    .exec();

  entry.value = 123;

  expect(data).toMatchInlineSnapshot(`
Object {
  "foo": Array [
    Object {
      "bar": Array [
        Object {
          "id": "def",
          "value": 123,
        },
      ],
      "id": "abc",
    },
  ],
}
`);
});

test('should create last level with mutated entry', () => {
  let data: {
    foo: {
      id: string;
      bar: {
        id: string;
        value?: number;
      }[];
    }[];
  } = {
    foo: [
      {
        id: 'abc',
        bar: [{id: 'what', value: 0}],
      },
    ],
  };

  let entry = getOrCreate(data)
    .property('foo')
    .element(element => element.id === 'abc')
    .property('bar')
    .element(element => element.id === 'def', {id: 'def'})
    .exec();

  entry.value = 123;

  expect(data).toMatchInlineSnapshot(`
Object {
  "foo": Array [
    Object {
      "bar": Array [
        Object {
          "id": "what",
          "value": 0,
        },
        Object {
          "id": "def",
          "value": 123,
        },
      ],
      "id": "abc",
    },
  ],
}
`);
});

test('should element work with `undefined`', () => {
  let data: (string | undefined)[] = [];

  let entry = getOrCreate(data)
    .element(element => element === undefined, 'foo')
    .exec();

  expect(entry).toBe('foo');

  expect(data).toMatchInlineSnapshot(`
Array [
  "foo",
]
`);
});

test('should element work with existing `undefined`', () => {
  let data: (string | undefined)[] = [undefined];

  let entry = getOrCreate(data)
    .element(element => element === undefined, 'foo')
    .exec();

  expect(entry).toBeUndefined();

  expect(data).toMatchInlineSnapshot(`
Array [
  undefined,
]
`);
});

test('should property work with `undefined`', () => {
  let data: {foo?: string} = {};

  let entry = getOrCreate(data)
    .property('foo', 'abc')
    .exec();

  expect(entry).toBe('abc');

  expect(data).toMatchInlineSnapshot(`
Object {
  "foo": "abc",
}
`);
});

test('should property work with `undefined`', () => {
  let data: {foo?: string} = {
    foo: undefined,
  };

  let entry = getOrCreate(data)
    .property('foo', 'abc')
    .exec();

  expect(entry).toBeUndefined();

  expect(data).toMatchInlineSnapshot(`
Object {
  "foo": undefined,
}
`);
});

test('should work with default value function', () => {
  let data: {foo?: string} = {};

  let entry = getOrCreate(data)
    .property('foo', () => 'abc')
    .exec();

  expect(entry).toBe('abc');

  expect(data).toMatchInlineSnapshot(`
Object {
  "foo": "abc",
}
`);
});

test('should throw source non-null object type error', () => {
  let data: any = {};

  let query = getOrCreate(data)
    .property('foo', 'foo')
    .property('bar', 123);

  expect(() => query.exec()).toThrowErrorMatchingInlineSnapshot(
    `"Expecting source for query \`{\\"type\\":\\"property\\",\\"key\\":\\"bar\\",\\"default\\":123}\` to be a non-null object"`,
  );
});

test('should throw source array type error', () => {
  let data: any = {};

  let query = getOrCreate(data).element(() => true, 'foo');

  // tslint:disable-next-line: no-inferred-empty-object-type
  expect(() => query.exec()).toThrowErrorMatchingInlineSnapshot(
    `"Expecting source for query \`{\\"type\\":\\"element\\",\\"default\\":\\"foo\\"}\` to be an array"`,
  );
});
