import React, {Component} from 'react';
import Plot from 'react-plotly.js';
// import { rows } from './dataPredict.js';
// import { gaia } from './dataPredict2.js';



class PlotPrediction extends Component {
    render () {
      // const ra = [];
      // const dec = [];

      // const eixox = [];
      // const eixoy = [];

      // rows.map((el,i) => {
      //   ra.push(rows[i].x)
      //   dec.push(rows[i].y)
      // });

      // gaia.map((el,j) => {
      //   eixoy.push(gaia[j].y)
      //   eixox.push(gaia[j].x)
      // });

      // console.log("gaia:", gaia.x);
      // console.log("gaia:", gaia.y);

      // console.log("row:", rows);


        return(
          <div>
          {/* <Plot
            data={[
              { 
                x: eixox,
                y: eixoy, 
                type: 'scatter',
                // mode: 'none', 
                marker: {color: 'blue'},
              },
            ]}
            layout={{width: 640, height: 480, title: 'A Fancy Plot'}}
          />
          <Plot
          data={[
              {
                x: ra,
                y: dec,
                type: 'scatter',
                // mode: 'lines',
                marker: {color: 'red'},
              },
          ]}
          layout={{width: 640, height: 480, title: 'A Fancy Plot'}}
        /> */}
        </div>

        );
    }
} 

export default PlotPrediction;