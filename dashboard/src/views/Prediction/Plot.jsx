import React, {Component} from 'react';
import Plot from 'react-plotly.js';
import { rows } from './dataPredict.js';
import { rows2 } from './dataPredict2.js';



class PlotPrediction extends Component {
    render () {
      const ra = [];
      const dec = [];
      const x = [];
      const y = [];

      rows.map((el,i) => {
        ra.push(rows[i].x)
        dec.push(rows[i].y)
      });

      rows2.map((el,i) => {
        x.push(rows[i].x)
        y.push(rows[i].y)
      });



      console.log("x:", x);
      console.log("y:",y);


        return(
            <Plot
            data={[
              {
                x: ra,
                y: dec,
                type: 'line',
                mode: 'lines',
                marker: {color: 'red'},
              },
             { mode: 'markers', type: 'scatter',
               x: x, y: y, marker: {color: 'purple'},
            },
            ]}
            layout={{width: 640, height: 480, title: 'A Fancy Plot'}}
          />
        );
    }
} 

export default PlotPrediction;