import { debounce } from '@material-ui/core';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

export function debouncePromise<F extends (...args: any[]) => Promise<any>>(
  func: F,
  wait?: number,
) {
  const debounced = debounce(
    (resolve: any, reject: any, args: Parameters<F>) => {
      func(...args)
        .then(resolve)
        .catch(reject);
    },
    wait,
  );

  const promise = (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      debounced(resolve, reject, args);
    }) as ReturnType<F>;

  return promise;
}

function wait() {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(null);
    }, 2000),
  );
}

const IsValidBreaksValidation: React.FC = () => {
  const [params] = useSearchParams();

  const { register, formState } = useForm({
    mode: 'onChange',
    defaultValues: { password: '' },
  });

  const { errors } = formState;

  if (params.get('useIsValid')) {
    // this should be find for testing
    const { isValid } = formState;
  }

  return (
    <form>
      <input
        type="text"
        {...register('password', {
          validate: debouncePromise(async (value) => {
            await wait();
            if (value.length < 5) {
              return 'error';
            }
            return undefined;
          }, 1000),
        })}
      />
      <p>{errors.password?.message}</p>
    </form>
  );
};

export default IsValidBreaksValidation;
