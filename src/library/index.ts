import {GetOrCreateQueryBuilder} from './builder';

export function getOrCreate<T extends object>(
  object: T,
): GetOrCreateQueryBuilder<T> {
  return GetOrCreateQueryBuilder.create(object);
}

export default getOrCreate;

export * from './builder';
