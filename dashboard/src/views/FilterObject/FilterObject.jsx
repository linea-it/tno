import React, { Component } from 'react';
import axios from 'axios';
import { Grid, Row, Col } from 'react-bootstrap';

import Card from 'components/Card/Card.jsx';

import FilterObjectForm from './FilterObjectForm';
import FilterObjectSearch from './FilterObjectSearch';
import FilterObjectTable from './FilterObjectTable';
import CreateListForm from './CreateListForm';

const api = process.env.REACT_APP_API;

class FilterObject extends Component {
  state = {
    searchPattern: '',
    objects: [],
    totalSize: 0,
    page: 1,
    filters: {},
    showCreate: false
  };

  onSearch = pattern => {
    this.setState({
      searchPattern: pattern,
      filters: {}
     });
  };

  onFilter = filters => {
    console.log('onFilter: ', filters)
    this.setState({
      filters: filters,
      searchPattern: ''
     });
  };

  saveList = () => {
    console.log("saveList")

    this.setState({ showCreate: true })
  }

  render() {
    let closeCreate = () => this.setState({ showCreate: false })
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={4}>
              <Row>
                <Card
                  content={<FilterObjectSearch onSearch={this.onSearch} />}
                />
              </Row>
              <Row>
                <Card
                  title="Filters"
                  category=""
                  content={<FilterObjectForm onFilter={this.onFilter} />}
                />
              </Row>
            </Col>
            <Col md={8}>
              <Card
                title=""
                category=""
                content={
                  <FilterObjectTable
                    filters={this.state.filters}
                    searchPattern={this.state.searchPattern}
                    saveList={this.saveList}
                  />
                }
              />
            </Col>
          </Row>
        </Grid>
        <CreateListForm show={ this.state.showCreate } onHide={closeCreate}/>
      </div>
    );
  }
}

export default FilterObject;
