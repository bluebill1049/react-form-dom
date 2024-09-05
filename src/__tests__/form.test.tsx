import 'whatwg-fetch';

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { Form } from '../form';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

const server = setupServer(
  http.post('/success', () => {
    return HttpResponse.json({ message: 'ok' });
  }),
  http.post('/error', () => {
    return new Response(null, {
      status: 500,
    });
  }),
  http.post('/status', () => {
    return new HttpResponse(null, { status: 201 });
  }),
  http.post('/get', () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post('/json', ({ request }) => {
    if (request.headers.get('content-type') === 'application/json') {
      return new HttpResponse(null, { status: 200 });
    }

    return new HttpResponse(null, { status: 500 });
  }),
);

describe('Form', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should support render with both form tag and headless', () => {
    const WithContext = () => {
      return (
        <>
          <Form />
          <Form
            render={() => {
              return null;
            }}
          />
        </>
      );
    };

    const App = () => {
      const methods = useForm();
      return (
        <div>
          <Form control={methods.control}>
            <input />
          </Form>
          <Form
            control={methods.control}
            render={() => {
              return null;
            }}
          />

          <FormProvider {...methods}>
            <WithContext />
          </FormProvider>
        </div>
      );
    };

    render(<App />);
  });

  it('should handle success request callback', async () => {
    const onSubmit = jest.fn();
    const onError = jest.fn();

    const App = () => {
      const [message, setMessage] = React.useState('');
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/success'}
          onSubmit={({ data }) => {
            data;
            onSubmit();
          }}
          control={control}
          onError={onError}
          onSuccess={async ({ response }) => {
            if (response) {
              const data: { message: string } = await response.json();
              setMessage(data.message);
            }
          }}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
          <p>{message}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toBeCalled();
      expect(onError).not.toBeCalled();
      screen.getByText('submitSuccessful');
      screen.getByText('ok');
    });
  });

  it('should handle error request callback', async () => {
    const onSubmit = jest.fn();
    const onSuccess = jest.fn();

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful, errors },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/error'}
          onSubmit={onSubmit}
          control={control}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
          {errors.root?.server && 'This is a server error'}
          <p>{errors.root?.server?.type}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toBeCalled();
      expect(onSuccess).not.toBeCalled();
      screen.getByText('This is a server error');
      screen.getByText('500');
      screen.getByText('submitFailed');
    });
  });

  it('should validate custom status code', async () => {
    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/status'}
          control={control}
          validateStatus={(status) => status === 200}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitFailed');
    });
  });

  it('should support other request type', async () => {
    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form encType={'application/json'} action={'/get'} control={control}>
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitSuccessful');
    });
  });

  it('should support render props for react native', async () => {
    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          control={control}
          render={({ submit }) => {
            return (
              <>
                <button onClick={() => submit()}>Submit</button>
                <p>
                  {isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}
                </p>
              </>
            );
          }}
        />
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitSuccessful');
    });
  });

  it('should support fetcher prop with external request', async () => {
    const fetcher = jest.fn();
    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          control={control}
          onSubmit={async () => {
            await fetcher();
          }}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitSuccessful');

      expect(fetcher).toBeCalled();
    });
  });

  it('should include application/json header with encType supplied', async () => {
    const onSuccess = jest.fn();
    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/json'}
          control={control}
          onSuccess={onSuccess}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSuccess).toBeCalled();
    });
  });
});
