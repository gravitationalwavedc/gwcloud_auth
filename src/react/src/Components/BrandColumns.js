import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import FooterLogos from './FooterLogos';
import GWCloudBrandColumn from '../Components/GWCloudBrandColumn';
import GWLabBrandColumn from '../Components/GWLabBrandColumn';
import GWLandscapeBrandColumn from '../Components/GWLandscapeBrandColumn';
import GWlandscapeLogo from '../Assets/GWLandscape-logo.svg';
import { isGWLab, isGWLandscape } from '../index';

const setProjectColumn = () => {
    if (isGWLab) {
        return GWLabBrandColumn;
    }

    if (isGWLandscape) {
        return GWLandscapeBrandColumn;
    }

    return GWCloudBrandColumn;
};

const BrandColumn = ({ children }) => {

    const ProjectColumn = setProjectColumn();

    const colSizes = isGWLandscape ? { lg: 4, md: 6 } : { lg: 8, md: 10 };
    
    return (
        <Container className="h-100" fluid>
            <Row className="h-100">
                <ProjectColumn />
                <Col className="align-self-center" style={{ marginTop: '5rem' }}>
                    <Row className="justify-content-md-center">
                        <Col {...colSizes }>
                            { isGWLandscape && 
                                <GWlandscapeLogo style={{ width: '100%' }} className="mb-4"/> }
                            { children }
                        </Col>
                    </Row>
                    <FooterLogos width={colSizes}/>
                </Col>
            </Row>
            <Row>
                <Col lg={{ offset: 6, span: 6 }} md={12} />
            </Row>
        </Container>
    );
};

export default BrandColumn;
