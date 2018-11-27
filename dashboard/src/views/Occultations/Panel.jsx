import React, { Component } from 'react';
// interface components
import { Card } from 'primereact/card';

import OccultationsAbout from './About'
import OccultationsHelp from './Help'
import OccultationsDataView from './DataView';

class OccultationsPanel extends Component {
  render() {
    return (
      <div className="content">
        <Card title="Predictions of occultations for TNOs" subTitle="">
          <OccultationsAbout />
        </Card>
        <Card title="" subTitle="">
          <OccultationsDataView />
        </Card>       
        <Card title="" subTitle="">
          <OccultationsHelp />
        </Card>         
      </div>
    );
  }
}

export default OccultationsPanel;
