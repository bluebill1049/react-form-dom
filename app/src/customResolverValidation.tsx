import React from 'react';
import { useForm } from 'react-hook-form';
import Joi from 'joi';

let renderCounter = 0;

const validationSchema = Joi.object({
  firstName: Joi.any(),
  lastName: Joi.any(),
  password: Joi.any(),
  confirmPassword: Joi.any(),
  min: Joi.number().min(10).required(),
  max: Joi.number().max(20).required(),
  minDate: Joi.date().min('2019-08-01'),
  maxDate: Joi.date().max('2019-08-01'),
  minLength: Joi.string().min(2),
  minRequiredLength: Joi.string().required(),
  selectNumber: Joi.string().required(),
  pattern: Joi.string().required(),
  radio: Joi.string().required(),
  checkbox: Joi.required(),
});

const resolver = async (data: any) => {
  const { error, value: values } = validationSchema.validate(data, {
    abortEarly: false,
  });

  let customFormError;
  let confirmPasswordError;
  // first name or last name is required
  if (!values.firstName && !values.lastName) {
    customFormError = { message: 'error!', type: 'custom' };
  }
  if (values.password !== values.confirmPassword) {
    confirmPasswordError = { message: 'passwords must match!', type: 'custom' };
  }

  const errors = error
    ? error.details.reduce((previous, { message, type, path }) => {
        return {
          ...previous,
          [path[0]]: {
            message,
            type,
          },
        };
      }, {})
    : {};

  console.log(errors);

  return {
    values: error || customFormError || confirmPasswordError ? {} : values,
    errors: {
      ...errors,
      customFormError,
      confirmPassword: confirmPasswordError,
    },
  };
};

const CustomResolverValidation: React.FC = (props: any) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    password: string;
    confirmPassword: string;
    customFormError: string;
    firstName: string;
    lastName: string;
    min: string;
    max: string;
    minDate: string;
    maxDate: string;
    minLength: string;
    minRequiredLength: string;
    selectNumber: string;
    pattern: string;
    radio: string;
    checkbox: string;
    multiple: string;
    validate: string;
  }>({
    resolver,
    mode: props.match.params.mode,
  });
  const onSubmit = () => {};
  register('customFormError', {
    deps: ['firstName', 'lastName'],
    hasValidated: true,
  });

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('password')} placeholder="password" />
      {errors.password && <p>password error</p>}
      <input
        {...register('confirmPassword', { deps: ['password'] })}
        placeholder="confirmPassword"
      />
      {errors.confirmPassword && <p>confirmPassword error</p>}
      <input {...register('firstName')} placeholder="firstName" />
      {errors.firstName && <p>firstName error</p>}
      <input {...register('lastName')} placeholder="lastName" />
      {errors.lastName && <p>lastName error</p>}
      <input type="number" {...register('min')} placeholder="min" />
      {errors.min && <p>min error</p>}
      <input type="number" {...register('max')} placeholder="max" />
      {errors.max && <p>max error</p>}
      <input type="date" {...register('minDate')} placeholder="minDate" />
      {errors.minDate && <p>minDate error</p>}
      <input type="date" {...register('maxDate')} placeholder="maxDate" />
      {errors.maxDate && <p>maxDate error</p>}
      <input {...register('minLength')} placeholder="minLength" />
      {errors.minLength && <p>minLength error</p>}
      <input
        {...register('minRequiredLength')}
        placeholder="minRequiredLength"
      />
      {errors.minRequiredLength && <p>minRequiredLength error</p>}
      <select {...register('selectNumber')}>
        <option value="">Select</option>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>
      {errors.selectNumber && <p>selectNumber error</p>}
      <input {...register('pattern')} placeholder="pattern" />
      {errors.pattern && <p>pattern error</p>}
      Radio1
      <input type="radio" {...register('radio')} value="1" />
      Radio2
      <input type="radio" {...register('radio')} value="2" />
      Radio3
      <input type="radio" {...register('radio')} value="3" />
      {errors.radio && <p>radio error</p>}
      <input type="checkbox" {...register('checkbox')} />
      {errors.checkbox && <p>checkbox error</p>}
      {errors.customFormError && (
        <p id="customFormError">
          Custom Error: firstName or lastName is required
        </p>
      )}
      <button>Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default CustomResolverValidation;
