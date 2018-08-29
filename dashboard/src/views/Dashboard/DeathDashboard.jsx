import React, { Component } from 'react';
//import ChartistGraph from 'react-chartist';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// import { Card } from 'components/Card/Card.jsx';
// import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
// import { Tasks } from 'components/Tasks/Tasks.jsx';
// import {
//   dataPie,
//   legendPie,
//   dataSales,
//   optionsSales,
//   responsiveSales,
//   legendSales,
// } from 'variables/Variables.jsx';

class Dashboard extends Component {
  createLegend(json) {
    var legend = [];
    for (var i = 0; i < json['names'].length; i++) {
      var type = 'fa fa-circle text-' + json['types'][i];
      legend.push(<i className={type} key={i} />);
      legend.push(' ');
      legend.push(json['names'][i]);
    }
    return legend;
  }
  render() {
    return (
      <div className="u-g">
        <div className="u-md-6">Col1</div>
        <div className="u-md-6">Col2</div>
      </div>
    );
  }
}

export default Dashboard;

// /* <div className="u-md-4">
//     <StatsCard
//       bigIcon={<i className="pe-7s-graph1 text-danger" />}
//       statsText="Errors"
//       statsValue="23"
//       statsIcon={<i className="fa fa-clock-o" />}
//       statsIconText="In the last hour"
//     />
//   </div> */
// /* <Row>
//     <Col md={8}>
//       <Card
//         statsIcon="fa fa-history"
//         id="chartHours"
//         title="Users Behavior"
//         category="24 Hours performance"
//         stats="Updated 3 minutes ago"
//         content={
//           <div className="ct-chart">
//             <ChartistGraph
//               data={dataSales}
//               type="Line"
//               options={optionsSales}
//               responsiveOptions={responsiveSales}
//             />
//           </div>
//         }
//         legend={
//           <div className="legend">{this.createLegend(legendSales)}</div>
//         }
//       />
//     </Col>
//     <Col md={4}>
//       <Card
//         statsIcon="fa fa-clock-o"
//         title="Email Statistics"
//         category="Last Campaign Performance"
//         stats="Campaign sent 2 days ago"
//         content={
//           <div
//             id="chartPreferences"
//             className="ct-chart ct-perfect-fourth"
//           >
//             <ChartistGraph data={dataPie} type="Pie" />
//           </div>
//         }
//         legend={
//           <div className="legend">{this.createLegend(legendPie)}</div>
//         }
//       />
//     </Col>
//   </Row>

//   <Row>
//     <Col md={6}>
//       <Card
//         id="chartActivity"
//         title="2014 Sales"
//         category="All products including Taxes"
//         stats="Data information certified"
//         statsIcon="fa fa-check"
//         content={<div className="ct-chart" />}
//       />
//     </Col>

//     <Col md={6}>
//       <Card
//         title="Tasks"
//         category="Backend development"
//         stats="Updated 3 minutes ago"
//         statsIcon="fa fa-history"
//         content={
//           <div className="table-full-width">
//             <table className="table">
//               <Tasks />
//             </table>
//           </div>
//         }
//       />
//     </Col>
//   </Row>
// </Grid>
