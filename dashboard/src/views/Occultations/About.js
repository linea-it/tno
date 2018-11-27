import React, { Component } from 'react';

class OccultationsAbout extends Component {
  render() {
    return (
      <div>
        <p>
          This page presents the prediction of occultations by TNOs and Centaurs
          of Dark Energy Survey for 2019. These predictions are made in the
          framework of Lucky Star project (led by B. Sicardy) and in
          collaboration with groups from Paris, Meudon, Granada and Rio.
        </p>
        <p>
          Information about the predictions can be found in Assafin et al.
          (2012) and Camargo et al. (2014). Predictions make use of ephemerides
          presented in DES Ephemerides section and of Gaia DR2 (Gaia
          Collaboration, 2018) for the position of the stars and the proper
          motions.
        </p>
        <p>
          Occultations for objects with too uncertain orbit are not presented.
          (2060) Chiron, (136199) Eris, (47171) 1999TC36, (120348) 2004TY364,
          (144897) 2004UX10, (303775) 2005QU182, (145452) 2005RN43, (145480)
          2005TB190 are presented in the main Lucky Star webpage.
        </p>
      </div>
    );
  }
}

export default OccultationsAbout;
