import React from 'react'
import {Button, Container, Form, FormInput, Grid, Header, Image, List, Message, Segment} from "semantic-ui-react";
import Link from 'found/lib/Link';
import {commitMutation} from "relay-runtime";
import {harnessApi} from "../index";
import {graphql} from "graphql";
import * as Enumerable from "linq";
import queryString from "query-string";

class Login extends React.Component {
    constructor() {
        super();

        this.state = {
            username: "",
            password: ""
        }
    }

    login() {
        commitMutation(harnessApi.getEnvironment("auth"), {
            mutation: graphql`mutation LoginAuthMutation($username: String!, $password: String!) {
              tokenAuth(username: $username, password: $password) {
                token
                refreshToken
              }
            }`,
            variables: {
                username: this.state.username,
                password: this.state.password,
            },
            onCompleted: (response, errors) => {
                if (response.tokenAuth) {
                    harnessApi.setAuthTokens(response.tokenAuth.token, response.tokenAuth.refreshToken);
                    harnessApi.retryHarnessUserDetails();

                    const query = queryString.parse(location.search);
                    this.props.router.replace(query['next'] || "/")
                }
                else
                    this.setState({
                        ...this.state,
                        errors: errors
                    })
            },
        });
    }

    render() {
        return (
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as='h2' color='teal' textAlign='center'>
                        <Image src='/logo.png' /> Log-in to your account
                    </Header>
                    <Message error>
                        Do you have a LIGO.org account? <a href='/auth/ligo/'>Login via LIGO.org</a>
                    </Message>
                    <Form size='large'>
                        <Segment stacked>
                            {this.state.errors ? Enumerable.from(this.state.errors).select((e, i) => (
                                    <List bulleted floated="left" key={i}>
                                            <List.Item>{e.message}</List.Item>
                                    </List>
                                )
                            ).toArray() : null}
                            <Form.Input fluid icon='user' iconPosition='left' placeholder='Username' value={this.state.username}
                            onChange={(e, c) => this.setState({
                                ...this.state,
                                username: c.value
                            })}
                            error={!!this.state.errors}/>
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Password'
                                type='password'
                                value={this.state.password}
                                onChange={(e, c) => this.setState({
                                    ...this.state,
                                    password: c.value
                                })}
                                error={!!this.state.errors}
                            />

                            <Button color='teal' fluid size='large' onClick={() => this.login()}>
                                Login
                            </Button>
                        </Segment>
                    </Form>
                    <Message>
                        New to GW Cloud? <Link to='/auth/register/' activeClassName="selected" exact {...this.props}>Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login;