import React from 'react';
import {graphql} from 'graphql';
import {Button, Form} from 'react-bootstrap';
import {commitMutation} from 'relay-runtime';
import {Link} from 'found';
import {harnessApi} from '../index';
import queryString from 'query-string';
import {Formik} from 'formik';
import * as yup from 'yup';
import FormikInput from './FormikInput';

const loginMutation = graphql`
  mutation LoginFormMutation($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
    }
  }
`;

const validationSchema = yup.object().shape({
    username: yup
        .string()
        .label('Username')
        .required(),
    password: yup
        .string()
        .label('Password')
        .required()
});

const LoginForm = ({router, ...rest}) =>
    <Formik
        initialValues={{
            username: '',
            password: ''
        }}
        onSubmit={(values, actions) => {
            commitMutation(harnessApi.getEnvironment('auth'), {
                mutation: loginMutation,
                variables: values,
                onCompleted: (response, errors) => {
                    if (response.tokenAuth) {
                        harnessApi.setAuthTokens(response.tokenAuth.token, response.tokenAuth.refreshToken);
                        harnessApi.retryHarnessUserDetails();

                        const query = queryString.parse(location.search);
                        router.replace(query['next'] || '/');
                    } else {
                        actions.setFieldError('general', errors[0].message);
                        actions.setSubmitting(false);
                    }
                },
            });
        }}
        validationSchema={validationSchema}
    >
        {formikProps => (
            <React.Fragment>
                <h6 className="mb-4">Continue with GWCloud credentials</h6>
                {
                    formikProps.errors['general'] ?
                        <p className='text-danger'>
                            {formikProps.errors['general']}
                        </p> : null
                }
                <Form>
                    <FormikInput
                        label='Username'
                        placeholder='Username'
                        formikProps={formikProps}
                        formikKey='username'
                    />
                    <FormikInput
                        label='Password'
                        placeholder='Password'
                        formikProps={formikProps}
                        formikKey='password'
                        type='password'
                    />
                    <Button
                        className="mb-4"
                        variant="primary"
                        onClick={formikProps.handleSubmit}
                        disabled={formikProps.isSubmitting}
                        type='submit'
                    >
                        Login
                    </Button>
                </Form>
                <Link to='/auth/register/' activeClassName="selected" exact router={router} {...rest}>
                    Need a GWCloud account?
                </Link>
            </React.Fragment>
        )
        }
    </Formik>;


export default LoginForm;
