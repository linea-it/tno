import React, { Component } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import Button from 'elements/CustomButton/CustomButton.jsx';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import axios from 'axios';
const api = process.env.REACT_APP_API;

const columns = [
  // { dataField: 'object_table', text: 'Table' },
  { dataField: 'name', text: 'Name' },
  { dataField: 'freq', text: 'Freq' },
  { dataField: 'more_than_one_filter', text: 'More Than One Filter' },
  { dataField: 'filters', text: 'Filters' },
  { dataField: 'mag_min', text: 'Mag Min' },
  { dataField: 'mag_max', text: 'Mag Max' },
  { dataField: 'min_errpos', text: 'Min errpos' },
  { dataField: 'max_errpos', text: 'Max errpos' },
  { dataField: 'diff_nights', text: 'Diff Nights' },
  { dataField: 'diff_date_nights', text: 'Diff Date Max' },
];

const RemotePagination = ({
  data,
  page,
  sizePerPage,
  onTableChange,
  totalSize,
}) => (
  <div>
    <BootstrapTable
      remote
      keyField="id"
      data={data}
      columns={columns}
      pagination={paginationFactory({ page, sizePerPage, totalSize })}
      onTableChange={onTableChange}
      striped
      hover
      noDataIndication="no results to display"
    />
  </div>
);

class FilterObjectTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
      filters: {},
      searchPattern: {},
      haveData: true,
    };
  }

  // TODO: Alterar esse metodo que vai ser depreciado:
  // https://rocketseat.com.br/blog/context-api-react-16-ciclo-de-vida/
  // getDerivedStateFromProps
  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps(%o)', nextProps);
    this.setState({
      filters: nextProps.filters,
      searchPattern: nextProps.searchPattern,
    });

    this.fetchData({
      filters: nextProps.filters,
      page: this.state.page,
      pattern: nextProps.searchPattern,
    });
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    console.log('handleTableChange()');

    this.fetchData({
      filters: this.state.filters,
      pattern: this.state.searchPattern,
      page: page,
    });
  };

  fetchData = ({ filters = {}, page = 1, pattern }, cb) => {
    console.log('fetchData()', filters, page, pattern);

    if (Object.keys(filters).length === 0 && !pattern) {
      console.log('nao faz nada');
      // Se nao tiver filtro nao executa o request
      this.setState({
        data: [],
        totalSize: 0,
        page: 1,
        loading: false,
      });
    } else {
      this.setState({ loading: true });

      filters.page = page;
      filters.pageSize = this.state.sizePerPage;

      if (pattern) {
        filters.name = pattern;
      }

      axios
        .get(`${api}/skybotoutput/objects`, {
          params: filters,
        })
        .then(res => {
          var r = res.data;
          if (r.success) {
            // Add a Fake ID for suppres warning
            r.results.forEach(function(row, i) {
              row.fake_id = i;
            });
            this.setState({
              data: r.results,
              totalSize: r.count,
              page: page,
              loading: false,
            });
          }
        });
    }
  };

  render() {
    console.log('render()');
    const {
      data,
      sizePerPage,
      page,
      totalSize,
      loading,
      haveData,
    } = this.state;
    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      // sizePerPageList: [50, 100, 200],
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
    });

    var rowsCount = '';
    if (totalSize > 0) {
      rowsCount = totalSize + ' Rows';
    }
    return (
      <div>
        <ButtonToolbar>
          <Button
            bsStyle="info"
            fill
            disabled={!haveData}
            onClick={this.props.saveList}
          >
            Save
          </Button>
        </ButtonToolbar>
        <BootstrapTable
          striped
          hover
          remote
          keyField="fake_id"
          noDataIndication="no results to display"
          data={data}
          columns={columns}
          pagination={pagination}
          onTableChange={this.handleTableChange}
          loading={loading}
          overlay={overlayFactory({
            spinner: true,
            background: 'rgba(192,192,192,0.3)',
          })}
        />
        <p className="text-left">{rowsCount}</p>
      </div>
    );
  }
}

export default FilterObjectTable;
