import React, { Component } from 'react';
import {
    Grid, Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import Card from 'components/Card/Card.jsx'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';

class FilterObject extends Component {
    render() {
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={4}>
                            <Card
                                title="Filter Objects"
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

export default FilterObject;
