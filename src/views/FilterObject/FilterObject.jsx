import React, { Component } from 'react';
import {
    Grid, Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import Card from 'components/Card/Card.jsx'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';

import FilterObjectForm from './FilterObjectForm';
import FilterObjectSearch from './FilterObjectSearch';
import FilterObjectTable from './FilterObjectTable';

class FilterObject extends Component {
    render() {
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={4}>
                            <Row>
                                <Card
                                    content={
                                        <FilterObjectSearch />
                                    }
                                />
                            </Row>                            
                            <Row>
                                <Card
                                    title="Filters"
                                    category=""
                                    content={
                                        <FilterObjectForm />
                                    }
                                />
                            </Row>
                        </Col >
                        <Col md={8}>
                            <Card
                                title=""
                                category=""
                                content={
                                    <FilterObjectTable/>
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
