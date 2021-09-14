import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
import getFocusFieldName from './logic/getFocusFieldName';
import mapCurrentIds from './logic/mapCurrentIds';
import mapIds from './logic/mapId';
import appendAt from './utils/append';
import convertToArrayPayload from './utils/convertToArrayPayload';
import fillEmptyArray from './utils/fillEmptyArray';
import get from './utils/get';
import insertAt from './utils/insert';
import moveArrayAt from './utils/move';
import omitKeys from './utils/omitKeys';
import prependAt from './utils/prepend';
import removeArrayAt from './utils/remove';
import set from './utils/set';
import swapArrayAt from './utils/swap';
import updateAt from './utils/update';
import {
  FieldArray,
  FieldArrayMethodProps,
  FieldArrayPath,
  FieldArrayWithId,
  FieldPath,
  FieldValues,
  UseFieldArrayProps,
  UseFieldArrayReturn,
} from './types';
import { useFormContext } from './useFormContext';

export const useFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> => {
  const methods = useFormContext();
  const {
    control = methods.control,
    name,
    keyName = 'id' as TKeyName,
    shouldUnregister,
  } = props;
  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(mapIds(control._getFieldArrayValue(name), keyName));
  const _fieldIds = React.useRef(fields);

  _fieldIds.current = fields;
  control._names.array.add(name);

  const updateValues = React.useCallback(
    <
      T extends Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    >(
      updatedFieldArrayValuesWithKey: T,
    ) => {
      const updatedFieldArrayValues = omitKeys(
        updatedFieldArrayValuesWithKey,
        keyName,
      );
      set(control._formValues, name, updatedFieldArrayValues);
      setFields(updatedFieldArrayValuesWithKey);
      return updatedFieldArrayValues;
    },
    [control, name, keyName],
  );

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(value);
    const updatedFieldArrayValuesWithKey = appendAt(
      mapCurrentIds(control._getFieldArrayValue(name), _fieldIds, keyName),
      mapIds(appendValue, keyName),
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      keyName,
      name,
      appendAt,
      {
        argA: fillEmptyArray(value),
      },
      fieldArrayValues,
    );

    control._names.focus = getFocusFieldName(
      name,
      updatedFieldArrayValuesWithKey.length - appendValue.length,
      options,
    );
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const updatedFieldArrayValuesWithKey = prependAt(
      mapCurrentIds(control._getFieldArrayValue(name), _fieldIds, keyName),
      mapIds(convertToArrayPayload(value), keyName),
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      keyName,
      name,
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      fieldArrayValues,
    );

    control._names.focus = getFocusFieldName(name, 0, options);
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValuesWithKey: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(
      mapCurrentIds(control._getFieldArrayValue(name), _fieldIds, keyName),
      index,
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      keyName,
      name,
      removeArrayAt,
      {
        argA: index,
      },
      fieldArrayValues,
    );
  };

  const insert = (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const updatedFieldArrayValuesWithKey = insertAt(
      mapCurrentIds(control._getFieldArrayValue(name), _fieldIds, keyName),
      index,
      mapIds(convertToArrayPayload(value), keyName),
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      keyName,
      name,
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      fieldArrayValues,
    );

    control._names.focus = getFocusFieldName(name, index, options);
  };

  const swap = (indexA: number, indexB: number) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArrayValue(name),
      _fieldIds,
      keyName,
    );
    swapArrayAt(updatedFieldArrayValuesWithKey, indexA, indexB);
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      keyName,
      name,
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      fieldArrayValues,
      false,
    );
  };

  const move = (from: number, to: number) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArrayValue(name),
      _fieldIds,
      keyName,
    );
    moveArrayAt(updatedFieldArrayValuesWithKey, from, to);
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      keyName,
      name,
      moveArrayAt,
      {
        argA: from,
        argB: to,
      },
      fieldArrayValues,
      false,
    );
  };

  const update = (
    index: number,
    value: Partial<FieldArray<TFieldValues, TFieldArrayName>>,
  ) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArrayValue(name),
      _fieldIds,
      keyName,
    );
    const updatedFieldArrayValues = updateAt(
      updatedFieldArrayValuesWithKey,
      index,
      value,
    );
    _fieldIds.current = mapIds(updatedFieldArrayValues, keyName);
    const fieldArrayValues = updateValues(_fieldIds.current);
    control._updateFieldArray(
      keyName,
      name,
      updateAt,
      {
        argA: index,
        argB: value,
      },
      fieldArrayValues,
      true,
      false,
    );
  };

  const replace = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  ) => {
    const updatedFieldArrayValuesWithKey: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = mapIds(convertToArrayPayload(value), keyName);
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      keyName,
      name,
      () => updatedFieldArrayValuesWithKey,
      {},
      fieldArrayValues,
      true,
      false,
    );
  };

  React.useEffect(() => {
    control._isInAction = false;

    if (control._names.watchAll) {
      control._subjects.state.next({});
    } else {
      for (const watchField of control._names.watch) {
        if (name.startsWith(watchField)) {
          control._subjects.state.next({});
          break;
        }
      }
    }

    control._subjects.watch.next({
      name,
      values: control._formValues,
    });

    control._names.focus &&
      focusFieldBy(control._fields, (key: string) =>
        key.startsWith(control._names.focus),
      );

    control._names.focus = '';

    control._proxyFormState.isValid && control._updateValid();
  }, [fields, name, control, keyName]);

  React.useEffect(() => {
    const fieldArraySubscription = control._subjects.array.subscribe({
      next({ values, name: fieldArrayName }) {
        if (fieldArrayName === name || !fieldArrayName) {
          setFields(mapIds(get(values, name), keyName));
        }
      },
    });

    !get(control._formValues, name) && set(control._formValues, name, []);

    return () => {
      fieldArraySubscription.unsubscribe();
      if (control._shouldUnregister || shouldUnregister) {
        control.unregister(name as FieldPath<TFieldValues>);
      }
    };
  }, [name, control, keyName, shouldUnregister]);

  return {
    swap: React.useCallback(swap, [updateValues, name, control, keyName]),
    move: React.useCallback(move, [updateValues, name, control, keyName]),
    prepend: React.useCallback(prepend, [updateValues, name, control, keyName]),
    append: React.useCallback(append, [updateValues, name, control, keyName]),
    remove: React.useCallback(remove, [updateValues, name, control, keyName]),
    insert: React.useCallback(insert, [updateValues, name, control, keyName]),
    update: React.useCallback(update, [updateValues, name, control, keyName]),
    replace: React.useCallback(replace, [updateValues, name, control, keyName]),
    fields: fields as FieldArrayWithId<
      TFieldValues,
      TFieldArrayName,
      TKeyName
    >[],
  };
};
