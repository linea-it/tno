import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import PraiaApi from './PraiaApi';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatDateUTC, formatColumnHeader, formatStatus } from 'utils';
import ReactInterval from 'react-interval';

const columns = [
  {
    text: 'Id',
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
    text: 'Input',
    dataField: 'input_displayname',
  },
  {
    text: 'Configuration',
    dataField: 'configuration_displayname',
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

class PraiaHistory extends Component {
  state = this.initialState;
  api = new PraiaApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
    loading: PropTypes.bool,
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

  render() {
    const {
      data,
      sizePerPage,
      page,
      totalSize,
      loading,
      reload_interval,
    } = this.state;
    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hidePageListOnlyOnePage: true,
      showTotal: true,
    });

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
          category="Manage the completed Astrometry rounds"
          content={
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
            />
          }
        />
      </div>
    );
  }
}

export default withRouter(PraiaHistory);
