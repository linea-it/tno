import React, { Component } from 'react';
import axios from 'axios';
import { Grid, Row, Col } from 'react-bootstrap';
import Card from 'components/Card/Card.jsx';
import { withRouter } from 'react-router-dom';
import FilterObjectForm from './FilterObjectForm';
import FilterObjectSearch from './FilterObjectSearch';
import FilterObjectTable from './FilterObjectTable';
import CreateListForm from './CreateListForm';
import PropTypes from 'prop-types';

const api = process.env.REACT_APP_API;

class FilterObject extends Component {
  state = this.initialState;

  get initialState() {
    return {
      searchPattern: '',
      objects: [],
      totalSize: 0,
      page: 1,
      filters: {},
      showCreate: false,
    };
  }

  static propTypes = {
    history: PropTypes.any.isRequired,
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
    const filters = this.state.filters;
    const searchPattern = this.state.searchPattern;
    const params = {
      displayname: displayname,
      tablename: tablename,
      description: description,
      filter_dynclass: filters.objectTable,
      filter_morefilter: filters.moreFilter,
      filter_name: searchPattern,
    };

    // filtro por magnitude
    if (filters.useMagnitude) {
      params.filter_magnitude = filters.magnitude;
    }
    // filtro por difference time
    if (filters.useDifferenceTime) {
      params.filter_diffdatenights = filters.diffDateNights;
    }

    // Salvar a lista
    axios
      .post(`${api}/customlist/`, params)
      .then(res => {
        this.toObjectList(res);
      })
      .catch(function(error) {
        // TODO implementar mensagem de error
        console.log(error);
      });
  };

  toObjectList = response => {
    this.props.history.push('/objects/' + response.data.id);
  };

  render() {
    const closeCreate = () => this.setState({ showCreate: false });
    return (
      <div className="content">
        <Card
          title=""
          category="Filter the objects and create a list with the result."
          content={
            <Grid fluid>
              <Row>
                <Col md={3}>
                  <Row>
                    <Card
                      content={<FilterObjectSearch onSearch={this.onSearch} />}
                    />
                  </Row>
                  <Row>
                    <Card
                      title=""
                      category=""
                      content={<FilterObjectForm onFilter={this.onFilter} />}
                    />
                  </Row>
                </Col>
                <Col md={9}>
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
          }
        />
        <CreateListForm
          show={this.state.showCreate}
          onHide={closeCreate}
          onSave={this.createCustomList}
        />
      </div>
    );
  }
}

export default withRouter(FilterObject);
