import React, { Component } from 'react';
import axios from 'axios';
import {
    Grid, Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import Card from 'components/Card/Card.jsx'
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';

import FilterObjectForm from './FilterObjectForm';
import FilterObjectSearch from './FilterObjectSearch';
import FilterObjectTable from './FilterObjectTable';

class FilterObject extends Component {
    constructor(props) {
      super(props);
        this.state = {
          search: ''
        };

        this.api = process.env.REACT_APP_API_FILTER_OBJECTS

      this.loadObjects = this.loadObjects.bind(this);
      this.onSearch = this.onSearch.bind(this);
    }

    onSearch(pattern) {
        console.log("onSearch(%o)", pattern)
        this.state.search = pattern

        axios.get(`${this.api}/object_by_name`,{
                params: {
                    name: pattern
                }
            })
            .then(res => {
                console.log("TESTE")
                // const persons = res.data;
                // this.setState({ persons });
            })

        // fetch("http://localhost:7003/objects_by_name")
        //     .then(response => response.json())
        //     .then(json => {
        //         console.log(json);
        //         console.log('Carregou')
        //     });


    }

    loadObjects(event) {
        console.log('load objects')

        console.log(this.state)

        fetch("http://localhost:7003")
            .then(response => response.json())
            .then(json => {
                console.log(json);
                console.log('Carregou')
            });
    }


    render() {
        return (
            <div className="content">
                <Grid fluid>
                    <Row>
                        <Col md={4}>
                            <Row>
                                <Card
                                    content={
                                        <FilterObjectSearch onSearch={this.onSearch}/>
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
