import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import PraiaApi from './PraiaApi';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import PropTypes from 'prop-types';
import moment from 'moment';

class AsteroidList extends Component {
  state = this.initialState;
  api = new PraiaApi();

  // static propTypes = {
  //   orbit_run: PropTypes.number.isRequired,
  //   view_asteroid: PropTypes.func.isRequired,
  // };

  get initialState() {
    return {
      data: [],
      loading: false,
      page: 1,
      first: 0,
      sizePerPage: 100,
      totalSize: 0,
      sortField: 'name',
      sortOrder: 1,
      asteroid_id: 0,
      selected: null,
    };
  }

  columns = [
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
      body: rowData => {
        if (rowData.execution_time > 0) {
          return moment.utc(rowData.execution_time * 1000).format('HH:mm:ss');
        } else {
          return;
        }
      },
    },
  ];

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.praia_run !== prevProps.praia_run) {

      this.fetchData({
        praia_run: this.props.praia_run,
        page: this.state.page,
        sizePerPage: this.state.sizePerPage,
      });
    }
  }

  fetchData = ({ praia_run, page, sizePerPage, sortField, sortOrder }) => {
    this.setState({ loading: true });

    const filters = [];
    filters.push({
      property: 'astrometry_run',
      value: praia_run,
    });

    this.api
      .getAsteroids({ filters, page, sizePerPage, sortField, sortOrder })
      .then(res => {
        const r = res.data;
        this.setState({
          data: r.results,
          totalSize: r.count,
          page: page,
          sizePerPage: sizePerPage,
          loading: false,
          sortField: sortField,
          sortOrder: sortOrder,
        });
      });
  };

  showAsteroidLog = asteroid_id => {
    this.setState({ asteroid_id, log_visible: true });
  };

  onViewAsteroid = asteroid_id => {
    this.props.view_asteroid(asteroid_id);
  };

  actionTemplate = rowData => {
    const asteroid_id = rowData.id;
    let btn_view = null;
    let btn_log = null;


    if (rowData.status !== 'failure') {
      btn_view = (
        <Button
          type="button"
          icon="fa fa-search"
          className="ui-button-info"
          title="View"
          onClick={() => this.onViewAsteroid(asteroid_id)}
        />
      );
      btn_log = (
        <Button
          type="button"
          icon="fa fa-file-text-o"
          className="ui-button-warning"
          title="Log"
        // onClick={() => this.showAsteroidLog(asteroid_id)}
        />
      );
    }

    return (
      <div>
        {btn_view}
        {btn_log}
      </div>
    );
  };

  statusColumn = rowData => {
    0
    if (rowData.status === 'success') {
      return (
        <Button
          type="button"
          icon="fa fa-check"
          className="ui-button-success"
        />
      );
    } else if (rowData.status === 'warning') {
      return (
        <Button
          type="button"
          icon="fa fa-exclamation"
          className="ui-button-warning"
          title={rowData.error_msg}
        />
      );
    } else if (rowData.status === 'pending') {
      return (
        <Button
          type="button"
          icon="fa fa-exclamation"
          className="ui-button-pending"
          title={rowData.error_msg}
        />
      );
    }
    else if (rowData.status === 'not_executed') {
      return (
        <Button
          type="button"
          icon="fa fa-exclamation"
          className="ui-button-warning"
          title={rowData.error_msg}
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
  };

  onLogHide = () => {
    this.setState({ log_visible: false, asteroid_id: 0 });
  };

  onPageChange = e => {
    const page = e.page + 1;
    this.setState(
      {
        first: e.first,
        page: page,
        sizePerPage: e.rows,
      },
      this.fetchData({
        praia_run: this.props.praia_run,
        page: page,
        sizePerPage: e.rows,
        sortField: this.state.sortField,
        sortOrder: this.state.sortOrder,
      })
    );
  };

  onSort = e => {
    this.setState(
      {
        sortField: e.sortField,
        sortOrder: e.sortOrder,
      },
      this.fetchData({
        praia_run: this.props.praia_run,
        page: this.state.page,
        sizePerPage: this.state.sizePerPage,
        sortField: e.sortField,
        sortOrder: e.sortOrder,
      })
    );
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

    return (
      <Card title="" subTitle="">
        <DataTable
          value={this.state.data}
          resizableColumns={true}
          columnResizeMode="expand"
          reorderableColumns={false}
          reorderableRows={false}
          responsive={true}
          scrollable={true}
          loading={this.state.loading}
          totalRecords={this.state.totalSize}
          sortField={this.state.sortField}
          sortOrder={this.state.sortOrder}
          onSort={this.onSort}
        >
          <Column
            header="Status"
            body={this.statusColumn}
            style={{ textAlign: 'center', width: '6em' }}
          />
          {columns}
          <Column
            body={this.actionTemplate}
            style={{ textAlign: 'center', width: '6em' }}
          />
        </DataTable>
        <Paginator
          rows={this.state.sizePerPage}
          totalRecords={this.state.totalSize}
          first={this.state.first}
          onPageChange={this.onPageChange}

        />

        {/* <Log
                    visible={this.state.log_visible}
                    onHide={this.onLogHide}
                    id={this.state.asteroid_id}
                /> */}
      </Card>
    );
  }


}

export default AsteroidList;
