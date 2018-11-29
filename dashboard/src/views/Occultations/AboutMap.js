import React, { Component } from 'react';

class AboutMap extends Component {
  render() {
    return (
      <div>
        <div className="ui-card-subtitle">Information about the map</div>
        <ul>
          <li>
            The straight and continue lines are the shadow limits considering
            the estimated radius; when the shadow crosses the Earth's surface,
            the path is projected on the Earth;
          </li>
          <li>
            Each blue dot is spaced by one minute and the big blue dot
            corresponds to the nominal occultation time (which is the geocentric
            closest approach);
          </li>
          <li>The arrow shows the direction of the shadow motion;</li>
          <li>
            The 1-σ precision along the path is represented by the red dotted
            line;
          </li>
          <li>
            The star G* and RP* are the G (from Gaia) and RP (red photometer
            from GaiaDR2) magnitudes,{' '}
            <i>normalized to a body moving at 20km/s</i> in order to enhance
            very slow events;
          </li>
          <li>
            The body offset is at the upper right corner, if JPL ephemeris is
            used;
          </li>
          <li>
            Areas in dark grey correspond to full night (Sun elevation below -18
            degrees) and areas in light grey correspond to twilight (Sun
            elevation between -18 and 0 degrees) while daytime is in white;
          </li>
          <li>
            Be careful, the dates are from the moment of the event in Universal
            Time, the night of the event may begin at the date before.
          </li>
        </ul>
      </div>
    );
  }
}

export default AboutMap;
