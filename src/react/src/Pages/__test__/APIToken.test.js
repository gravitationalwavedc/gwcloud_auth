import { createMockEnvironment } from 'relay-test-utils';
import { setHarnessApi } from '../../index';
import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { QueryRenderer, graphql } from 'react-relay';
import { MockPayloadGenerator } from 'relay-test-utils';
import { render, waitFor } from '@testing-library/react';
import APIToken from '../APIToken';


describe('registerTests', () => {

    const TestRenderer = () => (
        <QueryRenderer
            environment={environment}
            query={graphql`
            query APITokenTestQuery($app: String!) @relay_test_operation {
              ...APIToken_data @arguments(app: $app)
            }
          `}
            variables={{
                app: "Bilby"
            }}
            render={({ error, props }) => {
                if (props) {
                    return <APIToken data={props} router={router}/>;
                } else if (error) {
                    return error.message;
                }
                return 'Loading...';
            }}
        />
    );

    const testToken = "TestTokenHasNoMeaning"

    const mockAPITokenReturn = {
        String() {
            return testToken
        },
    };

    it('API token page renders correctly', async () => {
        expect.hasAssertions();
        const { asFragment } = render(<TestRenderer />);
        await waitFor(() => environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, mockAPITokenReturn)
        ));
        expect(asFragment(<TestRenderer />)).toMatchSnapshot();
    });

    it('token is displayed in page', async () => {
        expect.hasAssertions();
        const { getByText } = render(<TestRenderer />);
        await waitFor(() => environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, mockAPITokenReturn)
        ));
        const token = getByText(testToken)
        expect(token).toBeInTheDocument();
    });
});




