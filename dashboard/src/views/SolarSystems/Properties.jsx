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
      text: 'Object Name',
      dataField: 'name',
    },
    {
      text: 'Dynamic class',
      dataField: 'dynclass',
    },
    {
      text: 'Right Ascension (RA) [hms]',
      dataField: 'ra',
    },
    {
      text: 'Declination (Dec) [dms]',
      dataField: 'dec',
    },
    {
      text: 'Visual Magnitude',
      dataField: 'mv',
    },
    {
      text: 'Error on the position [arcsec]',
      dataField: 'errpos',
    },
    {
      text: 'Angular distance [arcsec]',
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
      text: 'Right Ascension (RA) [degree]',
      dataField: 'raj2000',
    },
    {
      text: 'Declination (Dec) [degree]',
      dataField: 'decj2000',
    },
    {
      text: 'Geocentric distance [AU]',
      dataField: 'dgeo',
    },
    {
      text: 'Heliocentric distance [AU]',
      dataField: 'dhelio',
    },
    {
      text: 'Phase angle [degrees]',
      dataField: 'phase',
    },
    {
      text: 'Solar elongation [degree]',
      dataField: 'solelong',
    },
    {
      text: 'Vector position in x [AU]',
      dataField: 'px',
    },
    {
      text: 'Vector position in y [AU]',
      dataField: 'py',
    },
    {
      text: 'Vector position in z [AU]',
      dataField: 'pz',
    },
    {
      text: 'Vector motion in x [AU/d]',
      dataField: 'vx',
    },
    {
      text: 'Vector motion in y [AU/d]',
      dataField: 'vy',
    },
    {
      text: 'Vector motion in z [AU/d]',
      dataField: 'vz',
    },
    {
      text: 'Epoch of the position vector [Julien Day] ',
      dataField: 'jdref',
    },
    {
      text: 'Band',
      dataField: 'band',
    },
    {
      text: 'Exposure',
      dataField: 'expnum',
    },
    {
      text: 'CCD number',
      dataField: 'ccdnum',
    },
    {
      text: 'ExternalLink ',
      dataField: 'externallink',
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
