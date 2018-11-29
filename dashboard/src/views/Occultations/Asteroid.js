import React, { Component } from 'react';

class Asteroid extends Component {
  render() {
    return (
      <div>
        <table
          style={{
            textAlign: 'center',
            width: '640px',
            fontSize: '1em',
            color: '#333333',
          }}
        >
          <tbody>
            <tr>
              <td>
                <b>Object</b>
              </td>
              <td> (2013RG98) 2013RG98 </td>
            </tr>
            <tr>
              <td>
                <b>Diameter</b>
              </td>
              <td> 70.0 km</td>
            </tr>
            <tr>
              <td>
                <b>Apparent diameter</b>
              </td>
              <td> 4.3 mas </td>
            </tr>
            <tr>
              <td>
                <b>Object astrometric position (ICRF)</b>{' '}
              </td>
              <td> 04 41 25.0209 -22 07 04.849 </td>
            </tr>
            <tr>
              <td>
                <b>Object apparent position (date)</b>{' '}
              </td>
              <td> 04 42 12.3810 -22 05 06.004 </td>
            </tr>
            <tr>
              <td>
                <b>Uncertainty in position</b>{' '}
              </td>
              <td> RA* = 2047.3mas DEC = 979.5mas </td>
            </tr>
            <tr>
              <td>
                <b>Apparent magnitude</b>{' '}
              </td>
              <td> 22.6 </td>
            </tr>
            <tr>
              <td>
                <b>Ephemeris</b>{' '}
              </td>
              <td>
                {' '}
                <a
                  href="http://lesia.obspm.fr/lucky-star/des/nima/"
                  target="_blank"
                >
                  NIMAv1
                </a>{' '}
              </td>
            </tr>
            <tr>
              <td>
                <b>
                  Dynamic class<sup>(1)</sup>
                </b>
              </td>
              <td> Centaur</td>
            </tr>
            <tr>
              <td>
                <b>
                  Semi major axis<sup>(1)</sup>
                </b>
              </td>
              <td> 23.1 au</td>
            </tr>
            <tr>
              <td>
                <b>
                  Eccentricity<sup>(1)</sup>
                </b>
              </td>
              <td> 0.169</td>
            </tr>
            <tr>
              <td>
                <b>
                  Inclination<sup>(1)</sup>
                </b>
              </td>
              <td> 46.0°</td>
            </tr>
            <tr>
              <td>
                <b>
                  Perihelion<sup>(1)</sup>
                </b>
              </td>
              <td> 19.2 au</td>
            </tr>
            <tr>
              <td>
                <b>
                  Aphelion<sup>(1)</sup>
                </b>
              </td>
              <td> 27.0 au</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Asteroid;
