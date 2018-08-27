import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Card } from 'primereact/card';

class MiniCardStats extends Component {
  render() {
    const propSet = this.props;

    return (
      <div>
        <Card className={`mini-card-stats ${propSet.color}`}>
          <div className="u-g">
            <div className="ui-md-5" />
            <div className="ui-md-7" />
          </div>

          <div className="footer">
            <hr />
          </div>
        </Card>
      </div>
    );
  }
}
export default MiniCardStats;
