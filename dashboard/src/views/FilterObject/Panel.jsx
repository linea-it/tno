import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import FilterObject from './FilterObject';
import CustomList from 'views/ObjectList/CustomList';

class FilterPanel extends Component {
  state = this.initialState;

  get initialState() {
    return {};
  }

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <FilterObject />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <CustomList />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(FilterPanel);
