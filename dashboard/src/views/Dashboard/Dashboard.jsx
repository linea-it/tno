import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import MiniCardStats from 'components/Statistics/MiniCardStats.jsx';

class Dashboard extends Component {
  render() {
    return (
      <div>
        <div className="u-g">
          <div className="ui-g-3">
            <MiniCardStats
              color="yellow"
              bigIcon={<i className="pe-7s-graph1 text-danger" />}
              statsText="Errors"
              statsValue="23"
              statsIcon={<i className="fa fa-clock-o" />}
              statsIconText="In the last hour"
            />
          </div>
          <div className="ui-g-3">
            <MiniCardStats
              color="blue"
              bigIcon={<i className="pe-7s-graph1 text-danger" />}
              statsText="Errors"
              statsValue="23"
              statsIcon={<i className="fa fa-clock-o" />}
              statsIconText="In the last hour"
            />
          </div>

          <div className="ui-g-3">
            <MiniCardStats
              color="orange"
              bigIcon={<i className="pe-7s-graph1 text-danger" />}
              statsText="Errors"
              statsValue="23"
              statsIcon={<i className="fa fa-clock-o" />}
              statsIconText="In the last hour"
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Dashboard;
