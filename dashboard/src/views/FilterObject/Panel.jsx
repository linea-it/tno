import React, { Component } from 'react';
import { Grid, Row, Col, Tabs, Tab } from 'react-bootstrap';
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
              <Tabs
                defaultActiveKey={1}
                animation={true}
                id="noanim-tab-example"
              >
                <Tab eventKey={1} title="Filter">
                  <FilterObject />
                </Tab>
                <Tab eventKey={2} title="Lists">
                  <CustomList />
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(FilterPanel);
