import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import OrbitApi from './OrbitApi';

import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';

import Content from 'components/CardContent/CardContent.jsx';
import ReactInterval from 'react-interval';

const columns = [
  {
    header: 'Proccess',
    field: 'proccess_displayname',
  },
  {
    header: 'Run Id',
    field: 'id',
  },
  {
    header: 'Owner',
    field: 'owner',
  },
  {
    header: 'Start',
    field: 'h_time',
  },
  {
    header: 'Execution Time',
    field: 'h_execution_time',
  },
  {
    header: 'Asteroids',
    field: 'count_objects',
  },
  {
    header: 'Finish',
    field: 'finish_time',
  },
  {
    header: 'Status',
    dataField: 'status',
  },
];

class RefineOrbitHistory extends Component {
  state = this.initialState;
  api = new OrbitApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
    loading: PropTypes.bool,
    onRerun: PropTypes.func.isRequired,
    view_orbit: PropTypes.func.isRequired,
  };

  get initialState() {
    return {
      data: [],
      page: 1,
      totalSize: 0,
      first: 0,

      sizePerPage: 10,
      loading: false,
      // Tempo em segundos entre cada reload da lista
      reload_interval: 10,
      selected: [],
    };
  }

  componentDidMount() {
    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  componentWillReceiveProps() {
    // Atualiza o Conteudo da datagrid toda vez que recebe uma propriedade
    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    this.fetchData(page, sizePerPage);
  };

  fetchData = (page, sizePerPage) => {
    // console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

    this.setState({ loading: true });

    this.api.getOrbitRuns({ page: page, pageSize: sizePerPage }).then(res => {
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
      if (row === el.state) {
        return (
          <div key={i} className={`status_table ${el.state}`}>
            {row}
          </div>
        );
      }
      // return;
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

  onView = id => {
    this.props.view_orbit(id);
  };

  handleOnRerun = () => {
    const { selected } = this.state;

    if (selected) {
      this.api.orbitReRun({ id: selected.id }).then(res => {
        const record = res.data;

        this.setState({ selected: [] }, this.props.onRerun(record));
      });
    }
  };

  render() {
    const dynamicColumns = columns.map((col, i) => {
      return <Column key={col.field} field={col.field} header={col.header} />;
    });

    return (
      <div>
        <Content
          content={
            <div className="ui-g">
              <div className="ui-lg-12">
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
                  {dynamicColumns}

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
            </div>
          }
        />
      </div>
    );
  }
}

export default withRouter(RefineOrbitHistory);
