import React from 'react';
import { Col } from 'react-bootstrap';
import GWLabCircle from '../Assets/GWLabCircle.svg';
import gwdcLogo from '../Assets/GWDC_grey_full_571x150.png';

const signInStyle = { position: 'absolute', height: '3rem', margin: '1rem 0 0 1rem', right: '1rem' };

const GWLabBrandColumn = () => 
    <>
        <Col style={{ overflow: 'hidden' }} className="d-none d-lg-block">
            <GWLabCircle className="gwlab-circle" />     
        </Col>
        <img src={gwdcLogo} style={signInStyle} />
    </>;

export default GWLabBrandColumn;
