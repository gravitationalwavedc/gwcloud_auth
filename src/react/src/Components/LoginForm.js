import React from 'react';
import { graphql } from 'graphql';
import { Button, Form } from 'react-bootstrap';
import { commitMutation } from 'relay-runtime';
import { Link } from 'found';
import { harnessApi } from '../index';
import queryString from 'query-string';
import { Formik } from 'formik';
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

const LoginForm = ({ router, ...rest }) => {

    const project = harnessApi.currentProject().name;

    return (
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
                    <h5 className="mb-4 mt-3">Continue with your {project} account</h5>
                    {
                        formikProps.errors['general'] ?
                            <p className='text-danger'>
                                {formikProps.errors['general']}
                            </p> : null
                    }
                    <Form>
                        <FormikInput
                            label='Username'
                            formikProps={formikProps}
                            formikKey='username'
                        />
                        <FormikInput
                            label='Password'
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
                            size="lg"
                            block
                        >
                        Log in
                        </Button>
                    </Form>
                    <Link to='/auth/register/' activeClassName="selected" exact router={router} {...rest}>
                    Need a {project} account?
                    </Link>
                </React.Fragment>
            )
            }
        </Formik>);
};


export default LoginForm;
