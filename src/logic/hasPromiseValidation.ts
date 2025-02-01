import { Field, Validate } from '../types';
import isFunction from '../utils/isFunction';
import isObject from '../utils/isObject';

const ASYNC_FUNCTION = 'AsyncFunction';

export default (fieldReference: Field['_f']) =>
  !!fieldReference &&
  !!fieldReference.validate &&
  !!(
    (isFunction(fieldReference.validate) &&
      fieldReference.validate.constructor.name === ASYNC_FUNCTION) ||
    (isObject(fieldReference.validate) &&
      Object.values(fieldReference.validate).find(
        (validateFunction: Validate<unknown, unknown>) =>
          validateFunction.constructor.name === ASYNC_FUNCTION,
      ))
  );
