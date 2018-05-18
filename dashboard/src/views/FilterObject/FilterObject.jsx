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
    showCreate: false,
  };

  onSearch = pattern => {
    this.setState({
      searchPattern: pattern,
      filters: {},
    });
  };

  onFilter = filters => {
    this.setState({
      filters: filters,
      searchPattern: '',
    });
  };

  saveList = () => {
    this.setState({ showCreate: true });
  };

  createCustomList = (displayname, tablename, description) => {
    console.log(
      'createCustomList(%o, %o, %o)',
      displayname,
      tablename,
      description
    );

    console.log('filters:', this.state.filters);

    // Todo criar metodo para salvar a lista
  };

  render() {
    const closeCreate = () => this.setState({ showCreate: false });
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
        <CreateListForm
          show={this.state.showCreate}
          onHide={closeCreate}
          onSave={this.createCustomList}
        />
      </div>
    );
  }
}

export default FilterObject;
