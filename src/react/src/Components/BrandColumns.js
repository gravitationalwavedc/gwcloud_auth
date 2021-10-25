import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import gwcloudLogo from '../Assets/GWC-Green192-768x521.png';
import FooterLogos from './FooterLogos';
import livingstonBackground from '../Assets/ligo-livingston-blue.png';
import gwdcLogo from '../Assets/GWDC_grey_full_571x150.png';

const bigBrandStyle = { marginTop: '197px', color: '#F0FAFF' };
const signInStyle = { position: 'absolute', height: '3rem', margin: '1rem 0 0 1rem', left: '50%' };
const signInSmall = { position: 'absolute', height: '3rem', margin: '1rem 0 0 1rem' };
const backgroundStyle = {
    background: `url(${livingstonBackground}) no-repeat center`,
    backgroundSize: 'cover',
    minHeight: '100px'
};
const logoIconStyle = { height: '4rem', marginBottom: '8px' };

const BrandColumn = ({ children }) =>
    <Container className="h-100" fluid>
        <Row className="h-100">
            <Col style={backgroundStyle} lg={6} className="text-center d-none d-lg-block">
                <h1
                    className="login-logo"
                    style={bigBrandStyle}><img style={logoIconStyle} src={gwcloudLogo}/> GWCloud</h1>
            </Col>
            <img src={gwdcLogo} style={signInStyle} className="d-none d-lg-block"/>
            <img src={gwdcLogo} style={signInSmall} className="d-lg-none d-xs-block"/>
            <Col className="align-self-center" style={{ marginTop: '5rem' }}>
                <Row className="justify-content-md-center">
                    <Col lg={8} md={10}>
                        { children }
                    </Col>
                </Row>
                <FooterLogos />
            </Col>
        </Row>
        <Row>
            <Col lg={{ offset: 6, span: 6 }} md={12} />
        </Row>
    </Container>;

export default BrandColumn;
