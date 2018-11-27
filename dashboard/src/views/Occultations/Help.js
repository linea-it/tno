import React, { Component } from 'react';

class OccultationsHelp extends Component {
  render() {
    return (
      <div>
        <div className="ui-card-subtitle">Information about the table</div>
        <ul>
          <li>Predictions can be filtered by date, object, size, precision, zone, and/or magnitude;</li>
          <li>The G* magnitude is the G magnitude (from Gaia), <i>normalized to a body moving at 20km/s</i> in order to enhance very slow events (<i>G* = G + 2.5 log (v/20)</i> with v is the velocity in the skyplane (km/s)); </li>
          <li>The precision filter is for the 1-σ precision perpendicular to the path in km on the Bessel plan;</li>
          <li>The size filter allow to filter object with diamter in km;</li>
          <li>Zones are defined approximately as large areas covering East-Asia, Europe &amp; North Africa, Oceania, Southern Africa, North America, South America according to the map</li>
          <li>By clicking on one map, you will find a specific page of the event, with the prediction map, occultation circumstances and the field of view with the occulted star.</li>
          <li>As the table may be long to display, events with a solar elongation greater than 20° are considered and filters on date and magnitude are initially applied. Do not hesitate to change the filters to see all the events.</li>
        </ul>
        <div className="ui-card-subtitle">Information about the maps</div>
        <ul>
          <li>The straight and continue lines represents the shadow limits considering the estimated radius; when the shadow crosses the Earth's surface, the path is projected on the Earth;</li>
          <li>The blue dots are separated by a one-minute interval and the big blue dot corresponds to the nominal occultation time (which is the geocentric closest approach);</li>
          <li>The arrow shows the direction of the shadow motion;</li>
          <li>The 1-σ precision along the path is represented by the red dotted line;</li>
          <li>The G*, RP* and H* parameters are the G (visible from Gaia), RP (red photometry from Gaia) and H (from 2MASS) magnitudes, <i>normalized to a body moving at 20km/s</i> in order to enhance very slow events (<i>G* = G + 2.5 log (v/20)</i> with v is the velocity in the skyplane (km/s)); </li>
          <li>The body offset is at the upper right corner, if JPL ephemeris is used;</li>
          <li>Areas in dark grey correspond to full night (Sun elevation below -18 degrees) and areas in light grey correspond to twilight (Sun elevation between -18 and 0 degrees) while daytime is in white; 
          </li><li>Be careful, that the dates are in Universal Time, the night of the event may begin the day before.</li>
        </ul>            
      </div>
    );
  }
}

export default OccultationsHelp;
