import React from "react";
import {Grid, Header, Image, Message} from "semantic-ui-react";
import queryString from 'query-string'
import Link from 'found/lib/Link';
import {commitMutation} from "relay-runtime";
import {harnessApi} from "../index";
import {graphql} from "graphql";
import * as Enumerable from "linq";

class Verify extends React.Component {
    constructor() {
        super();

        const query = queryString.parse(location.search);

        this.state = {
            verified: false,
            error: null
        };

        if (!query['code']) {
            this.state = {
                ...this.state,
                error: "Invalid request"
            }
        } else {
            this.verify(query['code'])
        }
    }

    verify(code) {
        commitMutation(harnessApi.getEnvironment("auth"), {
            mutation: graphql`mutation VerifyMutation($input: VerifyInput!)
                {
                  verify(input: $input) 
                  {
                    result {
                      result
                      message
                    }
                  }
                }`,
            variables: {
                input: {
                    code: code,
                }
            },
            onCompleted: (response, errors) => {
                if (response.verify.result.result)
                    this.setState({
                        ...this.state,
                        verified: true
                    });
                else
                    this.setState({
                        ...this.state,
                        error: errors.length ? errors[0].message : response.verify.result.error
                    })
            },
        });
    }

    render() {
        return (
            <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h2' color='teal' textAlign='center'>
                        <Image src='/logo.png'/> Account Verification
                    </Header>
                    {
                        this.state.error ?
                            (
                                <Message error>
                                    {this.state.error}
                                </Message>
                            ) :
                            this.state.verified ?
                                (
                                    <Message success>
                                        Account successfully verified. Please <Link to='/auth/' activeClassName="selected" exact {...this.props}>Login</Link>
                                    </Message>
                                ) : (
                                    <Message>
                                        Verifying your account, please wait...
                                    </Message>
                                )
                    }
                </Grid.Column>
            </Grid>
        )
    }
}

export default Verify;