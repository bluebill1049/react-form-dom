import { DefaultDepth } from './path/eager';
import { FieldValues } from './fields';
import { Control } from './form';
import { FieldArrayPath, FieldArrayPathValue } from './path';
import { RegisterOptions, Validate } from './validator';

export type UseFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
  TKeyName extends string = 'id',
> = {
  name: TFieldArrayName;
  keyName?: TKeyName;
  control?: Control<TFieldValues, TFieldDepth>;
  rules?: {
    validate?:
      | Validate<
          FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>[],
          TFieldValues
        >
      | Record<
          string,
          Validate<
            FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>[],
            TFieldValues
          >
        >;
  } & Pick<
    RegisterOptions<TFieldValues>,
    'maxLength' | 'minLength' | 'required'
  >;
  shouldUnregister?: boolean;
};

/**
 * `useFieldArray` returned `fields` with unique id
 */
export type FieldArrayWithId<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
  TKeyName extends string = 'id',
> = FieldArray<TFieldValues, TFieldDepth, TFieldArrayName> &
  Record<TKeyName, string>;

export type FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
> =
  FieldArrayPathValue<TFieldValues, TFieldArrayName, TFieldDepth> extends
    | ReadonlyArray<infer U>
    | null
    | undefined
    ? U
    : never;

/**
 * `useFieldArray` focus option, ability to toggle focus on and off with `shouldFocus` and setting focus by either field index or name.
 */
export type FieldArrayMethodProps = {
  shouldFocus?: boolean;
  focusIndex?: number;
  focusName?: string;
};

/**
 * Swap field array by supplying from and to index
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param indexA - from index
 * @param indexB - to index
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => swap(0, 1)}>swap</button>
 * ```
 */
export type UseFieldArraySwap = (indexA: number, indexB: number) => void;

/**
 * Move field array by supplying from and to index
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param indexA - from index
 * @param indexB - to index
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => move(0, 1)}>swap</button>
 * ```
 */
export type UseFieldArrayMove = (indexA: number, indexB: number) => void;

/**
 * Prepend field/fields to the start of the fields and optionally focus. The input value will be registered during this action.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param value - prepend items or items
 * @param options - focus options
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => prepend({ name: "data" })}>Prepend</button>
 * <button type="button" onClick={() => prepend({ name: "data" }, { shouldFocus: false })}>Prepend</button>
 * <button
 *   type="button"
 *   onClick={() => prepend([{ name: "data" }, { name: "data" }])}
 * >
 *   Prepend
 * </button>
 * ```
 */
export type UseFieldArrayPrepend<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
> = (
  value:
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>[],
  options?: FieldArrayMethodProps,
) => void;

/**
 * Append field/fields to the end of your fields and focus. The input value will be registered during this action.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param value - append items or items.
 * @param options - focus options
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => append({ name: "data" })}>Append</button>
 * <button type="button" onClick={() => append({ name: "data" }, { shouldFocus: false })}>Append</button>
 * <button
 *   type="button"
 *   onClick={() => append([{ name: "data" }, { name: "data" }])}
 * >
 *   Append
 * </button>
 * ```
 */
export type UseFieldArrayAppend<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
> = (
  value:
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>[],
  options?: FieldArrayMethodProps,
) => void;

/**
 * Remove field/fields at particular position.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param index - index to remove at, or remove all when no index provided.
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => remove(0)}>Remove</button>
 * <button
 *   type="button"
 *   onClick={() => remove()}
 * >
 *   Remove all
 * </button>
 * ```
 */
export type UseFieldArrayRemove = (index?: number | number[]) => void;

/**
 * Insert field/fields at particular position and focus.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param index - insert position
 * @param value - insert field or fields
 * @param options - focus options
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => insert(1, { name: "data" })}>Insert</button>
 * <button type="button" onClick={() => insert(1, { name: "data" }, { shouldFocus: false })}>Insert</button>
 * <button
 *   type="button"
 *   onClick={() => insert(1, [{ name: "data" }, { name: "data" }])}
 * >
 *   Insert
 * </button>
 * ```
 */
export type UseFieldArrayInsert<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
> = (
  index: number,
  value:
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>[],
  options?: FieldArrayMethodProps,
) => void;

/**
 * Update field/fields at particular position.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param index - insert position
 * @param value - insert field or fields
 *
 * @example
 * ```tsx
 * <button type="button" onClick={() => update(1, { name: "data" })}>Update</button>
 * <button
 *   type="button"
 *   onClick={() => update(1, [{ name: "data" }, { name: "data" }])}
 * >
 *   Update
 * </button>
 * ```
 */
export type UseFieldArrayUpdate<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
> = (
  index: number,
  value: FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>,
) => void;

/**
 * Replace the entire field array values.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/calc-i231d)
 *
 * @param value - the entire field values.
 *
 * @example
 * ```tsx
 * <button
 *   type="button"
 *   onClick={() => replace([{ name: "data" }, { name: "data" }])}
 * >
 *   Replace
 * </button>
 * ```
 */
export type UseFieldArrayReplace<
  TFieldValues extends FieldValues,
  TFieldDepth extends number,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
> = (
  value:
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>
    | FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>[],
) => void;

export type UseFieldArrayReturn<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
  TKeyName extends string = 'id',
> = {
  swap: UseFieldArraySwap;
  move: UseFieldArrayMove;
  prepend: UseFieldArrayPrepend<TFieldValues, TFieldDepth, TFieldArrayName>;
  append: UseFieldArrayAppend<TFieldValues, TFieldDepth, TFieldArrayName>;
  remove: UseFieldArrayRemove;
  insert: UseFieldArrayInsert<TFieldValues, TFieldDepth, TFieldArrayName>;
  update: UseFieldArrayUpdate<TFieldValues, TFieldDepth, TFieldArrayName>;
  replace: UseFieldArrayReplace<TFieldValues, TFieldDepth, TFieldArrayName>;
  fields: FieldArrayWithId<
    TFieldValues,
    TFieldDepth,
    TFieldArrayName,
    TKeyName
  >[];
};
