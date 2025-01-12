import React, { useState } from 'react';
import {
  Lens,
  RegisterOptions,
  useController,
  useFieldArray,
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

function NumberInput(props: {
  label: string;
  lens: Lens<number>;
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
          type="number"
          {...props.lens.register(props.rules ?? {})}
        />
      </label>
      {fieldState.error && <p>{field.name} error</p>}
    </>
  );
}

interface Passport {
  date: string;
}

interface Animal {
  breed: string;
  id: string;
}

interface Child {
  animals: Animal[];
  person: string;
}

type FormValues = {
  age: number;
  passport: Passport;
  name: string;
  lastName: string;
  myChildren: Child[];
};

function AnimalForm({ lens }: { lens: Lens<Animal[]> }) {
  const { append } = useFieldArray(lens);

  const addItem = () => {
    append({ breed: '', id: '' });
  };

  return (
    <>
      <h3>
        Animals{' '}
        <button type="button" onClick={addItem}>
          Add animal
        </button>
      </h3>
      {lens.map((l) => (
        <div key={l.name}>
          <StringInput label="Animal name" lens={l.focus('id')} />
          <br />
          <StringInput label="Breed" lens={l.focus('breed')} />
        </div>
      ))}
    </>
  );
}

function ChildForm({ lens }: { lens: Lens<Child[]> }) {
  const { append } = useFieldArray(lens);

  const addItem = () => {
    append({ person: '', animals: [] });
  };

  return (
    <>
      <h3>
        Children{' '}
        <button type="button" onClick={addItem}>
          Add child
        </button>
      </h3>
      {lens.map((l) => (
        <div key={l.name}>
          <StringInput label="Person" lens={l.focus('person')} />
          <AnimalForm lens={l.focus('animals')} />
        </div>
      ))}
    </>
  );
}

export default function LensesBasic() {
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
      <StringInput
        label="Name"
        lens={lens.focus('name')}
        rules={{ required: 'Name is Required' }}
      />
      <br />
      <StringInput label="Last Name" lens={lens.focus('lastName')} />
      <br />
      <NumberInput label="Age" lens={lens.focus('age')} />
      <br />
      <StringInput label="Passport date" lens={lens.focus('passport.date')} />
      <ChildForm lens={lens.focus('myChildren')} />
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
