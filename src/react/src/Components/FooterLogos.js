import React from 'react';
import { Col, Row } from 'react-bootstrap';
import ncrisLogo from '../Assets/ncris_logo.png';
import ozgravLogo from '../Assets/ozgrav-logo-array-tk005-final-invert-textedit.png';
import aalLogo from '../Assets/aal-logo-rp-revised-wwording-800px.png';

const FooterLogos = () => 
    <Row className="justify-content-md-center" style={{ margin: '4rem 0 2rem 0' }}>
        <Col md={8}>
            <Row className="align-items-end">
                <Col>
                    <img src={ncrisLogo} style={{ maxWidth: '100%', maxHeight: '4rem' }}/>
                </Col>
                <Col className="text-center">
                    <img src={ozgravLogo} style={{ maxWidth: '100%', maxHeight: '4.5rem' }}/>
                </Col>
                <Col className="text-right">
                    <img src={aalLogo} style={{ maxWidth: '100%', maxHeight: '3rem' }}/>
                </Col>
            </Row>
        </Col>
    </Row>;

export default FooterLogos;
