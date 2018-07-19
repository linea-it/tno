import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import { ButtonToolbar, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatDateUTC, formatColumnHeader, formatStatus } from 'utils';
import ReactInterval from 'react-interval';
import OrbitApi from './OrbitApi';

const columns = [
  {
    text: 'Proccess',
    dataField: 'proccess',
    width: 80,
    align: 'center',
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Run Id',
    dataField: 'id',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Owner',
    dataField: 'owner',
    width: 120,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Start',
    dataField: 'start_time',
    formatter: formatDateUTC,
  },
  {
    text: 'Finish',
    dataField: 'finish_time',
    formatter: formatDateUTC,
  },
  {
    text: 'Status',
    dataField: 'status',
    width: 80,
    align: 'center',
    headerStyle: formatColumnHeader,
    classes: formatStatus,
  },
];

class RefineOrbitHistory extends Component {
  state = this.initialState;
  api = new OrbitApi();

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

  handleOnRerun = () => {
    const { selected_record } = this.state;

    this.api.orbitReRun({ id: selected_record.id }).then(res => {
      const record = res.data;

      this.setState(
        { selected: [], selected_record: null },
        this.props.onRerun(record)
      );
    });
  };

  handleOnSelect = (row, isSelect) => {
    console.log(row);
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

  render() {
    const {
      data,
      sizePerPage,
      page,
      totalSize,
      loading,
      reload_interval,
      selected,
      selected_record,
    } = this.state;

    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hidePageListOnlyOnePage: true,
      showTotal: true,
    });

    const selectRow = {
      mode: 'radio',
      clickToSelect: true,
      onSelect: this.handleOnSelect,
      selected: selected,
    };

    const history = this.props.history;
    const rowEvents = {
      onDoubleClick: (e, row) => {
        history.push('/astrometry_run/' + row.id);
      },
    };

    return (
      <div>
        <ReactInterval
          timeout={reload_interval * 1000}
          enabled={true}
          callback={this.reload}
        />
        <Card
          title=""
          category="Manage the completed NIMA rounds"
          content={
            <div>
              <ButtonToolbar>
                <Button
                  disabled={!selected_record}
                  onClick={this.handleOnRerun}
                >
                  Re-execute
                </Button>
              </ButtonToolbar>
              <BootstrapTable
                striped
                hover
                condensed
                remote
                bordered={false}
                keyField="id"
                noDataIndication="..."
                data={data}
                columns={columns}
                pagination={pagination}
                onTableChange={this.handleTableChange}
                loading={loading}
                overlay={overlayFactory({
                  spinner: true,
                  background: 'rgba(192,192,192,0.3)',
                })}
                rowEvents={rowEvents}
                selectRow={selectRow}
              />
            </div>
          }
        />
      </div>
    );
  }
}

export default withRouter(RefineOrbitHistory);
