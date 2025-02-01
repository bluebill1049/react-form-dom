import { FieldPath, FieldValues } from '../types';

import isKey from './isKey';
import isObject from './isObject';
import stringToPath from './stringToPath';

export default (
  object: FieldValues,
  path: FieldPath<FieldValues>,
  value?: unknown,
) => {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;

  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;

    if (index !== lastIndex) {
      const objValue = object[key];
      newValue =
        isObject(objValue) || Array.isArray(objValue) || (tempPath.length == 1 && typeof key === "string")
          ? objValue
          : !isNaN(+tempPath[index + 1])
            ? []
            : {};
    }

    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return;
    }

    object[key] = newValue;
    object = object[key];
  }
};
