import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
// import ObjectApi from './ObjectApi';
import PropTypes from 'prop-types';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';


import SkybotApi from './SkybotApi';
import GetSkybot from './GetSkybot';

class SkybotDetail extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  get initialState() {
    return {
      id: null,
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
      getSkybot: '',
    };
  }

  componentDidMount() {
    const {
        match: { params },
      } = this.props;
  
      this.api.getListStats({ id: params.id }).then(res => {
        const data = res.data.data;
  
        this.setState(
          {
            id: res.data.id,
            getSkybot: data,
          },
        //   this.fetchData(this.state.page, this.state.sizePerPage)
        );
      });
    }
  handleTableChange = (type, { page, sizePerPage }) => {
    // console.log('handleTableChange(%o, %o)', page, sizePerPage);

    const tablename = this.state.customList.tablename;
    this.fetchData(tablename, page, sizePerPage);
  };

//   fetchData = (tablename, page, pageSize) => {
//     // console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

//     this.setState({ loading: true });

//     // this.api
//     //   .listObjects({ tablename: tablename, page: page, pageSize: pageSize })
//     //   .then(res => {
//     //     const r = res.data;
//     //     this.setState({
//     //       data: r.results,
//     //       totalSize: r.count,
//     //       page: page,
//     //       loading: false,
//     //     });
//     //   });
//   };

  render() {
    const {
      data,
      sizePerPage,
      page,
      totalSize,
      loading,
      getSkybot,
    } = this.state;
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
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Detail"
                category=""
                content={
                  <div>
                    <span>
                      <b>Owner:</b> {getSkybot.pointing}
                    </span>
                    {/* <br />
                    <span>
                      <b>Display Name:</b> {customList.displayname}
                    </span>
                    <br />
                    <span>
                      <b>Tablename:</b> {customList.tablename}
                    </span>
                    <br />
                    <br />
                    <span>
                      <b>Description:</b> {customList.description}
                    </span>
                    <br />
                    <span>
                      <b>Objects:</b> {customList.distinct_objects}
                    </span>
                    <br />
                    <span>
                      <b>Rows:</b> {customList.rows}
                    </span>
                    <br />
                    <span>
                      <b>Pointings:</b> {customList.distinct_pointing}
                    </span>
                    <br />
                    <span>
                      <b>Objects not on CCD:</b> {customList.missing_pointing}
                    </span>
                    <br />
                    <span>
                      <b>Class:</b> {customList.filter_dynclass}
                    </span>
                    <br />
                    <span>
                      <b>Magnitude:</b>  {}
                    </span>
                    <br />
                    <span>
                      <b>Minimun difference time between observations:</b>
                      {customList.filter_diffdatenights}
                    </span>
                    <br />
                    <span>
                      <b>More than one Filter:</b>{' '}
                      {customList.filter_morefilter}
                    </span>
                    <br />
                    <span>
                      <b>Filter by Name:</b> {customList.filter_name}
                    </span>
                    <br /> */}
                  </div>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(SkybotDetail);
