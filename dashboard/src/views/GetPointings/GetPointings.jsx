import React, { Component } from 'react';
import {
  FormGroup,
  FormControl,
  InputGroup,
  ButtonToolbar,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Button from 'elements/CustomButton/CustomButton.jsx';
import PointingApi from './PointingApi';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatDateUTC, formatColumnHeader } from 'utils';

function exposureFormatter(cell, row, rowindex, formatExtraData) {
  // console.log(row);
  // console.log(row.downloaded);
  if (row.downloaded) {
    return <i className={formatExtraData['success']} />;
  } else {
    return <i className={formatExtraData['failure']} />;
  }
}

const pointing_columns = [
  {
    text: 'ID',
    dataField: 'id',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Data de Observação',
    dataField: 'date_obs',
    width: 180,
    headerStyle: formatColumnHeader,
    formatter: formatDateUTC,
  },
  {
    text: 'Exposure',
    dataField: 'expnum',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'CDD',
    dataField: 'ccdnum',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Filter',
    dataField: 'band',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'downloaded',
    dataField: 'downloaded',
    align: 'center',
    formatter: exposureFormatter,
    formatExtraData: {
      success: 'fa fa-check text-success',
      failure: 'fa fa-exclamation-triangle text-warning',
    },
    width: 80,
    headerStyle: formatColumnHeader,
  },
];

class GetPointings extends Component {
  state = this.initialState;
  api = new PointingApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: null,
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
    };
  }

  componentDidMount() {
    // console.log('componentDidMount()');
    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    // console.log('handleTableChange(%o, %o)', page, sizePerPage);

    this.fetchData(page, sizePerPage);
  };

  handleSubmit(event) {
    event.preventDefault();
    // Apenas executa o metodo do component parent passando o termo que foi
    // usado na busca.
    if (this.state.search) {
      this.props.onSearch(this.state.search);
    }
  }

  fetchData = (page, pageSize, search) => {
    console.log('fetchData(%o, %o, %o)', page, pageSize);

    this.setState({ loading: true });

    this.api
      .getPointingLists({
        page: page,
        pageSize: pageSize,
        search_fields: search,
      })
      .then(res => {
        console.log('Carregou: %o', res);
        const r = res.data;
        this.setState({
          data: r.results,
          totalSize: r.count,
          page: page,
          loading: false,
        });
      });
  };

  render() {
    const { data, sizePerPage, page, totalSize, loading } = this.state;
    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      showTotal: true,
    });

    return (
      <div className="content">
        <div>
          <ButtonToolbar>
            <form>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder="Search By id, expnum, filename"
                    value={this.state.search}
                    onChange={this.handleChange}
                  />
                  <InputGroup.Button>
                    <Button onClick={this.handleSubmit}>Search</Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
              <div className="clearfix" />
            </form>
          </ButtonToolbar>
          <BootstrapTable
            striped
            hover
            condensed
            remote
            bordered={false}
            keyField="id"
            noDataIndication="no results to display"
            data={data}
            columns={pointing_columns}
            pagination={pagination}
            onTableChange={this.handleTableChange}
            loading={loading}
            overlay={overlayFactory({
              spinner: true,
              background: 'rgba(192,192,192,0.3)',
            })}
          />
          <span>{totalSize} rows</span>
        </div>
      </div>
    );
  }
}

export default withRouter(GetPointings);
