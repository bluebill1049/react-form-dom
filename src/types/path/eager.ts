import { FieldValues } from '../fields';
import { BrowserNativeObject, IsAny, IsEqual, Primitive } from '../utils';

import { ArrayKey, IsTuple, TupleKeys } from './common';

/**
 * The maximum recursion depth for type checking.
 * Adjust this value to control how deeply nested paths are evaluated.
 */
export type MaxDepth = 50;
export type DefaultDepth = 6;

/**
 * Utility type to decrement the depth value.
 * This is used to limit the recursion in type checking.
 */
type DecrementDepth<D extends number> = D extends MaxDepth
  ? 49
  : D extends 49
    ? 48
    : D extends 48
      ? 47
      : D extends 47
        ? 46
        : D extends 46
          ? 45
          : D extends 45
            ? 44
            : D extends 44
              ? 43
              : D extends 43
                ? 42
                : D extends 42
                  ? 41
                  : D extends 41
                    ? 40
                    : D extends 40
                      ? 39
                      : D extends 39
                        ? 38
                        : D extends 38
                          ? 37
                          : D extends 37
                            ? 36
                            : D extends 36
                              ? 35
                              : D extends 35
                                ? 34
                                : D extends 34
                                  ? 33
                                  : D extends 33
                                    ? 32
                                    : D extends 32
                                      ? 31
                                      : D extends 31
                                        ? 30
                                        : D extends 30
                                          ? 29
                                          : D extends 29
                                            ? 28
                                            : D extends 28
                                              ? 27
                                              : D extends 27
                                                ? 26
                                                : D extends 26
                                                  ? 25
                                                  : D extends 25
                                                    ? 24
                                                    : D extends 24
                                                      ? 23
                                                      : D extends 23
                                                        ? 22
                                                        : D extends 22
                                                          ? 21
                                                          : D extends 21
                                                            ? 20
                                                            : D extends 20
                                                              ? 19
                                                              : D extends 19
                                                                ? 18
                                                                : D extends 18
                                                                  ? 17
                                                                  : D extends 17
                                                                    ? 16
                                                                    : D extends 16
                                                                      ? 15
                                                                      : D extends 15
                                                                        ? 14
                                                                        : D extends 14
                                                                          ? 13
                                                                          : D extends 13
                                                                            ? 12
                                                                            : D extends 12
                                                                              ? 11
                                                                              : D extends 11
                                                                                ? 10
                                                                                : D extends 10
                                                                                  ? 9
                                                                                  : D extends 9
                                                                                    ? 8
                                                                                    : D extends 8
                                                                                      ? 7
                                                                                      : D extends 7
                                                                                        ? 6
                                                                                        : D extends 6
                                                                                          ? 5
                                                                                          : D extends 5
                                                                                            ? 4
                                                                                            : D extends 4
                                                                                              ? 3
                                                                                              : D extends 3
                                                                                                ? 2
                                                                                                : D extends 2
                                                                                                  ? 1
                                                                                                  : D extends 1
                                                                                                    ? 0
                                                                                                    : never;

/**
 * Helper function to break apart T1 and check if any are equal to T2
 *
 * See {@link IsEqual}
 */
type AnyIsEqual<T1, T2> = T1 extends T2
  ? IsEqual<T1, T2> extends true
    ? true
    : never
  : never;

/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types.
 *
 * See {@link Path}
 */
type PathImpl<
  K extends string | number,
  V,
  TraversedTypes,
  Depth extends number,
> = Depth extends 0
  ? never
  : V extends Primitive | BrowserNativeObject
    ? `${K}`
    : // Check so that we don't recurse into the same type
      // by ensuring that the types are mutually assignable
      // mutually required to avoid false positives of subtypes
      true extends AnyIsEqual<TraversedTypes, V>
      ? `${K}`
      :
          | `${K}`
          | `${K}.${PathInternal<V, TraversedTypes | V, DecrementDepth<Depth>>}`;

/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link Path}
 */
type PathInternal<T, TraversedTypes, Depth extends number> =
  T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKeys<T>]-?: PathImpl<
            K & string,
            T[K],
            TraversedTypes,
            Depth
          >;
        }[TupleKeys<T>]
      : PathImpl<ArrayKey, V, TraversedTypes, Depth>
    : {
        [K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes, Depth>;
      }[keyof T];

/**
 * Type which eagerly collects all paths through a type
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string}}> = 'foo' | 'foo.bar'
 * ```
 */
// We want to explode the union type and process each individually
// so assignable types don't leak onto the stack from the base.
export type Path<T, D extends number = DefaultDepth> = T extends any
  ? PathInternal<T, T, D>
  : never;

/**
 * See {@link Path}
 */
export type FieldPath<
  TFieldValues extends FieldValues,
  D extends number = DefaultDepth,
> = Path<TFieldValues, D>;

/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types.
 *
 * See {@link ArrayPath}
 */
type ArrayPathImpl<
  K extends string | number,
  V,
  TraversedTypes,
  Depth extends number,
> = Depth extends 0
  ? never
  : V extends Primitive | BrowserNativeObject
    ? IsAny<V> extends true
      ? string
      : never
    : V extends ReadonlyArray<infer U>
      ? U extends Primitive | BrowserNativeObject
        ? IsAny<V> extends true
          ? string
          : never
        : // Check so that we don't recurse into the same type
          // by ensuring that the types are mutually assignable
          // mutually required to avoid false positives of subtypes
          true extends AnyIsEqual<TraversedTypes, V>
          ? never
          :
              | `${K}`
              | `${K}.${ArrayPathInternal<V, TraversedTypes | V, DecrementDepth<Depth>>}`
      : true extends AnyIsEqual<TraversedTypes, V>
        ? never
        : `${K}.${ArrayPathInternal<V, TraversedTypes | V, DecrementDepth<Depth>>}`;

/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link ArrayPath}
 */
type ArrayPathInternal<T, TraversedTypes, Depth extends number> =
  T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKeys<T>]-?: ArrayPathImpl<
            K & string,
            T[K],
            TraversedTypes,
            Depth
          >;
        }[TupleKeys<T>]
      : ArrayPathImpl<ArrayKey, V, TraversedTypes, Depth>
    : {
        [K in keyof T]-?: ArrayPathImpl<
          K & string,
          T[K],
          TraversedTypes,
          Depth
        >;
      }[keyof T];

/**
 * Type which eagerly collects all paths through a type which point to an array
 * type.
 * @typeParam T - type which should be introspected.
 * @example
 * ```
 * Path<{foo: {bar: string[], baz: number[]}}> = 'foo.bar' | 'foo.baz'
 * ```
 */
// We want to explode the union type and process each individually
// so assignable types don't leak onto the stack from the base.
export type ArrayPath<T, D extends number = DefaultDepth> = T extends any
  ? ArrayPathInternal<T, T, D>
  : never;
/**
 * See {@link ArrayPath}
 */
export type FieldArrayPath<
  TFieldValues extends FieldValues,
  TFieldDepth extends number = DefaultDepth,
> = ArrayPath<TFieldValues, TFieldDepth>;

/**
 * Type to evaluate the type which the given path points to.
 * @typeParam T - deeply nested type which is indexed by the path
 * @typeParam P - path into the deeply nested type
 * @example
 * ```
 * PathValue<{foo: {bar: string}}, 'foo.bar'> = string
 * PathValue<[number, string], '1'> = string
 * ```
 */
export type PathValue<
  T,
  D extends number = DefaultDepth,
  P extends Path<T, D> | ArrayPath<T, D> = Path<T, D> | ArrayPath<T, D>,
> = T extends any
  ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K], D>
        ? PathValue<T[K], D, R>
        : never
      : K extends `${ArrayKey}`
        ? T extends ReadonlyArray<infer V>
          ? PathValue<V, D, R & Path<V, D>>
          : never
        : never
    : P extends keyof T
      ? T[P]
      : P extends `${ArrayKey}`
        ? T extends ReadonlyArray<infer V>
          ? V
          : never
        : never
  : never;

/**
 * See {@link PathValue}
 */
export type FieldPathValue<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TFieldPath extends FieldPath<TFieldValues, TFieldDepth>,
> = PathValue<TFieldValues, TFieldDepth, TFieldPath>;

/**
 * See {@link PathValue}
 */
export type FieldArrayPathValue<
  TFieldValues extends FieldValues,
  TFieldArrayPath extends FieldArrayPath<TFieldValues, TFieldDepth>,
  TFieldDepth extends number = DefaultDepth,
> = PathValue<TFieldValues, TFieldDepth, TFieldArrayPath>;

/**
 * Type to evaluate the type which the given paths point to.
 * @typeParam TFieldValues - field values which are indexed by the paths
 * @typeParam TPath        - paths into the deeply nested field values
 * @example
 * ```
 * FieldPathValues<{foo: {bar: string}}, ['foo', 'foo.bar']>
 *   = [{bar: string}, string]
 * ```
 */
export type FieldPathValues<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TPath extends
    | FieldPath<TFieldValues, TFieldDepth>[]
    | readonly FieldPath<TFieldValues, TFieldDepth>[],
> = {} & {
  [K in keyof TPath]: FieldPathValue<
    TFieldValues,
    TFieldDepth,
    TPath[K] & FieldPath<TFieldValues, TFieldDepth>
  >;
};

/**
 * Type which eagerly collects all paths through a fieldType that matches a give type
 * @typeParam TFieldValues - field values which are indexed by the paths
 * @typeParam TValue       - the value you want to match into each type
 * @example
 * ```typescript
 * FieldPathByValue<{foo: {bar: number}, baz: number, bar: string}, number>
 *   = 'foo.bar' | 'baz'
 * ```
 */
export type FieldPathByValue<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TValue,
> = {
  [Key in FieldPath<TFieldValues, TFieldDepth>]: FieldPathValue<
    TFieldValues,
    TFieldDepth,
    Key
  > extends TValue
    ? Key
    : never;
}[FieldPath<TFieldValues, TFieldDepth>];
