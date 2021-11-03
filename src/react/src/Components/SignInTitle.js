import React from 'react';
import gwcloudLogo from '../Assets/GWCloud-logo-blue.png';
import { harnessApi } from '../index';

const logoIconStyle = { height: '4rem', marginBottom: '8px' };

const SignInTitle = () => {

    const Title = () => {
        const projectName = harnessApi.currentProject().name;

        if (projectName === 'GWLab') {
            return <h1 className="mb-5 title-display">GWLab</h1>;
        }

        return <h1 className="login-logo pb-5 d-xs-block d-lg-none">
            <img style={logoIconStyle} src={gwcloudLogo} className="pr-3"/>
                GWCloud
        </h1>;
    };

    return <Title />;
};

export default SignInTitle;
