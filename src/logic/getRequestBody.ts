import { FieldValues } from '../types';

const getQueryData = <T extends FieldValues>(data: T) =>
  new URLSearchParams(data).toString();

const getPlainData = <T extends FieldValues>(data: T) =>
  Object.entries(data)
    .map(([key, value]) => key + ':' + value)
    .join('\n');

const getFormData = <T extends FieldValues>(data: T) =>
  Object.entries(data).reduce((formData, [key, value]) => {
    formData.append(key, value);
    return formData;
  }, new FormData());

const dictionary: Record<string, any> = {
  'application/x-www-form-urlencoded': getQueryData,
  'application/json': JSON.stringify,
  'text/plain': getPlainData,
  'multipart/form-data': getFormData,
};

export default <T extends FieldValues>(
  contentType: string | undefined,
  data: T,
) => {
  const key =
    contentType && contentType in dictionary
      ? contentType
      : 'application/x-www-form-urlencoded';

  return dictionary[key](data);
};
