import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PraiaApi from './PraiaApi';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import ReactInterval from 'react-interval';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { DataTable, Column } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';

const columns = [
  {
    header: 'Proccess',
    field: 'proccess_displayname',
  },
  {
    header: 'Owner',
    field: 'owner',
  },
  {
    header: 'Input',
    field: 'input_displayname',
  },
  {
    header: 'Configuration',
    field: 'configuration_displayname',
  },
  {
    header: 'Start',
    field: 'start_time',
    width: 200,
  },
  {
    header: 'Finish',
    field: 'finish_time',
  },
];

class PraiaHistory extends Component {
  state = this.initialState;
  api = new PraiaApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
    loading: PropTypes.bool,
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
      selected: [],
      selected_record: null,
      first: null,
      sortField: null,
      sortOrder: null,
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

  handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      this.setState(() => ({
        selected: [row.id],
        selected_record: row,
      }));
    } else {
      this.setState(() => ({
        selected: [],
        selected_record: null,
      }));
    }
  };

  handleOnRerun = () => {
    const { selected_record } = this.state;

    this.api.praiaReRun({ id: selected_record.id }).then(res => {
      const record = res.data;

      this.setState(
        { selected: [], selected_record: null },
        this.props.onRerun(record)
      );
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

    const AstrometyColumns = columns.map((col, i) => {
      return (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          style={{ textAlign: 'center', width: col.width }}
        />
      );
    });

    // const pagination = paginationFactory({
    //   page: page,
    //   sizePerPage: sizePerPage,
    //   totalSize: totalSize,
    //   hidePageListOnlyOnePage: true,
    //   showTotal: true,
    // });

    // const history = this.props.history;
    // const rowEvents = {
    //   onDoubleClick: (e, row) => {
    //     history.push('/astrometry_run/' + row.id);
    //   },
    // };

    // const selectRow = {
    //   mode: 'radio',
    //   clickToSelect: true,
    //   onSelect: this.handleOnSelect,
    //   selected: selected,
    // };

    return (
      <div style={{ margin: '14px' }}>
        <DataTable
          value={data}
          selectionMode="single"
          selection={this.state.selected}
          onSelectionChange={e => this.setState({ selected: e.data })}
        >
          <Column
            header="Status"
            body={this.status_table}
            style={{ textAlign: 'center', width: '6em' }}
            selection={this.state.selected}
            onSelectionChange={e => this.setState({ selected: e.data })}
          />
          {AstrometyColumns}
        </DataTable>

        <Paginator
          rows={sizePerPage}
          totalRecords={totalSize}
          first={this.state.first}
          onPageChange={this.onPageChange}
        />
        <ReactInterval
          timeout={reload_interval * 1000}
          enabled={true}
          callback={this.reload}
        />
      </div>
    );
  }
}

export default withRouter(PraiaHistory);
