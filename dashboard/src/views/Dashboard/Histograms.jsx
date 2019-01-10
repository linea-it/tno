import React, { Component } from 'react';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import SSSOdyclass from './SSSOdyclass';
import SunDistance from './SunDistance';

class Histograms extends Component {
  render() {
    const propSet = this.props;

    let gridCol = '';
    window.innerWidth <= 998 ? (gridCol = '12') : (gridCol = '6');

    return (
      <div>
        <PanelCostumize
          noHeader={true}
          title="Skybot"
          content={
            <div className="p-grid p-dir-row">
              <div className={`p-col-${gridCol} border-edit-right`}>
                <SSSOdyclass data={propSet.ccds} />
              </div>
              <div className={`p-col-${gridCol}`}>
                <SunDistance data={propSet.ccds} />
              </div>
            </div>
          }
        />
      </div>
    );
  }
}

export default Histograms;
