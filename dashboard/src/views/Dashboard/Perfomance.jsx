import React, { Component } from 'react';
//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Custom
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import MiniCardStats from 'components/Statistics/MiniCardStats.jsx';

//Plot Rechart

class Performance extends Component {
  render() {
    const propSet = this.props;
    return (
      <div>
        <PanelCostumize
          colorHead="ds"
          title="Processing and performance"
          content={
            <div className="flex-layout">
              <div className="flex-container flex-wrap row">
                <MiniCardStats
                  className="item grow-1"
                  color="blue"
                  bigIcon={<i className="pe-7s-graph1 text-danger" />}
                  statsText="Errors"
                  statsValue="23"
                  statsIcon={<i className="fa fa-clock-o" />}
                  statsIconText="In the last hour"
                  data={propSet.data}
                  fill={propSet.colors}
                  name="Memory"
                  number="60 %"
                />
                <MiniCardStats
                  className="item grow-1"
                  color="blue"
                  bigIcon={<i className="pe-7s-graph1 text-danger" />}
                  statsText="Errors"
                  statsValue="23"
                  statsIcon={<i className="fa fa-clock-o" />}
                  statsIconText="In the last hour"
                  data={propSet.data}
                  fill={propSet.colors}
                  name="Traffic"
                  number="2.4 KB"
                />
              </div>
              <div className="flex-container flex-wrap row">
                <MiniCardStats
                  className="item grow-1"
                  color="blue"
                  bigIcon={<i className="pe-7s-graph1 text-danger" />}
                  statsText="Errors"
                  statsValue="23"
                  statsIcon={<i className="fa fa-clock-o" />}
                  statsIconText="In the last hour"
                  data={propSet.data}
                  fill={propSet.colors}
                  name="Disk I/O"
                  number="4.2 KB"
                />

                <MiniCardStats
                  className="item grow-1"
                  color="blue"
                  bigIcon={<i className="pe-7s-graph1 text-danger" />}
                  statsText="Errors"
                  statsValue="23"
                  statsIcon={<i className="fa fa-clock-o" />}
                  statsIconText="In the last hour"
                  data={propSet.data}
                  fill={propSet.colors}
                  name="Memory"
                  number="5.2 KB"
                />
              </div>
            </div>
          }
        />
      </div>
    );
  }
}
export default Performance;
