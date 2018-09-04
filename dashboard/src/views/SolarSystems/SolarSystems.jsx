import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import SkybotApi from './SkybotApi';
import SkybotList from './SkybotList';
import SkybotStats from './SkybotStats';

class SolarSystemsPanel extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: null,
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
    };
  }

  render() {
    return (
      <div className="content">
        <SkybotStats />
        <SkybotList />
      </div>
    );
  }
}

export default withRouter(SolarSystemsPanel);
