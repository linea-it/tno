import React, { Component } from 'react';

//primereact
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Custom
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import ListStats from 'components/Statistics/ListStats.jsx';
import Piedyclass from './Piedyclass';

class Skybot extends Component {
  render() {
    const propSet = this.props;
    const ssso_class = [];

    const COLORS = [
      '#0088FE',
      '#00C49F',
      '#FFBB28',
      '#FF8042',
      '#0088FE',
      '#00C49F',
      '#FFBB28',
      '#FF8042',
    ];

    propSet.ccds.asteroids_by_class.map(record => {
      ssso_class.push({
        name: record.class_name,
        value: record.count,
        color: 'primary',
      });
      return record;
    });

    return (
      <div className="pie-content">
        <PanelCostumize
          title="Skybot"
          content={
            <div className="p-grid p-dir-row">
              <div className="p-col-6 border-edit-right">
                <ListStats data={propSet.data} />
              </div>
              <div className="p-col-6">
                <Piedyclass data={ssso_class} colors={COLORS} />
              </div>
            </div>
          }
        />
      </div>
    );
  }
}
export default Skybot;
