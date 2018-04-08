import React, { Component } from 'react';
import axios from 'axios';
import {
    Grid, Row, Col} from 'react-bootstrap';

import Card from 'components/Card/Card.jsx'

import FilterObjectForm from './FilterObjectForm';
import FilterObjectSearch from './FilterObjectSearch';
import FilterObjectTable from './FilterObjectTable';

const api = process.env.REACT_APP_API_FILTER_OBJECTS

class FilterObject extends Component {

    state = {
        search: '',
        objects: []
    }

    onSearch = pattern => {
        this.setState({search:pattern})

        axios.get(`${api}/object_by_name`,{
                params: {
                    name: pattern
                }
            })
            .then(res => {
                var result = res.data
                console.log(result)
                if (result.success) {
                    this.setState({ objects: result.data });
                }
            })
    }

    onFilter = filters => {
        this.setState({filters:filters})

        axios.get(`${api}/get_objects`,{
                params: filters
            })
            .then(res => {
                var result = res.data
                console.log(result)
                if (result.success) {
                    this.setState({ objects: result.data });
                }

                console.log(this.state.objects)
            })
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
                                        <FilterObjectForm onFilter={this.onFilter}/>
                                    }
                                />
                            </Row>
                        </Col >
                        <Col md={8}>
                            <Card
                                title=""
                                category=""
                                content={
                                    <FilterObjectTable records={this.state.objects}/>
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
