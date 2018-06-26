import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
// import ObjectApi from './ObjectApi';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class SkybotDetail extends Component {
  // state = this.initialState;
  // api = new SkybotApi();

  static propTypes = {
    // match: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
  };

  record_properties = [
    {
      text: 'ID',
      dataField: 'id',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Pointings',
      dataField: 'pointing',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Name',
      dataField: 'name',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Object classification',
      dataField: 'dynclass',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'RA',
      dataField: 'ra',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Dec',
      dataField: 'dec',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Mv',
      dataField: 'mv',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'D',
      dataField: 'd',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'dRAcosDec',
      dataField: 'dracosdec',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'dDEC',
      dataField: 'ddec',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Dgeo',
      dataField: 'dgeo',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Dhelio',
      dataField: 'dhelio',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Phase',
      dataField: 'phase',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'SolElong',
      dataField: 'solelong',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Px',
      dataField: 'px',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Py',
      dataField: 'py',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Vx ',
      dataField: 'vx',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Vy ',
      dataField: 'vy',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Vz ',
      dataField: 'vz',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'JDRef ',
      dataField: 'jdref',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'ExternalLink ',
      dataField: 'externallink',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Exposure',
      dataField: 'expnum',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'CCD',
      dataField: 'ccdnum',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'Filter',
      dataField: 'band',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
  ];

  // get initialState() {
  //   return {
  //     id: null,
  //     data: [],
  //     page: 1,
  //     totalSize: 0,
  //     sizePerPage: 10,
  //     loading: false,
  //   };
  // }

  // componentDidMount() {
  //   //console.log('componentDidMount');
  //   const {
  //     match: { params },
  //   } = this.props;
  //   // console.log('ID: ', params.id);

  //   this.api.getSkybotRecord({ id: params.id }).then(res => {
  //     const record = res.data;
  //     //console.log(record);

  //     this.setState({ record: record });
  //   });
  // }

  render() {
    const { record } = this.props;

    //console.log('Render: record(%o)', record);

    const body = [];
    //console.log('Record Keys: %o', Object.keys(record));
    if (Object.keys(record).length) {
      //console.log('TEM');
      this.record_properties.forEach((p, i) => {
        const { text, dataField } = p;

        body.push(
          <tr key={i}>
            <td width="200">
              <b> {text} </b>:
            </td>
            <td width="200-">{record[dataField].toString()}</td>
          </tr>
          
        );
      });
    }

    return (
      <div className="content">
        <Card
          title="Detail"
          category="{body.values}"
          content={
            <div>
              <Table>
                <tbody>{body}</tbody>
              </Table>
              <br />
            </div>
          }
        />
      </div>
    );
  }
}

export default withRouter(SkybotDetail);
