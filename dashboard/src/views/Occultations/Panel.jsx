import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

// interface components
import { Card } from 'primereact/card';

import OccultationsAbout from './About';
import OccultationsHelp from './Help';
import OccultationsDataView from './DataView';

class OccultationsPanel extends Component {
  static propTypes = {
    history: PropTypes.any,
  };

  onView = row => {
    const history = this.props.history;
    history.push({ pathname: `/occultation_detail/${row.id}` });
  };

  render() {
    return (
      <div className="content">
        <Card title="Predictions of occultations for TNOs" subTitle="">
          <OccultationsAbout />
        </Card>
        <Card title="" subTitle="">
          <OccultationsDataView onView={this.onView} />
        </Card>
        <Card title="" subTitle="">
          <OccultationsHelp />
        </Card>
      </div>
    );
  }
}

export default withRouter(OccultationsPanel);
