import React, { useState } from 'react';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay';
import { harnessApi } from '../index';
import { CopyButton, SpoilerButton, CheckButton } from '../Components/CustomButtons';
import { Button, Grid, Container, Dropdown, DropdownButton, Row, Table } from 'react-bootstrap';
import { isEqual, without } from 'lodash';


const APIToken = (props) => {

    const allApps = ['Bilby']
    const [tokens, setTokens] = useState(props.data.apiTokens);

    const usedApps = tokens.map(token => token.app)
    const allAppsUsed = isEqual(allApps.sort(), usedApps.sort())

    const createToken = (app) => {
        commitMutation(harnessApi.getEnvironment('auth'), {
            mutation: graphql`mutation APITokenCreateMutation($input: CreateAPITokenInput!){
                createApiToken(input: $input) {
                  result {
                      app
                      token
                  }
                }
              }`,
            variables: {
                input: {
                    app: app
                }
            },
            onCompleted: (response, errors) => {
                if (errors) {
                    console.log(errors);
                } else {
                    setTokens(
                        [
                            ...tokens,
                            response.createApiToken.result
                        ]
                    );
                }
            },
        });
    };
    
    const revokeToken = (app) => {
        commitMutation(harnessApi.getEnvironment('auth'), {
            mutation: graphql`mutation APITokenRevokeMutation($input: RevokeAPITokenInput!){
                revokeApiToken(input: $input) {
                  result
                }
              }`,
            variables: {
                input: {
                    app: app,
                }
            },
            onCompleted: (response, errors) => {
                if (errors) {
                    console.log(errors);
                } else {
                    setTokens(
                        tokens.filter(token => token.app != app)
                    );
                }
            },
        });
    };

    return (
        <Container>
            <h1 className="pt-5 mb-4">
                API Tokens
                <span className='float-right'>
                    <DropdownButton
                        disabled={allAppsUsed}
                        title='Create Token'
                        variant='primary'
                    >
                        {
                            allApps.map((app, i) => (
                                <Dropdown.Item
                                    key={i}
                                    hidden={usedApps.includes(app)}
                                    onSelect={() => createToken(app)}
                                >
                                    {app}
                                </Dropdown.Item>
                            ))
                        }
                    </DropdownButton>
                </span>
            </h1>
            <Table as={Grid}>
                <thead>
                    <tr>
                        <th>App</th>
                        <th>Token</th>
                        <th className='text-center'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tokens.map((token, i) => (
                            <tr key={i}>
                                <td className='align-middle'>{token.app}</td>
                                <td className='align-middle'><SpoilerButton content='Click to show token...' hiddenContent={token.token}/></td>
                                <td className='align-middle text-center'>
                                    <CopyButton variant="text btn-link" content='Copy Token' copyContent={token.token}/>
                                    <CheckButton
                                        variant="text text-danger"
                                        content='Revoke Token'
                                        cancelContent='Revoke token?'
                                        onClick={() => revokeToken(token.app)}
                                    />
                                    {/* <Button variant="text text-danger" onClick={() => revokeToken(token.app)}>Revoke Token</Button> */}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </Container>
    );
};

export default createFragmentContainer(APIToken,
    {
        data: graphql`
            fragment APIToken_data on Query {
                apiTokens {
                    app
                    token
                }
            }
        `
    }
);
