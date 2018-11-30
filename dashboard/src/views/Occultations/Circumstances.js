import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

// Exemplo de dados de uma occultacao
// const data = {
//   id: 173,
//   asteroid: 14,
//   asteroid_name: '1999 RB216',
//   asteroid_number: '137295',
//   date_time: '2018-02-01 08:39:09',
//   ra_star_candidate: '02 01 58.2708',
//   dec_star_candidate: '+04 26 49.184',
//   ra_target: '02 01 58.2866',
//   dec_target: '+04 26 48.827',
//   closest_approach: 0.428,
//   position_angle: 146.55,
//   velocity: 12.2,
//   delta: 33.91,
//   g: 18.4,
//   j: 50.0,
//   h: 50.0,
//   k: 50.0,
//   long: 129.0,
//   loc_t: '17:15:00',
//   off_ra: 0.0,
//   off_dec: 0.0,
//   proper_motion: 'ok',
//   ct: '--',
//   multiplicity_flag: '-',
//   e_ra: 0.0,
//   e_dec: 0.0,
//   pmra: 3.0,
//   pmdec: 2.0,
//   src:
//     '/media/proccess/67/objects/1999_RB216/1999RB216_2018-02-01T08:39:09.000.png',
//   already_happened: true,
// };

class Circumstances extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  };

  render() {
    const data = this.props.data;

    const occ_date = moment(data.date_time).format(
      'ddd. DD MMMM YYYY HH:mm:ss'
    );
    return (
      <div>
        <table
          className="simple_property_table"
          style={{
            width: '100%',
          }}
        >
          <tbody>
            <tr>
              <td>
                <b>Date</b>
              </td>
              <td> {occ_date} </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Right ascension and declination with assumed proper motion in ICRF/J2000">
                    Star position (ICRF)
                  </abbr>
                </b>
              </td>
              <td>
                {data.ra_star_candidate} {data.dec_star_candidate}
              </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Geocentric closest approach (arcsec)">C/A</abbr>
                </b>
              </td>
              <td> {data.closest_approach} arcsec </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Planet position angle wrt to star at C/A (deg)">
                    P/A
                  </abbr>
                </b>
              </td>
              <td> {data.position_angle} ° </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="velocity in plane of sky (positive= prograde, negative= retrograde)">
                    velocity
                  </abbr>
                </b>
              </td>
              <td> {data.velocity} km/s </td>
            </tr>
            <tr>
              <td>
                <b>Geocentric distance Δ </b>
              </td>
              <td> {data.delta} au </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Gaia magnitude corrected from velocity (Source: Gaia DR1)">
                    G mag*
                  </abbr>
                </b>
              </td>
              <td> {data.g} </td>
            </tr>
            <tr>
              <td>
                {/* TODO ESSE ATRIBUTO DEPENDE DO CATALOGO SELECIONADO A INFO DO CATALOGO DEVERIA VIR DA EXECUCAO */}
                <b>
                  <abbr title="RP magnitude corrected from velocity (Source: GaiaDR2)">
                    RP mag*
                  </abbr>
                </b>
              </td>
              <td>
                14.4 <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="H magnitude corrected from velocity (Source: 2MASS)">
                    H mag*
                  </abbr>
                </b>
              </td>
              <td> {data.h} </td>
            </tr>
            <tr>
              <td>
                <b>Magnitude drop</b>
              </td>
              <td>
                8.0 <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Uncertainty in time </b>
              </td>
              <td>
                1006.1 sec <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>
                  <abbr title="Uncertainty in geocentric closest approach">
                    Uncertainty in C/A
                  </abbr>
                </b>
              </td>
              <td>
                394.5 mas <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Uncertainty in projected distance </b>
              </td>
              <td>
                6366.4 km <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Probability of occultation on centrality</b>
              </td>
              <td>
                0.4% <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Maximum duration </b>
              </td>
              <td>
                2.0 sec <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Moon distance to the object </b>
              </td>
              <td>
                139.7° <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Fraction of illuminated Moon </b>
              </td>
              <td>
                99.9 % <b>TODO</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Solar elongation</b>
              </td>
              <td>
                44.3° <b>TODO</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Circumstances;
