import React, { Component } from 'react';
import { Table, OverlayTrigger, Popover, Button } from 'react-bootstrap';
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
      help_text: 'pointing',
    },
    {
      text: 'Object Name',
      dataField: 'name',
      help_text: 'Object name (official or provisional designation).',
    },
    {
      text: 'Object classification',
      dataField: 'dynclass',
      help_text: 'Object class (TNO, Centaur, Trojan, etc.).',
    },
    {
      text: 'RA',
      dataField: 'ra',
      help_text: 'Right ascension of the identified object.',
    },
    {
      text: 'Dec',
      dataField: 'dec',
      help_text: 'Declination of the identified object.',
    },
    {
      text: 'Mv',
      dataField: 'mv',
      help_text: 'Visual magnitude',
    },
    {
      text: 'D',
      dataField: 'd',
      help_text: 'Body-to-center angular distance',
    },
    {
      text: 'dRAcosDec',
      dataField: 'dracosdec',
      help_text: 'Motion in right ascension d(RA)cos(DEC)',
    },
    {
      text: 'dDEC',
      dataField: 'ddec',
      help_text: 'Motion in declination d(DEC)',
    },
    {
      text: 'Dgeo',
      dataField: 'dgeo',
      help_text: 'Distance from observer',
    },
    {
      text: 'Dhelio',
      dataField: 'dhelio',
      help_text: 'Distance from the Sun',
    },
    {
      text: 'Phase',
      dataField: 'phase',
      help_text:
        'Phase angle, e.g. elongation of earth from sun as seen from object',
    },
    {
      text: 'SolElong',
      dataField: 'solelong',
      help_text:
        'Solar elongation, e.g. elongation of object from sun as seen from Earth',
    },
    {
      text: 'Px',
      dataField: 'px',
      help_text: 'Mean J2000 heliocentric position vector, x component',
    },
    {
      text: 'Py',
      dataField: 'py',
      help_text: 'Mean J2000 heliocentric position vector, y component',
    },
    {
      text: 'Vx ',
      dataField: 'vx',
      help_text: 'Mean J2000 heliocentric position vector, z component',
    },
    {
      text: 'Vy ',
      dataField: 'vy',
      help_text: 'Mean J2000 heliocentric velocity vector, y component',
    },
    {
      text: 'Vz ',
      dataField: 'vz',
      help_text: 'Mean J2000 heliocentric velocity vector, z component',
    },
    {
      text: 'JDRef ',
      dataField: 'jdref',
      help_text: 'Reference epoch of the position/velocity vector',
    },
    {
      text: 'ExternalLink ',
      dataField: 'externallink',
      help_text: 'External link to hint the target',
    },
    {
      text: 'Exposure',
      dataField: 'expnum',
      help_text:
        'Unique identifier for each image, same function as pfw_attenp_id (it also recorded in the file name)',
    },
    {
      text: 'CCD',
      dataField: 'ccdnum',
      help_text: 'CCD Number (1, 2, ..., 62)',
    },
    {
      text: 'Filter',
      dataField: 'band',
      help_text: 'Filter used to do the observation (u, g, r, i, z, Y).',
    },
  ];

  render() {
    const { record } = this.props;

    const body = [];

    if (Object.keys(record).length) {
      this.record_properties.forEach((p, i) => {
        const { text, dataField, help_text } = p;

        let value = null;

        const popoverClickRootClose = (
          <Popover id="`popover-trigger-click-root-close-{i}`" title={p.text}>
            {help_text}
          </Popover>
        );

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
          <OverlayTrigger
            trigger={['click']}
            placement="bottom"
            rootClose
            overlay={popoverClickRootClose}
          >
            <tr key={i}>
              <td width="200">{text}:</td>
              <td width="200">{value}</td>
            </tr>
          </OverlayTrigger>,
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
