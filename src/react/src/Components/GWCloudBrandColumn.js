import React from 'react';
import { Col } from 'react-bootstrap';
import livingstonBackground from '../Assets/ligo-livingston-blue.png';
import gwcloudLogo from '../Assets/GWC-Green192-768x521.png';
import gwdcLogo from '../Assets/GWDC_grey_full_571x150.png';

const bigBrandStyle = { marginTop: '197px', color: '#F0FAFF' };
const logoIconStyle = { height: '4rem', marginBottom: '8px' };
const backgroundStyle = {
    background: `url(${livingstonBackground}) no-repeat center`,
    backgroundSize: 'cover',
    minHeight: '100px'
};

const signInStyle = { position: 'absolute', height: '3rem', margin: '1rem 0 0 1rem', left: '50%' };
const signInSmall = { position: 'absolute', height: '3rem', margin: '1rem 0 0 1rem' };

const GWCloudBrandColumn = () => 
    <>
        <Col style={backgroundStyle} lg={6} className="text-center d-none d-lg-block">
            <h1
                className="login-logo"
                style={bigBrandStyle}><img style={logoIconStyle} src={gwcloudLogo}/> GWCloud</h1>
        </Col>
        <img src={gwdcLogo} style={signInStyle} className="d-none d-lg-block"/>
        <img src={gwdcLogo} style={signInSmall} className="d-lg-none d-xs-block"/>
    </>;

export default GWCloudBrandColumn;
