import React, { Component } from 'react';

class OccultedStar extends Component {
  render() {
    return (
      <div>
        <table
          className="simple_property_table"
          style={{
            textAlign: 'center',
            width: '100%',
          }}
        >
          <tbody>
            <tr>
              <td>
                <b>Star source ID </b>{' '}
              </td>
              <td> 4895411253060622848 </td>
            </tr>
            <tr>
              <td>
                <b>Stellar catalogue</b>{' '}
              </td>
              <td> GAIADR2 </td>
            </tr>
            <tr>
              <td>
                <b>Star astrometric position in catalogue (ICRF)</b>{' '}
              </td>
              <td> 04 41 24.9896 -22 07 03.334 </td>
            </tr>
            <tr>
              <td>
                <b>Star astrometric position with proper motion (ICRF)</b>{' '}
              </td>
              <td> 04 41 24.9912 -22 07 03.430 </td>
            </tr>
            <tr>
              <td>
                <b>Star apparent position (date)</b>{' '}
              </td>
              <td> 04 42 12.3515 -22 05 04.584 </td>
            </tr>
            <tr>
              <td>
                <b>Proper motion</b>{' '}
              </td>
              <td> μRA* = (5.5 ± 0.1)mas; μDEC = (-24.6 ± 0.1) mas </td>
            </tr>
            <tr>
              <td>
                <b>Source of proper motion</b>{' '}
              </td>
              <td>GAIADR2</td>
            </tr>
            <tr>
              <td>
                <b>Uncertainty in the star position</b>{' '}
              </td>
              <td> RA* = 0.2 mas; DEC= 0.3 mas </td>
            </tr>
            <tr>
              <td>
                <b>G magnitude</b>{' '}
              </td>
              <td> 14.6 </td>
            </tr>
            <tr>
              <td>
                <b>RP magnitude (source: GaiaDR2)</b>{' '}
              </td>
              <td> 13.8 </td>
            </tr>

            <tr>
              <td>
                <b>BP magnitude (source: GaiaDR2)</b>{' '}
              </td>
              <td> 15.3 </td>
            </tr>
            <tr>
              <td>
                <b>J magnitude (source: 2MASS)</b>{' '}
              </td>
              <td> 12.7 </td>
            </tr>
            <tr>
              <td>
                <b>H magnitude (source: 2MASS)</b>{' '}
              </td>
              <td> 12.1 </td>
            </tr>
            <tr>
              <td>
                <b>K magnitude (source: 2MASS)</b>{' '}
              </td>
              <td> 11.9 </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default OccultedStar;
