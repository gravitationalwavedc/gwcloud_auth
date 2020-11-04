import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import gwcloudLogo from '../Assets/GWC-Green192-768x521.png';
import livingstonBackground from '../Assets/ligo-livingston-blue.png';
import ncrisLogo from '../Assets/ncris_logo.png';
import gwdcLogo from '../Assets/GWDC_grey_full_571x150.png';
import ozgravLogo from '../Assets/ozgrav-logo-array-tk005-final-invert-textedit.png';
import aalLogo from '../Assets/aal-logo-rp-revised-wwording-800px.png';

const bigBrandStyle = { marginTop: '197px', color: '#F0FAFF' };
const signInStyle = { position: 'absolute', height: '40px', marginTop: '10px' };
const smallBrandStyle = { color: '#F0FAFF', margin: '0 -15px' };
const backgroundStyle = {
    background: `url(${livingstonBackground}) no-repeat center`,
    backgroundSize: 'cover',
    minHeight: '100px'
};
const logoIconStyle = { height: '4rem', marginBottom: '8px' };

const BrandColumn = ({ children }) =>
    <Container className="h-100" fluid>
        <Row className="h-100">
            <Col style={backgroundStyle} md={12} lg={6} className="text-center">
                <h1
                    className="login-logo d-none d-lg-block"
                    style={bigBrandStyle}><img style={logoIconStyle} src={gwcloudLogo}/> GWCloud</h1>
            </Col>
            <Col md={12} className="text-center d-none d-md-block d-lg-none bg-blue-400">
                <h1
                    className="login-logo p-2"
                    style={smallBrandStyle}><img style={logoIconStyle} src={gwcloudLogo}/> GWCloud</h1>
            </Col>
            <Col className="h-100">
                <img src={gwdcLogo} style={signInStyle}/>
                <Row className="justify-content-md-center">
                    <Col lg={8} md={10} style={{ marginTop: '230px' }}>
                        { children }
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row className="fixed-bottom">
            <Col lg={{ offset: 6, span: 6 }} md={12}>
                <Row className="justify-content-md-center mb-5">
                    <Col md={8}>
                        <Row className="align-items-end">
                            <Col>
                                <img src={ncrisLogo} style={{ maxWidth: '100%', maxHeight: '70px' }}/>
                            </Col>
                            <Col className="text-center">
                                <img src={ozgravLogo} style={{ maxWidth: '100%', maxHeight: '100px' }}/>
                            </Col>
                            <Col className="text-right">
                                <img src={aalLogo} style={{ maxWidth: '100%', maxHeight: '48px' }}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Container>;

export default BrandColumn;
