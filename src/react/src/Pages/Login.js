import React from 'react';
import { Button } from 'react-bootstrap';
import LoginForm from '../Components/LoginForm';
import BrandColumns from '../Components/BrandColumns';

const Login = (props) =>
    <BrandColumns>
        <h2 className="mb-4">Sign in</h2>
        <Button 
            className="mb-4" 
            variant="primary" 
            href="/auth/ligo/" block size="lg">
              Continue with LIGO authentication
        </Button>
        <p className="pb-5">
            Interested in joining the LIGO Scientific Collaboration? <br/>
            <a href="https://www.ligo.org/about/join.php"> Apply to join</a>
        </p>
        <LoginForm {...props} />
    </BrandColumns>;

export default Login;
