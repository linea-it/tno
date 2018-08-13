// React e Prime React
import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import OrbitApi from './OrbitApi';
// interface components
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
// import { Tree } from 'primereact/tree';
import Lightbox from 'react-images';
// import { Tree } from 'primereact/tree';
import { Panel } from 'primereact/panel';
//importing images
// import plot1 from 'assets/img/1.png';
import plot1 from 'assets/img/1.png';
import plot2 from 'assets/img/2.png';
import plot3 from 'assets/img/3.png';
import plot4 from 'assets/img/4.png';
import download from 'assets/img/download.jpeg';
import Log from 'views/RefineOrbit/Log.jsx';
import { TreeTable } from 'primereact/treetable';
import { withRouter } from 'react-router-dom';
import AsteroidList from './AsteroidList';
import PropTypes from 'prop-types';
class RefineOrbitRunDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  get initialState() {
    return {
      id: 0,
      data: {},
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    // console.log('Orbit Run Id: %o', params.id);

    this.api.getOrbitRunById({ id: params.id }).then(res => {
      const data = res.data;

      this.setState({
        id: parseInt(params.id),
        data: data,
      });
    });
  }

  render() {
    return (
      <div className="content">
        <AsteroidList orbit_run={this.state.id} />
      </div>
    );
  }
}

export default withRouter(RefineOrbitRunDetail);
