import { Field, FieldRefs, InternalFieldName } from '../types';
import { get } from '../utils';
import isKey from '../utils/isKey';
import set from '../utils/set';

export default function getFields(
  fieldsNames: Partial<Record<InternalFieldName, string>>,
  fieldsRefs: FieldRefs,
) {
  const currentFields: Record<InternalFieldName, Field['_f']> = {};

  for (const name in fieldsNames) {
    const field = get(fieldsRefs, name) as Field | undefined;

    if (field) {
      !isKey(name)
        ? set(currentFields, name, field._f)
        : (currentFields[name] = field._f);
    }
  }

  return currentFields;
}
