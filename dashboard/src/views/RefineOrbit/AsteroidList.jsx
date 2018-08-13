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
import PropTypes from 'prop-types';
class AsteroidList extends Component {
  state = this.initialState;
  api = new OrbitApi();

  static propTypes = {
    orbit_run: PropTypes.number.isRequired,
  };

  get initialState() {
    return {
      data: [],
      loading: false,
      totalSize: 0,
      asteroid_id: 0,
      log_visible: false,
    };
  }

  columns = [
    {
      field: 'status',
      header: 'Status',
      sortable: false,
      style: { textAlign: 'center', width: '80' },
      body: rowData => {
        if (rowData.status === 'success') {
          return (
            <Button
              type="button"
              icon="fa fa-check"
              className="ui-button-success"
            />
          );
        } else {
          return (
            <Button
              type="button"
              icon="fa fa-times"
              className="ui-button-danger"
              title={rowData.error_msg}
            />
          );
        }
      },
    },
    {
      field: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      field: 'number',
      header: 'Number',
      sortable: true,
      body: rowData => {
        if (rowData.number === '-') {
          return '';
        }
        return rowData.number;
      },
    },
    {
      field: 'execution_time',
      header: 'Execution Time',
      sortable: true,
      style: { textAlign: 'center' },
    },
    // {
    //   field: 'files',
    //   header: 'Execution Time',
    //   sortable: true,
    // },
  ];

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.orbit_run !== prevProps.orbit_run) {
      this.fetchData({ orbit_run: this.props.orbit_run });
    }
  }

  fetchData = ({ orbit_run }) => {
    console.log('FetchData');
    console.log(orbit_run);

    this.setState({ loading: true });

    const filters = [];
    filters.push({
      property: 'orbit_run',
      value: orbit_run,
    });

    this.api.getAsteroid({ filters }).then(res => {
      const r = res.data;

      console.log(r);

      this.setState({
        data: r.results,
        totalSize: r.count,
        // page: page,
        // sizePerPage: sizePerPage,
        loading: false,
      });
    });
  };

  showAsteroidLog = asteroid_id => {
    this.setState({ asteroid_id, log_visible: true });
  };

  actionTemplate = (rowData, column) => {
    console.log('teste: %o, %o', rowData, column);

    const asteroid_id = rowData.id;
    console.log(asteroid_id);
    return (
      <div>
        {/* <Button
          type="button"
          icon="fa fa-search"
          className=".ui-button-info"
          title="View"
        /> */}
        <Button
          type="button"
          icon="fa fa-file-text-o"
          className=".ui-button-info"
          title="Log"
          onClick={() => this.showAsteroidLog(asteroid_id)}
        />
      </div>
    );
  };

  onLogHide = () => {
    this.setState({ log_visible: false, asteroid_id: 0 });
  };

  render() {
    const columns = this.columns.map((col, i) => {
      return (
        <Column
          key={i}
          field={col.field}
          header={col.header}
          sortable={col.sortable}
          style={col.style}
          body={col.body}
        />
      );
    });

    const toolbar = (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button label="View" icon="pi pi-plus" />
          <Button
            label="Log"
            icon="pi pi-file"
            className="ui-button-warning"
            onClick={this.onClick}
          />
        </div>
      </Toolbar>
    );

    const showLog = asteroid => {
      console.log('Show Log: %o', asteroid);
    };

    return (
      <Card
        title="Asteroids"
        subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
      >
        {toolbar}
        <DataTable
          // header={tb_header}
          // footer={footer}
          value={this.state.data}
          resizableColumns={true}
          columnResizeMode="expand"
          reorderableColumns={true}
          reorderableRows={true}
          responsive={true}
          // selectionMode="single"
          // selection={this.state.selectedCar1}
          // onSelectionChange={e => this.setState({ selectedCar1: e.data })}
          scrollable={true}
          // scrollHeight="200px"
          loading={this.state.loading}
          totalRecords={this.state.totalSize}
        >
          {columns}
          <Column
            body={this.actionTemplate}
            style={{ textAlign: 'center', width: '6em' }}
          />
        </DataTable>

        <Log
          visible={this.state.log_visible}
          onHide={this.onLogHide}
          id={this.state.asteroid_id}
        />
      </Card>
    );
  }
}

export default AsteroidList;
