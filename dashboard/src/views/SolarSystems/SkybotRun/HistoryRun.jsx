/* eslint-disable no-undef */
// React e Prime React
import React, { Component } from 'react';

// interface components
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import PropTypes from 'prop-types';
import ReactInterval from 'react-interval';
import SkybotApi from '../SkybotApi.jsx';

class HistoryRun extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    handleView: PropTypes.func.isRequired,
    onRerun: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  get initialState() {
    return {
      data: [],
      loading: false,
      page: 1,
      first: 0,
      sizePerPage: 100,
      totalSize: 0,
      sortField: 'start',
      sortOrder: 0,
      asteroid_id: 0,
      reload_interval: 10,
      selected: null,
    };
  }

  columns = [
    {
      field: 'owner',
      header: 'Owner',
      sortable: false,
    },

    {
      field: 'h_execution_time',
      header: 'Execution Time',
      sortable: false,
    },

    {
      field: 'start',
      header: 'Start',
      sortable: true,
    },

    {
      field: 'type_run',
      header: 'Type',
      sortable: true,
      body: rowData => {
        let value = '';
        switch (rowData.type_run) {
          case 'all':
            value = 'All Pointings';
            break;
          case 'period':
            value = 'By Period';
            break;
          case 'square':
            value = 'Region Selection';
            break;
          case 'circle':
            value = 'Cone Search';
            break;
        }
        return value;
      },
    },


    {
      field: 'rows',
      header: 'Rows',
      sortable: true,
    },
    {
      field: 'exposure',
      header: 'Pointings',
      sortable: true,
    },


  ];

  componentDidMount() {
    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  componentWillReceiveProps() {
    // Atualiza o Conteudo da datagrid toda vez que recebe uma propriedade
    this.fetchData(
      this.state.page,
      this.state.sizePerPage,
      this.state.sortField,
      this.state.sortOrder
    );
  }

  fetchData = (page, sizePerPage, sortField, sortOrder) => {
    this.setState({ loading: true });

    this.api
      .getSkybotRunList(page, sizePerPage, sortField, sortOrder)
      .then(res => {
        const r = res.data;
        console.log(r);
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

  reload = () => {
    this.fetchData(this.state.page, this.state.sizePerPage);
  };

  actionTemplate = rowData => {
    const id = rowData.id;
    let btn_view = null;

    if (rowData.status === 'success') {
      btn_view = (
        <Button
          type="button"
          icon="fa fa-search"
          className="ui-button-info"
          title="View"
          onClick={() => this.onView(id)}
        />
      );
      return <div>{btn_view}</div>;
    }
  };

  status_table = rowData => {
    const row = rowData.status;
    const status = [
      { state: 'running' },
      { state: 'warning' },
      { state: 'success' },
      { state: 'failure' },
      { state: 'pending' },
      { state: 'canceled' },
    ];

    return status.map((el, i) => {
      if (row === el.state) {
        return (
          <div key={i} className={`status_table ${el.state}`}>
            {row}
          </div>
        );
      }
      return null;
    });
  };

  toolbarButton = el => {
    let btn_view_toolbar = null;
    let btn_reexecute = null;
    let btn_cancel = null;

    btn_reexecute = (
      <Button
        className="btn-TNO-color"
        label="Re-execute"
        disabled={!this.state.selected}
        onClick={this.handleOnRerun}
      />
    );

    var disabled = true;
    if (
      this.state.selected != null &&
      this.state.selected.status === 'success'
    ) {
      disabled = false;
    }

    btn_view_toolbar = (
      <Button
        className="btn-TNO-color"
        label="Detail"
        disabled={disabled}
        onClick={() => this.onView(el.id)}
      />
    );

    let disabled_cancel = true;
    if (
      this.state.selected != null &&
      this.state.selected.status !== 'success' &&
      this.state.selected.status !== 'failed' &&
      this.state.selected.status !== 'canceled'
    ) {
      disabled_cancel = false;
    }

    btn_cancel = (
      <Button
        className="btn-TNO-danger"
        label="Cancel"
        disabled={disabled_cancel}
        onClick={() => this.handleCancel(el.id)}
      />
    );

    return (
      <Toolbar>
        {btn_reexecute}
        {btn_view_toolbar}
        {btn_cancel}
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
    this.props.handleView(id);
  };

  handleOnRerun = () => {
    const { selected } = this.state;

    this.api.rerunSkybot(selected.id).then(res => {
      this.setState(
        {
          selected: null,
        },
        () => {
          this.reload();
          this.props.onRerun(res.data);
        }
      );
    });
  };

  handleCancel = () => {
    const { selected } = this.state;

    this.api.cancelSkybotRun(selected.id).then(res => {
      this.setState(
        {
          selected: null,
        },
        () => {
          this.reload();
          this.props.handleCancel(res.data);
        }
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
        <ReactInterval
          timeout={this.state.reload_interval * 1000}
          enabled={true}
          callback={this.reload}
        />
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

export default HistoryRun;
