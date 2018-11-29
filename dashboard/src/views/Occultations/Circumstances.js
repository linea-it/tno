import React, { Component } from 'react';

class Circumstances extends Component {
  render() {
    return (
      <div>
        <table style={{ textAlign: 'center', width: '640px', fontSize: '1em', color: '#333333'}}>
          <tbody>
            <tr>
              <td>
                <b>Date</b>
              </td>
              <td> Sat. 18 May. 2019 23:06:10 </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Right ascension and declination with assumed proper motion in ICRF/J2000">
                    Star position (ICRF)
                  </abbr>
                </b>{' '}
              </td>
              <td> 04 41 24.9912 -22 07 03.430 </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Geocentric closest approach (arcsec)">C/A</abbr>
                </b>
              </td>
              <td> 1.478 arcsec </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Planet position angle wrt to star at C/A (deg)">
                    P/A
                  </abbr>
                </b>{' '}
              </td>
              <td> 163.89 ° </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="velocity in plane of sky (positive= prograde, negative= retrograde)">
                    velocity{' '}
                  </abbr>
                </b>{' '}
              </td>
              <td> 35.85 km/s </td>
            </tr>
            <tr>
              <td>
                <b>Geocentric distance Δ </b>{' '}
              </td>
              <td> 22.2490 au </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Gaia magnitude corrected from velocity (Source: Gaia DR1)">
                    G mag*
                  </abbr>
                </b>{' '}
              </td>
              <td> 15.2 </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="RP magnitude corrected from velocity (Source: GaiaDR2)">
                    RP mag*
                  </abbr>
                </b>
              </td>
              <td> 14.4 </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="H magnitude corrected from velocity (Source: 2MASS)">
                    H mag*
                  </abbr>
                </b>
              </td>
              <td> 12.7 </td>
            </tr>
            <tr>
              <td>
                <b>Magnitude drop</b>{' '}
              </td>
              <td> 8.0 </td>
            </tr>
            <tr>
              <td>
                <b>Uncertainty in time </b>{' '}
              </td>
              <td> 1006.1 sec </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Uncertainty in geocentric closest approach">
                    Uncertainty in C/A{' '}
                  </abbr>
                </b>
              </td>
              <td> 394.5 mas </td>
            </tr>
            <tr>
              <td>
                <b>Uncertainty in projected distance </b>{' '}
              </td>
              <td> 6366.4 km </td>
            </tr>
            <tr>
              <td>
                <b>Probability of occultation on centrality</b>{' '}
              </td>
              <td> 0.4% </td>
            </tr>
            <tr>
              <td>
                <b>Maximum duration </b>{' '}
              </td>
              <td> 2.0 sec</td>
            </tr>
            <tr>
              <td>
                <b>Moon distance to the object </b>{' '}
              </td>
              <td> 139.7°</td>
            </tr>
            <tr>
              <td>
                <b>Fraction of illuminated Moon </b>{' '}
              </td>
              <td> 99.9 % </td>
            </tr>
            <tr>
              <td>
                <b>Solar elongation</b>{' '}
              </td>
              <td> 44.3° </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Circumstances;
