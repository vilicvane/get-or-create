interface PropertyQuery {
  type: 'property';
  key: string | number | symbol;
  default: unknown;
}

interface ElementQuery {
  type: 'element';
  default: unknown;
  matcher(object: unknown): boolean;
}

type Query = PropertyQuery | ElementQuery;

type ArrayElement<TArray> = TArray extends (infer TElement)[]
  ? TElement
  : never;

export type GetOrCreateQueryDefault<T> = T | (() => T);

export class GetOrCreateQueryBuilder<T> {
  private constructor(source: GetOrCreateQueryBuilder<unknown>, query: Query);
  private constructor(source: object);
  private constructor(private source: object, private query?: Query) {}

  property<TKey extends keyof T>(
    key: TKey,
    defaultValue: Exclude<T[TKey], undefined>,
  ): GetOrCreateQueryBuilder<Exclude<T[TKey], undefined>>;
  property<TKey extends keyof T>(
    key: TKey,
    defaultValue: T[TKey],
  ): GetOrCreateQueryBuilder<T[TKey]>;
  property<TKey extends keyof T, TDefaultValue extends T[TKey]>(
    key: TKey,
    defaultValue: GetOrCreateQueryDefault<TDefaultValue>,
  ): GetOrCreateQueryBuilder<TDefaultValue> {
    return new GetOrCreateQueryBuilder(this, {
      type: 'property',
      key,
      default: defaultValue,
    });
  }

  element(
    matcher: (object: ArrayElement<T>) => boolean,
    defaultValue: GetOrCreateQueryDefault<ArrayElement<T>>,
  ): GetOrCreateQueryBuilder<ArrayElement<T>> {
    return new GetOrCreateQueryBuilder(this, {
      type: 'element',
      matcher,
      default: defaultValue,
    });
  }

  exec(): T;
  exec(): unknown {
    let source = this.source;

    return source instanceof GetOrCreateQueryBuilder
      ? source.execQuery(this.query!)
      : source;
  }

  private execQuery(query: Query): unknown {
    let source = this.exec() as any;

    if (typeof source !== 'object' || !source) {
      throw new Error(
        `Expecting source for query \`${JSON.stringify(
          query,
        )}\` to be a non-null object`,
      );
    }

    if (query.type === 'property') {
      let {key, default: defaultValue} = query;

      let value: unknown;

      if (key in source) {
        value = source[key];
      } else {
        value = evaluateDefaultValue(defaultValue);
        source[key] = value;
      }

      return value;
    } else {
      if (!Array.isArray(source)) {
        throw new Error(
          `Expecting source for query \`${JSON.stringify(
            query,
          )}\` to be an array`,
        );
      }

      let {matcher, default: defaultValue} = query;

      let index = source.findIndex(matcher);
      let value: unknown;

      if (index >= 0) {
        value = source[index];
      } else {
        value = evaluateDefaultValue(defaultValue);
        source.push(value);
      }

      return value;
    }
  }

  static create<T extends object>(object: T): GetOrCreateQueryBuilder<T> {
    return new GetOrCreateQueryBuilder(object);
  }
}

function evaluateDefaultValue(defaultValue: unknown): unknown {
  if (typeof defaultValue === 'function') {
    return defaultValue();
  } else {
    return defaultValue;
  }
}
