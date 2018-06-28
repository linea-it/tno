import React, { Component } from 'react';
import { Col, Table, OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
// import ObjectApi from './ObjectApi';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class PropertiesPointing extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  record_properties = [
    {
      text: 'Image Id',
      dataField: 'pfw_attempt_id',
      helpText:
        'Unique identifier for each image (1 image is composed by 62 CCDs)',
    },
    {
      text: 'CCD Id',
      dataField: 'desfile_id',
      helpText: 'Unique identifier for each CCD.',
    },
    {
      text: 'Night',
      dataField: 'nite',
      helpText: 'Night at which the observation was made.',
    },
    {
      text: 'Observation Date',
      dataField: 'date_obs',
      helpText: 'Date and time of observation',
    },
    {
      text: 'Exposure',
      dataField: 'expnum',
      helpText:
        'Unique identifier for each image, same function as pfw_attenp_id (it also recorded in the file name)',
    },
    {
      text: 'CCD',
      dataField: 'ccdnum',
      helpText: 'CCD Number (1, 2, ..., 62)',
    },
    {
      text: 'Filter',
      dataField: 'band',
      helpText: 'Filter used to do the observation (u, g, r, i, z, Y).',
    },

    {
      text: 'Exposure time',
      dataField: 'exptime',
      helpText: 'Exposure time of observation.',
    },

    {
      text: 'Cloud apass',
      dataField: 'cloud_apass',
      helpText: 'Atmospheric extinction in magnitudes',
    },

    {
      text: 'Cloud nomad',
      dataField: 'cloud_nomad',
      helpText: 'Atmospheric extinction in magnitudes',
    },

    {
      text: 't_eff',
      dataField: 't_eff',
      helpText: 'Parameter related to image quality',
    },

    {
      text: 'Cross RA 0',
      dataField: 'crossra0',
    },
    {
      text: 'RA (deg)',
      dataField: 'radeg',
    },
    {
      text: 'Dec (deg)',
      dataField: 'decdeg',
    },
    {
      text: 'racmin',
      dataField: 'racmin',
      helpText: 'Minimal right ascension respectively of the CCD cover.',
    },
    {
      text: 'racmax',
      dataField: 'racmax',
      helpText: 'Maximum right ascension respectively of the CCD cover.',
    },
    {
      text: 'deccmin',
      dataField: 'deccmin',
      helpText: 'Minimum declination respectively of the CCD cover.',
    },
    {
      text: 'deccmax',
      dataField: 'deccmax',
      helpText: 'Maximum declination respectively of the CCD cover.',
    },
    {
      text: 'ra_cent',
      dataField: 'ra_cent',
      helpText: 'Right ascension of the CCD center',
    },
    {
      text: 'dec_cent',
      dataField: 'dec_cent',
      helpText: 'Declination of the CCD center',
    },
    {
      text: 'rac1',
      dataField: 'rac1',
      helpText: 'CCD Corner Coordinates 1 - upper left.',
    },
    {
      text: 'rac2',
      dataField: 'rac2',
      helpText: 'CCD Corner Coordinates 2 - lower left.',
    },
    {
      text: 'rac3',
      dataField: 'rac3',
      helpText: 'CCD Corner Coordinates 3 - lower right.',
    },
    {
      text: 'rac4',
      dataField: 'rac4',
      helpText: 'CCD Corner Coordinates 4 - upper right).',
    },
    {
      text: 'decc1',
      dataField: 'decc1',
      helpText: 'CCD Corner Coordinates 1 - upper left.',
    },
    {
      text: 'decc2',
      dataField: 'decc2',
      helpText: 'CCD Corner Coordinates 2 - lower left.',
    },
    {
      text: 'decc3',
      dataField: 'decc3',
      helpText: 'CCD Corner Coordinates 3 - lower right.)',
    },
    {
      text: 'decc4',
      dataField: 'decc4',
      helpText: 'CCD Corner Coordinates 4 - upper right).',
    },
    {
      text: 'ra_size',
      dataField: 'ra_size',
      helpText: 'CCD dimensions in degrees (width × height).',
    },
    {
      text: 'dec_size',
      dataField: 'dec_size',
      helpText: 'CCD dimensions in degrees (width × height).',
    },
    {
      text: 'Path',
      dataField: 'path',
      helpText: 'Path in the DES database where the image is stored.',
    },
    {
      text: 'Filename',
      dataField: 'filename',
      helpText: 'Name of FITS file with a CCD image.',
    },
    {
      text: 'Compression',
      dataField: 'compression',
      helpText: 'Compression format (.fz) used in FITS files',
    },
    {
      text: 'Downloaded',
      dataField: 'downloaded',
      helpText: 'flag indicating whether the image was downloaded from DES.',
    },
  ];

  onClick = () => {
    this.props.history.goBack();
  };

  render() {
    const { record } = this.props;

    //console.log('Render: record(%o)', record);

    const body = [];
    //console.log('Record Keys: %o', Object.keys(record));
    if (Object.keys(record).length) {
      //console.log('TEM');
      this.record_properties.forEach((p, i) => {
        const { text, dataField, helpText } = p;

        const popoverHoverFocus = (
          <Popover id="`popover-trigger-hover-{i}`" title={p.text}>
            {helpText}
          </Popover>
        );

        let td_help = <td width="200" />;

        if (helpText) {
          td_help = (
            <td width="200">
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="right"
                overlay={popoverHoverFocus}
              >
                <i
                  onClick={this.showSubDetails}
                  className="fa fa-question text-medium-dark-gray"
                  aria-hidden="true"
                />
              </OverlayTrigger>
            </td>
          );
        }

        body.push([
          <tr key={i}>
            <td width="200">
              <b> {text} </b>:
            </td>
            <td width="200-">{record[dataField].toString()}</td>
            {td_help}
          </tr>,
        ]);
      });
    }

    return (
      <div className="content">
        <Card
          title="Details Pointing"
          category=""
          content={
            <div>
              <Col mdOffset={11}>
                <Button onClick={this.onClick}>back</Button>
              </Col>
              <br />
              <Table striped bordered condensed hover>
                <tbody>{body}</tbody>
              </Table>
              <Col mdOffset={11}>
                <Button onClick={this.onClick}>back</Button>
              </Col>
            </div>
          }
        />
      </div>
    );
  }
}

export default withRouter(PropertiesPointing);
