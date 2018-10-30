// React e Prime React
import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import PredictionApi from './PredictionApi';
// interface components
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import PropTypes from 'prop-types';
import { formatColumnHeader } from 'utils';

class PredictionHistory extends Component {
  state = this.initialState;
  api = new PredictionApi();

  static propTypes = {
    view_prediction: PropTypes.func.isRequired,
    onRerun: PropTypes.func.isRequired,
  };

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
      log_visible: false,
      selected: null,
    };
  }

  columns = [
    {
      field: 'process_displayname',
      header: 'Proccess',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      field: 'owner',
      header: 'Owner',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      field: 'h_time',
      header: 'start',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      field: 'h_execution_time',
      header: 'Execution Time',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      field: 'count_objects',
      header: 'Asteroids',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
  ];

  componentDidMount() {
    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  fetchData = ({ page, sizePerPage, sortField, sortOrder }) => {
    this.setState({ loading: true });

    this.api
      .getPredictionRuns({ page, sizePerPage, sortField, sortOrder })
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

  actionTemplate = rowData => {
    const id = rowData.id;
    let btn_view = null;
    let btn_log = null;

    if (rowData.status !== 'success') {
      btn_view = (
        <Button
          type="button"
          icon="fa fa-search"
          className="ui-button-info"
          disabled={true}
          title="View"
          onClick={() => this.onView(id)}
        />
      );
      btn_log = (
        <Button
          type="button"
          icon="fa fa-file-text-o"
          className="ui-button-warning"
          title="Log"
          disabled={true}
          onClick={() => this.onLog(id)}
        />
      );
      return (
        <div>
          {btn_view}
          {btn_log}
        </div>
      );
    } else {
      btn_view = (
        <Button
          type="button"
          icon="fa fa-search"
          className="ui-button-info"
          title="View"
          onClick={() => this.onView(id)}
        />
      );
      btn_log = (
        <Button
          type="button"
          icon="fa fa-file-text-o"
          className="ui-button-warning"
          title="Log"
          onClick={() => this.onLog(id)}
        />
      );
      return (
        <div>
          {btn_view}
          {btn_log}
        </div>
      );
    }
  };

  status_table = rowData => {
    const row = rowData.status;
    const status = [
      { state: 'running' },
      { state: 'warning' },
      { state: 'success' },
      { state: 'failure' },
    ];

    return status.map((el, i) => {
      if (row == el.state) {
        return (
          <div key={i} className={`status_table ${el.state}`}>
            {row}
          </div>
        );
      }
    });
  };

  toolbarButton = el => {
    let btn_view_toolbar = null;
    let btn_reexecute = null;

    btn_reexecute = (
      <Button
        className="btn-TNO-color"
        label="Re-execute"
        disabled={!this.state.selected}
        onClick={this.handleOnRerun}
      />
    );

    btn_view_toolbar = (
      <Button
        className="btn-TNO-color"
        label="Detail"
        disabled={!this.state.selected}
        // onClick={this.stdetails}
        onClick={() => this.onView(el.id)}
      />
    );

    return (
      <Toolbar>
        {btn_reexecute}
        {btn_view_toolbar}
      </Toolbar>
    );
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
        page: this.state.page,
        sizePerPage: this.state.sizePerPage,
        sortField: e.sortField,
        sortOrder: e.sortOrder,
      })
    );
  };

  onView = id => {
    this.props.view_prediction(id);
  };

  handleOnRerun = () => {
    const { selected } = this.state;

    this.api.predictReRun({ id: selected.id }).then(res => {
      this.setState(
        {
          selected: null,
        },
        this.props.onRerun(res.data)
      );
    });
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
      <div>
        {this.toolbarButton(this.state.selected)}

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
          selectionMode="single"
          selection={this.state.selected}
          onSelectionChange={e => this.setState({ selected: e.data })}
        >
          <Column
            header="Status"
            body={this.status_table}
            style={{ textAlign: 'center', width: '6em' }}
          />
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

export default PredictionHistory;
