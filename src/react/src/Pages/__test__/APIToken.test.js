import React from 'react';
import { describe, expect, it } from '@jest/globals';
import { QueryRenderer, graphql } from 'react-relay';
import { MockPayloadGenerator } from 'relay-test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import APIToken from '../APIToken';
import { setHarnessApi } from '../..';


describe('api token page', () => {
    setHarnessApi({
        currentProject: () => ({
            domain: 'testapp',
            name: 'TestApp'
        })
    });

    const TestRenderer = () => (
        <QueryRenderer
            environment={environment}
            query={graphql`
                query APITokenTestQuery ($app: String!) @relay_test_operation {
                    ...APIToken_data @arguments(app: $app)
                }
            `}
            render={({ error, props }) => {
                if (props) {
                    return <APIToken data={props} router={router}/>;
                } else if (error) {
                    return error.message;
                }
                return 'Loading...';
            }}
            variables={{
                app: 'testapp'
            }}
        />
    );

    const testToken = 'TestTokenHasNoMeaning';

    const mockAPITokenReturn = {
        String() {
            return testToken;
        },
    };

    it('renders without token', async () => {
        expect.hasAssertions();
        render(<TestRenderer />);
        await waitFor(() => environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
                String() {
                    return null;
                }
            })
        ));
        expect(screen.getByText('TestApp API Token')).toBeInTheDocument();
        expect(screen.getByText('Create Token')).toBeInTheDocument();
    });
    
    it('renders with token', async () => {
        expect.hasAssertions();
        render(<TestRenderer />);
        await waitFor(() => environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, mockAPITokenReturn)
        ));
        expect(screen.getByText('TestApp API Token')).toBeInTheDocument();
        expect(screen.getByText('Click to show token...')).toBeInTheDocument();
        expect(screen.getByText('Copy Token')).toBeInTheDocument();
        expect(screen.getByText('Revoke Token')).toBeInTheDocument();
    });

    it('has token initially hidden', async () => {
        expect.hasAssertions();
        render(<TestRenderer />);
        await waitFor(() => environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, mockAPITokenReturn)
        ));
        expect(screen.queryByText(testToken)).not.toBeInTheDocument();
    });
    
    it('has token displayed when clicked', async () => {
        expect.hasAssertions();
        const user = userEvent.setup();
        render(<TestRenderer />);
        await waitFor(() => environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, mockAPITokenReturn)
        ));
        await waitFor(() => user.click(screen.getByText('Click to show token...')));
        expect(screen.getByText(testToken)).toBeInTheDocument();
    });
});
