import React, { Component } from 'react';
import {
    Grid, Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import Card from 'components/Card/Card.jsx'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';

class SkyBot extends Component {
    render() {
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={4}>
                            <Card 
                                title="SkyBoT"
                                category="Submit querys to  Virtual Observatory Sky Body Tracker"
                                content={
                                    <form>
                                        <FormInputs
                                            ncols = {["col-md"]}
                                            proprieties = {[
                                                {
                                                    label : "Initial Date",
                                                    type : "date",
                                                    bsClass : "form-control",
                                                    placeholder : "",
                                                    defaultValue : ""
                                                },
                                            ]}
                                        />
                                        <FormInputs
                                            ncols = {["col-md"]}
                                            proprieties = {[
                                                {
                                                    label : "Final Date",
                                                    type : "date",
                                                    bsClass : "form-control",
                                                    placeholder : "",
                                                    defaultValue : ""
                                                },
                                            ]}
                                        />
                                        <FormInputs
                                            ncols = {["col-md"]}
                                            proprieties = {[
                                                {
                                                    label : "Size of FOV",
                                                    type : "number",
                                                    bsClass : "form-control",
                                                    placeholder : "",
                                                    defaultValue : ""
                                                },
                                            ]}
                                        />

                                        <FormGroup controlId="formControlsSelect">
                                          <ControlLabel>Objects</ControlLabel>
                                          <FormControl componentClass="select" placeholder="select">
                                            <option value="select">Asteroids</option>
                                            <option value="other">...</option>
                                          </FormControl>
                                        </FormGroup>
                                        <FormGroup controlId="formControlsSelect">
                                          <ControlLabel>Observatory</ControlLabel>
                                          <FormControl componentClass="select" placeholder="select">
                                            <option value="000">Greenwich</option>
                                            <option value="001">Crowborough</option>
                                          </FormControl>
                                        </FormGroup>
                                        <FormInputs
                                            ncols = {["col-md"]}
                                            proprieties = {[
                                                {
                                                    label : "Filter",
                                                    type : "text",
                                                    bsClass : "form-control",
                                                    placeholder : "",
                                                    defaultValue : ""
                                                },
                                            ]}
                                        />
                                        <Button
                                            bsStyle="info"
                                            pullRight
                                            fill
                                            type="submit"
                                        >
                                            Update Profile
                                        </Button>
                                        <div className="clearfix"></div>
                                    </form>
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

export default SkyBot;
