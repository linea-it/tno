import React, { Component } from 'react';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import SSSOdyclass from './SSSOdyclass';
import SunDistance from './SunDistance';

class Histograms extends Component {
  render() {
    const propSet = this.props;

    return (
      <div>
        <PanelCostumize
          noHeader={true}
          title="Skybot"
          content={
            <div className="p-grid p-dir-row">
              <div className="p-col-6 border-edit-right">
                <SSSOdyclass data={propSet.ccds.asteroids_by_dynclass} />
              </div>
              <div className="p-col-6">
                <SunDistance data={propSet.ccds.histogram} />
              </div>
            </div>
          }
        />
      </div>
    );
  }
}

export default Histograms;
