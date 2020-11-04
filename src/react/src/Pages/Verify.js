import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import Link from 'found/lib/Link';
import { commitMutation } from 'relay-runtime';
import { harnessApi } from '../index';
import { graphql } from 'graphql';
import BrandColumns from '../Components/BrandColumns';
import ErrorMessage from '../Components/ErrorMessage';
import { Button } from 'react-bootstrap';
import { HiOutlineCheckCircle } from 'react-icons/hi';


const Verify = (props) => {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);

    const query = queryString.parse(location.search);

    useEffect(() => {
        if (!query['code']) {
            setError(
                <ErrorMessage
                    heading="Invalid token"
                />);
        } else {
            commitMutation(harnessApi.getEnvironment('auth'), {
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
                        code: query['code'],
                    }
                },
                onCompleted: (response, errors) => {
                    if (response.verify.result.result) {
                        setVerified(true);
                    } else {
                        setError(errors.length ? <ErrorMessage heading={errors[0].message} /> 
                            : <ErrorMessage heading={response.verify.result.error} />);
                    }
                },
            });
        }
    }, []);

    const content = () => {
        if (error) {
            return <React.Fragment>{error}</React.Fragment>;
        }

        if (!verified) {
            return <h2>Verifying your account, please wait...</h2>;
        }

        return ( 
            <React.Fragment>
                <h2 className="mb-4">
                    <HiOutlineCheckCircle className="text-success mb-2 mr-1"/>
                    Account successfully verified.
                </h2>
                      
                <Link 
                    as={Button} 
                    size="lg" 
                    block 
                    variant="primary" 
                    to='/auth/' 
                    activeClassName="selected" 
                    exact {...props}>
                            Continue to sign in
                </Link>
            </React.Fragment>
        );
    };

    return (
        <BrandColumns>
            { content() }
        </BrandColumns>
    );
};

export default Verify;
