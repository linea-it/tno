import React, { Component } from 'react';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { withRouter } from 'react-router-dom';
import PointingApi from './PointingApi';
import PointingStats from './PointingStats';
import PointingList from './PointingList';

import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class PointingsPanel extends Component {
  state = this.initialState;
  api = new PointingApi();

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
      <div className="grid template-wrap-pointings">
        <PointingStats className="pointings_stats" />
        <PointingList className="pointings_list" />
      </div>
    );
  }
}

export default withRouter(PointingsPanel);
