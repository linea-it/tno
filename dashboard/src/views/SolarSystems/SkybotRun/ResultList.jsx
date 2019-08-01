import React, { Component } from 'react';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import SkybotApi from 'views/SolarSystems/SkybotApi';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import PropTypes from 'prop-types';

class ResultList extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    skybotrun: PropTypes.number.isRequired,
    view_exposure: PropTypes.func.isRequired,
  };

  get initialState() {
    return {
      data: [],
      loading: false,
      page: 1,
      first: 0,
      sizePerPage: 25,
      totalSize: 0,
      sortField: 'name',
      sortOrder: 1,
      asteroid_id: 0,
      log_visible: false,
      selected: null,
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
        } else if (rowData.status === 'warning') {
          return (
            <Button
              type="button"
              icon="fa fa-exclamation"
              className="ui-button-warning"
              title={rowData.error_msg}
            />
          );
        } else if (rowData.status === 'not_executed') {
          return (
            <Button
              type="button"
              icon="fa fa-times-circle"
              className="btn-gray"
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
      },
    },
    {
      field: 'expnum',
      header: 'Expnum',
      sortable: false,
    },
    {
      field: 'band',
      header: 'Band',
      sortable: false,
      width: 60,
    },
    {
      field: 'date_obs',
      header: 'Date Obs',
      sortable: false,
      width: 180,
    },
    {
      field: 'execution_time',
      header: 'Execution Time (s)',
      sortable: false,
    },
    {
      field: 'count_rows',
      header: 'Skybot Rows',
      sortable: false,
    },
    {
      field: 'created',
      header: 'Created',
      sortable: false,
    },
    {
      field: 'updated',
      header: 'Updated',
      sortable: false,
    },
    {
      field: 'ccd_count_rows',
      header: 'Inside CCD',
      sortable: false,
    },
  ];

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.skybotrun !== prevProps.skybotrun) {
      this.fetchData({
        skybotrun: this.props.skybotrun,
        page: this.state.page,
        sizePerPage: this.state.sizePerPage,
      });
    }
  }

  fetchData = ({ skybotrun, page, sizePerPage }) => {
    this.setState({ loading: true });

    this.api.getSkybotRunResults({ skybotrun, page, sizePerPage }).then(res => {
      const r = res.data;
      this.setState({
        data: r.data,
        totalSize: r.totalCount,
        page: page,
        sizePerPage: sizePerPage,
        loading: false,
      });
    });
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
        skybotrun: this.props.skybotrun,
        page: page,
        sizePerPage: e.rows,
      })
    );
  };

  actionTemplate = rowData => {
    let btn_view = null;
    if (rowData.status === 'success') {
      btn_view = (
        <Button
          type="button"
          icon="fa fa-search"
          className="ui-button-info"
          title="View"
          onClick={() => this.onDetailExposure(rowData)}
        />
      );
      return <div>{btn_view}</div>;
    }
  };

  onDetailExposure = row => {
    this.props.view_exposure(row);
  };

  render() {
    // console.log('Esse aqui', this.state.data);

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
      <div>
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
        >
          {columns}
          <Column
            body={this.actionTemplate}
            style={{ textAlign: 'center', width: '6em', color: '#fff' }}
          />
        </DataTable>
        <Paginator
          rows={this.state.sizePerPage}
          totalRecords={this.state.totalSize}
          first={this.state.first}
          onPageChange={this.onPageChange}
        />
      </div>
    );
  }
}

export default ResultList;
