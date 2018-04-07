import React, { Component } from 'react';
import axios from 'axios';
import {
    Grid, Row, Col} from 'react-bootstrap';

import Card from 'components/Card/Card.jsx'

import FilterObjectForm from './FilterObjectForm';
import FilterObjectSearch from './FilterObjectSearch';
import FilterObjectTable from './FilterObjectTable';

class FilterObject extends Component {
    constructor(props) {
      super(props);
        this.state = {
            search: '',
            objects: [
                {"diff_date_max": null, "filters": null, "freq": 22, "mag_max": null, "mag_min": null, "name": "2002 TP36", "nights": null},
                {"diff_date_max": null, "filters": null, "freq": 22, "mag_max": null, "mag_min": null, "name": "2002 TP36", "nights": null},
                {"diff_date_max": null, "filters": null, "freq": 22, "mag_max": null, "mag_min": null, "name": "2002 TP36", "nights": null},
                {"diff_date_max": null, "filters": null, "freq": 22, "mag_max": null, "mag_min": null, "name": "2002 TP36", "nights": null},
                {"diff_date_max": null, "filters": null, "freq": 22, "mag_max": null, "mag_min": null, "name": "2002 TP36", "nights": null}
            ]
        };

        this.api = process.env.REACT_APP_API_FILTER_OBJECTS

      this.onFilter = this.onFilter.bind(this);
      this.onSearch = this.onSearch.bind(this);
    }

    onSearch(pattern) {
        console.log("onSearch(%o)", pattern)
        this.setState({search:pattern})

        axios.get(`${this.api}/object_by_name`,{
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

                console.log(this.state.objects)
            })
    }

    onFilter(filters) {
        console.log("onFilter(%o)", filters)

        this.setState({filters:filters})

        axios.get(`${this.api}/get_objects`,{
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
