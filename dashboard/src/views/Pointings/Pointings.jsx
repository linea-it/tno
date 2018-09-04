import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Panel } from 'primereact/panel';
import { withRouter } from 'react-router-dom';
import PointingApi from './PointingApi';
import PointingStats from './PointingStats';
import PointingList from './PointingList';
import PropTypes from 'prop-types';
// import Card from 'components/Card/Card.jsx';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import PanelCostumize from 'components/Panel/PanelCostumize';
import { Card } from 'primereact/card';

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
      <div className="content">
        <PointingStats />
        <PointingList />
      </div>
    );
  }
}

export default withRouter(PointingsPanel);
