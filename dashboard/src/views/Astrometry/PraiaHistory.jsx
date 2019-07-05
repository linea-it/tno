import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import PraiaApi from './PraiaApi';
import PropTypes from 'prop-types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { formatColumnHeader } from 'utils';
import ReactInterval from 'react-interval';

class PraiaHistory extends Component {
  state = this.initialState;
  api = new PraiaApi();

  static propTypes = {
    onRerun: PropTypes.func.isRequired,
  };

  get initialState() {
    return {
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
      // Tempo em segundos entre cada reload da lista
      reload_interval: 10,
      selected: null,
      first: null,
      sortField: null,
      sortOrder: null,
    };
  }

  columns = [
    {
      header: 'Proccess',
      field: 'proccess_displayname',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      header: 'Owner',
      field: 'owner',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      header: 'Input',
      field: 'input_displayname',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      header: 'Configuration',
      field: 'configuration_displayname',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      header: 'Start',
      field: 'start_time',
      headerStyle: formatColumnHeader,
      sortable: true,
    },
    {
      header: 'Finish',
      field: 'finish_time',
      headerStyle: formatColumnHeader,
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
    // console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

    this.setState({ loading: true });

    this.api.getPraiaRuns({ page: page, pageSize: sizePerPage }).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        page: page,
        sizePerPage: sizePerPage,
        loading: false,
      });
    });
  };

  reload = () => {
    this.fetchData(this.state.page, this.state.sizePerPage);
  };

  handleOnRerun = () => {
    const { selected } = this.state;

    this.api.praiaReRun({ id: selected.id }).then(res => {
      const record = res.data;

      this.setState({ selected: null }, this.props.onRerun(record));
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
        page: page,
        sizePerPage: e.rows,
        sortField: this.state.sortField,
        sortOrder: this.state.sortOrder,
      })
    );
  };

  status_table = rowData => {
    const row = rowData.status;
    const status = [
      { state: 'running' },
      { state: 'warning' },
      { state: 'success' },
      { state: 'failure' },
      { state: 'reexecute' },
    ];

    return status.map((el, i) => {
      if (row === el.state) {
        console.log(row, el.state)
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

    return (
      <Toolbar>
        {btn_reexecute}
        {btn_view_toolbar}
      </Toolbar>
    );
  };
  render() {
    const {
      data,
      sizePerPage,
      // page,
      totalSize,
      // loading,
      reload_interval,
      // selected,
      // selected_record,
    } = this.state;

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
      <div style={{ margin: '14px' }}>
        <ReactInterval
          timeout={reload_interval * 1000}
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
        </DataTable>

        <Paginator
          rows={sizePerPage}
          totalRecords={totalSize}
          first={this.state.first}
          onPageChange={this.onPageChange}
        />
      </div>
    );
  }
}

export default PraiaHistory;
