import React, { useState } from 'react';
import {
  Lens,
  RegisterOptions,
  useController,
  useForm,
  useLens,
} from 'react-hook-form';

function StringInput(props: {
  label: string;
  lens: Lens<string>;
  rules?: Omit<
    RegisterOptions,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
}) {
  const { field, fieldState } = useController({
    ...props.lens,
    rules: props.rules,
  });

  return (
    <>
      <label>
        {props.label}
        <input
          placeholder={field.name}
          {...props.lens.register(props.rules ?? {})}
        />
      </label>
      {fieldState.error && <p>{field.name} error</p>}
    </>
  );
}

function PersonForm({
  lens,
}: {
  lens: Lens<{
    name: string;
    surname: string;
  }>;
}) {
  return (
    <>
      <StringInput label="Name" lens={lens.focus('name')} />
      <StringInput label="Surname" lens={lens.focus('surname')} />
    </>
  );
}

export type FormValues = {
  firstName: string;
  lastName: string;
};

export default function LensesTransform() {
  const [data, setData] = React.useState({});
  const { handleSubmit, control, reset } = useForm<FormValues>();

  const lens = useLens({ control });

  const [onInvalidCalledTimes, setOnInvalidCalledTimes] = useState(0);
  const onInvalid = () => setOnInvalidCalledTimes((prevCount) => prevCount + 1);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        setData(data);
      }, onInvalid)}
    >
      <PersonForm
        lens={lens.transform((l) => ({
          name: l.focus('firstName'),
          surname: l.focus('lastName'),
        }))}
      />
      <br />

      <button id="submit">Submit</button>
      <button type="button" id="resetForm" onClick={() => reset()}>
        Reset
      </button>
      <div id="on-invalid-called-times">
        onInvalid callback called {onInvalidCalledTimes} times
      </div>
      <pre>{JSON.stringify(data)}</pre>
    </form>
  );
}
