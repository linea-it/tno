import React, { Component } from 'react';
import {
    Grid, Row, Col } from 'react-bootstrap';

import Card from 'components/Card/Card.jsx'

class SolarSystems extends Component {
    render() {
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={4}>
                            <Card
                                title="Solar Systems"
                                category=""
                                content={
                                    <div/>
                                }
                            />
                        </Col>
                        <Col md={8}>
                            <Card
                                title="Tasks"
                                category=""
                                content={
                                    <div/>
                                }
                            />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default SolarSystems;
