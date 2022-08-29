import React from 'react';
import { Button } from 'react-bootstrap';
import LoginForm from '../Components/LoginForm';
import BrandColumns from '../Components/BrandColumns';
import SignInTitle from '../Components/SignInTitle';
import queryString from 'query-string';
import { harnessApi } from '../index';


const Login = (props) => {
    const query = queryString.parse(location.search);
    const next = query['next'] ? `&next=${query['next']}` : '';
    const domain = harnessApi.currentProject().domain;

    return (
        <BrandColumns>
            <SignInTitle />
            <h2 className="mb-2">Sign in</h2>
            <Button
                className="mb-1"
                variant="primary"
                href={`/auth/ligo/?domain=${domain}${next}`}
                block
                size="lg"
            >
                Continue with LIGO authentication
            </Button>
            <p className="pb-4">
                Interested in joining the LIGO Scientific Collaboration? <br/>
                <a href="https://www.ligo.org/about/join.php"> Apply to join</a>
            </p>
            <LoginForm {...props}/>
        </BrandColumns>
    );
};

export default Login;
