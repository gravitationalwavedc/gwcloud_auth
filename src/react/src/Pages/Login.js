import React from 'react';
import { Button } from 'react-bootstrap';
import LoginForm from '../Components/LoginForm';
import BrandColumns from '../Components/BrandColumns';
import queryString from 'query-string';
import { harnessApi } from '../index';
import gwcloudLogo from '../Assets/GWCloud-logo-blue.png';

const logoIconStyle = { height: '4rem', marginBottom: '8px' };

const Login = (props) => {
    const query = queryString.parse(location.search);
    const next = query['next'] ? `&next=${query['next']}` : '';
    const domain = harnessApi.currentProject().domain;

    return (
        <BrandColumns>
            <h1 className="login-logo pb-5 d-xs-block d-lg-none">
                <img style={logoIconStyle} src={gwcloudLogo} className="pr-3"/>
                GWCloud
            </h1>
            <h2 className="mb-4">Sign in</h2>
            <Button
                className="mb-4"
                variant="primary"
                href={`/auth/ligo/?domain=${domain}${next}`}
                block
                size="lg"
            >
                Continue with LIGO authentication
            </Button>
            <p className="pb-5">
                Interested in joining the LIGO Scientific Collaboration? <br/>
                <a href="https://www.ligo.org/about/join.php"> Apply to join</a>
            </p>
            <LoginForm {...props}/>
        </BrandColumns>
    );
};

export default Login;
