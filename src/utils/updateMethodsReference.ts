import React from 'react';

import { FieldValues, UseFormReturn } from '../types';

export function updateMethodsReference<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  _formControl: React.MutableRefObject<
    UseFormReturn<TFieldValues, TContext, TTransformedValues> | undefined
  >,
) {
  if (_formControl.current) {
    _formControl.current.getFieldState =
      _formControl.current.getFieldState.bind({});
    _formControl.current.watch = _formControl.current.watch.bind({});
    _formControl.current.getValues = _formControl.current.getValues.bind({});
    _formControl.current.register = _formControl.current.register.bind({});
    _formControl.current = { ..._formControl.current };
  }
}
