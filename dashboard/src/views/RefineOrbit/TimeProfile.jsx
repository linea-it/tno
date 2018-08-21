// React e Prime React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import moment from 'moment';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

class RefineOrbitTimeProfile extends Component {
  state = this.initialState;

  static propTypes = {};

  get initialState() {
    return {
      width: 200,
      height: 200,
    };
  }

  componentDidMount() {
    let { width, height } = this.props.size;

    if (height == 0) {
      height = width / 2;
    }
    this.setState({
      width: width,
      height: height,
    });
    // //Set stizes to the local state
    // this.setState({
    //    colH: this.col.clientHeight,
    //    colW: this.col.clientWidth
    // });
    //Use a callback on the props to give parent the data
    // this.props.onSizeChange({colH: this.col.clientHeight, colW: this.col.clientWidth})
  }

  render() {
    // console.log(this.contentDiv.getBoundingClientRect())
    // console.log(this.props);
    // const { width } = this.props.size;
    // const height = width;

    console.log('width:', this.state.width);
    console.log('height:', this.state.height);

    const times = [
      {
        name: '1999 OX3  ',
        start_time: '2018-08-21 09:54:14',
        finish_time: '2018-08-21 09:54:45',
      },
      {
        name: '2004 TY364',
        start_time: '2018-08-21 09:54:45',
        finish_time: '2018-08-21 09:55:08',
      },
      {
        name: '2010 RF64 ',
        start_time: '2018-08-21 09:55:08',
        finish_time: '2018-08-21 09:55:10',
      },
      {
        name: '2010 TY53 ',
        start_time: '2018-08-21 09:55:10',
        finish_time: '2018-08-21 09:55:13',
      },
      {
        name: '2015 RK245',
        start_time: '2018-08-21 09:55:13',
        finish_time: '2018-08-21 09:55:16',
      },
      {
        name: '2015 TN178',
        start_time: '2018-08-21 09:55:16',
        finish_time: '2018-08-21 09:55:18',
      },
    ];

    const a = moment('2018-08-21 09:54:14');
    const b = moment('2018-08-21 09:55:18');
    // a = new Date('2018-08-21 09:54:14');
    // const b = new Date('2018-08-21 09:55:18');

    console.log(moment(b.diff(a)).format());

    // console.log(a);
    // console.log(b);

    // const ms = b.getTime() - a.getTime();

    // console.log(ms);

    // const seconds = Math.floor((ms / 1000) % 60);

    // console.log('Seconds: ', seconds);
    const data = [];

    // times.forEach((e, i) => {

    //   data.push({
    //     name: e.name,
    //     y: i,
    //   });
    // });

    const data01 = [{ x: 10, y: 30 }, { x: 20, y: 30 }];
    const data02 = [{ x: 15, y: 40 }, { x: 25, y: 40 }];
    return (
      <div>
        <ScatterChart
          width={this.state.width}
          height={this.state.height}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis
            domain={[0, 100]}
            type="number"
            dataKey={'x'}
            name="Execution Time"
            unit="s"
          />
          <YAxis
            domain={[0, 100]}
            // range={[0, 100]}
            type="number"
            dataKey={'y'}
            name="weight"
            unit="kg"
          />
          <ZAxis range={[10, 10]} datakey={'r'} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {/* <Legend /> */}
          <Scatter
            name="A school"
            data={data01}
            fill="#8884d8"
            line={{ stroke: '#8884d8', strokeWidth: 1 }}
            shape="circle"
          />
          <Scatter
            name="B school"
            data={data02}
            fill="#82ca9d"
            line
            shape="diamond"
          />
        </ScatterChart>
      </div>
    );
  }
}

export default sizeMe({ monitorHeight: true })(RefineOrbitTimeProfile);
