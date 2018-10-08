import React, { Component } from 'react';
// import OrbitApi from 'RefineOrbit/OrbitApi';
// import PredictionApi from './PredictionApi';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Components
import { Dropdown } from 'primereact/dropdown';

//Custom
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import Content from 'components/CardContent/CardContent.jsx';

class PredicitionSelect extends Component {
  state = this.initialState;
  // apiOrbit = new OrbitApi();
  //   apiPrediction = new PredictionApi();

  get initialState() {
    return {
      dataOrbit: [],
    };
  }

  OrbitName = () => {
    this.api.getRefineOrbits().then(res => {
      const r = res.data;
      this.setState({
        dataOrbit: r.results,
      });
    });
  };

  render() {
    return (
      <div>
        <PanelCostumize
          title="Prediction Occultation"
          subTitle="Execute PRAIA Occultation"
          content={
            <Content
              content={
                <div>
                  <Dropdown
                    value={this.state.city}
                    options={this.OrbitName}
                    onChange={e => {
                      this.setState({ city: e.value });
                    }}
                    placeholder="Select a City"
                  />
                  <br />
                  <br />

                  {/* <Dropdown
                    value={this.state.city}
                    options={citySelectItems}
                    onChange={e => {
                      this.setState({ city: e.value });
                    }}
                    placeholder="Select a City"
                  />
                  <br />
                  <br />

                  <Dropdown
                    value={this.state.city}
                    options={citySelectItems}
                    onChange={e => {
                      this.setState({ city: e.value });
                    }}
                    placeholder="Select a City"
                  /> */}
                </div>
              }
            />
          }
        />
      </div>
    );
  }
}
export default PredicitionSelect;
