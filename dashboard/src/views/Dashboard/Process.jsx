import React, { Component } from 'react';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//custom
import ListStats from 'components/Statistics/ListStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';

class Process extends Component {
  render() {
    const propSet = this.props;
    return (
      <div>
        <PanelCostumize
          colorHead="ds"
          title="Last Proccess Stats"
          content={<ListStats status={false} data={propSet.proccess_stats} />}
        />
      </div>
    );
  }
}
export default Process;
