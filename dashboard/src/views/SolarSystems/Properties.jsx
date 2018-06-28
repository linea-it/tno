import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class SkybotDetail extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
  };

  record_properties = [
    {
      text: 'Pointings',
      dataField: 'pointing',
    },
    {
      text: 'Name',
      dataField: 'name',
    },
    {
      text: 'Object classification',
      dataField: 'dynclass',
    },
    {
      text: 'RA',
      dataField: 'ra',
    },
    {
      text: 'Dec',
      dataField: 'dec',
    },
    {
      text: 'Mv',
      dataField: 'mv',
    },
    {
      text: 'D',
      dataField: 'd',
    },
    {
      text: 'dRAcosDec',
      dataField: 'dracosdec',
    },
    {
      text: 'dDEC',
      dataField: 'ddec',
    },
    {
      text: 'Dgeo',
      dataField: 'dgeo',
    },
    {
      text: 'Dhelio',
      dataField: 'dhelio',
    },
    {
      text: 'Phase',
      dataField: 'phase',
    },
    {
      text: 'SolElong',
      dataField: 'solelong',
    },
    {
      text: 'Px',
      dataField: 'px',
    },
    {
      text: 'Py',
      dataField: 'py',
    },
    {
      text: 'Vx ',
      dataField: 'vx',
    },
    {
      text: 'Vy ',
      dataField: 'vy',
    },
    {
      text: 'Vz ',
      dataField: 'vz',
    },
    {
      text: 'JDRef ',
      dataField: 'jdref',
    },
    {
      text: 'ExternalLink ',
      dataField: 'externallink',
    },
    {
      text: 'Exposure',
      dataField: 'expnum',
    },
    {
      text: 'CCD',
      dataField: 'ccdnum',
    },
    {
      text: 'Filter',
      dataField: 'band',
    },
  ];

  render() {
    const { record } = this.props;

    const body = [];

    if (Object.keys(record).length) {
      this.record_properties.forEach((p, i) => {
        const { text, dataField } = p;

        let value = null;

        if (p.dataField === 'externallink') {
          value = (
            <a target="blank" href={record[dataField]}>
              open link
            </a>
          );
        } else {
          value = record[dataField];
        }

        body.push([
          <tr key={i}>
            <td width="200">
              <b> {text} </b>:
            </td>
            <td width="200">{value}</td>
          </tr>,
        ]);
      });
    }

    return (
      <div className="content">
        <Card
          title="SkyBot Output"
          category=""
          content={
            <div>
              <Table striped bordered condensed hover>
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
