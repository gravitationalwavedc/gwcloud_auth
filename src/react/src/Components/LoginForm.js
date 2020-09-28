import React, { useState } from "react";
import {graphql} from "graphql";
import { Button, Form } from "react-bootstrap";
import {commitMutation} from "relay-runtime";
import { Link } from "found";
import {harnessApi} from "../index";
import queryString from "query-string";
import ErrorList from "./ErrorList";


const loginMutation = graphql`
  mutation LoginFormMutation($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
    }
  }
`;


const LoginForm = ({router, ...rest}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState('');

  const login = () => {
      const variables = {
              username: username,
              password: password,
      };

      commitMutation(harnessApi.getEnvironment("auth"), {
          mutation: loginMutation,
          variables: variables,
          onCompleted: (response, errors) => {
              if (response.tokenAuth) {
                  harnessApi.setAuthTokens(response.tokenAuth.token, response.tokenAuth.refreshToken);
                  harnessApi.retryHarnessUserDetails();

                  const query = queryString.parse(location.search);
                  router.replace(query['next'] || "/")
              } else {
                  setFormErrors(<ErrorList errors={errors}/>);
              };
          },
      });
  }

  return (
    <Form size='large'>
      <hr/>
      <h6 className="mb-4">Continue with GWCloud credientials</h6>
      {formErrors}
      <Form.Group controlId="username"> 
        <Form.Label>Username</Form.Label>
        <Form.Control
          placeholder='Username' 
          value={username}
          onChange={({target}) => setUsername(target.value)}
          error={!!formErrors}
        />
      </Form.Group>
      <Form.Group controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
            placeholder='Password'
            type='password'
            value={password}
            onChange={({target}) => setPassword(target.value)}
            error={!!formErrors}
        />
      </Form.Group>
      <Button className="mb-4" variant="primary" onClick={() => login()}>
          Login
      </Button>
      <p>
        <Link to='/auth/register/' activeClassName="selected" exact router={router} {...rest}>Need a GWCloud account?</Link>
      </p>
    </Form>
  )
};

export default LoginForm;
