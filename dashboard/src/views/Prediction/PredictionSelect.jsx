import React, { Component } from 'react';
// import OrbitApi from 'RefineOrbit/OrbitApi';
import PredictionApi from './PredictionApi';
import { Calendar } from 'primereact/calendar';
import { Slider } from 'primereact/slider';
import { Spinner } from 'primereact/spinner';
import moment, { months } from 'moment';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Components
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

class PredicitionSelect extends Component {
  state = this.initialState;
  // apiOrbit = new OrbitApi();
  apiPrediction = new PredictionApi();

  get initialState() {
    return {
      dataOrbit: [],
      object: [],
      processes: [],
      process: null,
      catalogs: [],
      catalog: null,
      leap_seconds: [],
      leap_second: null,
      bsps_planeraty: [],
      bsp_planeraty: null,
      catalog_radius: 0.15,
      message: '',
      actionButton: '',
      record: null,
      number: 0,
      ephemeris_initial_date: null,
      ephemeris_final_date: null,
    };
  }
  componentDidMount() {
    // Processos
    this.apiPrediction.getPrediction().then(res => {
      const r = res.data;
      this.setState({
        processes: r.results,
      });
    });

    this.apiPrediction.getCatalogs().then(res => {
      const catalogs = res.data.results;
      let catalog = null;

      if (catalogs.length > 0) {
        catalog = {
          label: catalogs[0].display_name,
          value: catalogs[0].id,
        };
      }

      this.setState({
        catalogs: catalogs,
        catalog: catalog,
      });
    });

    this.apiPrediction.getLeapSeconds().then(res => {
      const leap_seconds = res.data.results;
      let leap_second = null;

      if (leap_seconds.length > 0) {
        leap_second = {
          label: leap_seconds[0].display_name,
          value: leap_seconds[0].id,
        };
      }
      this.setState({
        leap_seconds: leap_seconds,
        leap_second: leap_second,
      });
    });

    this.apiPrediction.getBspPlanetary().then(res => {
      const bsps_planetary = res.data.results;
      let bsp_planeraty = null;

      if (bsps_planetary.length > 0) {
        bsp_planeraty = {
          label: bsps_planetary[0].display_name,
          value: bsps_planetary[0].id,
        };
      }

      this.setState({
        bsps_planeraty: bsps_planetary,
        bsp_planeraty: bsp_planeraty,
      });
    });
    // https://javascript.info/date

    const year = new Date().getFullYear();
    // month of january is represented with ( 0 ) and moth of december represented with (11), this is a rule of javascript
    const ephemeris_initial_date = new Date(year, 0, 1);
    const ephemeris_final_date = new Date(year, 11, 31);
    this.setState({ ephemeris_initial_date: ephemeris_initial_date });
    this.setState({ ephemeris_initial_date: ephemeris_final_date });
  }

  onCheck = () => {
    if (
      this.state.proccess === null &&
      this.state.obj_leap === null &&
      this.state.bsp_planeraty === null
    ) {
      this.setState({ message: 'Os Campos não foram preenchidos' });
    } else {
      if (
        this.state.proccess !== null &&
        this.state.obj_leap !== null &&
        this.state.bsp_planeraty !== null
      )
        this.setState({ actionButton: true });
    }
  };

  onClick = () => {
    const { proccess } = this.state;

    this.apiPrediction
      .createPredictRun({
        proccess: proccess.value,
        input_list: proccess.input_list,
      })
      .then(res => {
        console.log('Eu sou a resposta do predict:', res);
        this.onCreateSuccess(res.data);
      })
      .catch(this.onCreateFailure('sim'));
  };

  onCreateSuccess = record => {
    console.log('onCreateSuccess(%o)', record);
    this.setState(this.initialState, this.props.onCreateRun(record));
  };
  onCreateFailure = error => {
    // TODO: Criar uma Notificacao de falha.
    console.log('onCreateFailure(%o)', error);
  };

  onChangeProcess = e => {
    this.setState({ process: e.value }, this.onCheck());
  };

  onChangeCatalog = e => {
    this.setState({ catalog: e.value }, this.onCheck());
  };

  onChangeLeap = e => {
    this.setState({ leap_second: e.value }, this.onCheck());
  };

  onChangeBsp = e => {
    this.setState({ bsp_planeraty: e.value }, this.onCheck());
  };

  OrbitName = () => {
    this.api.getRefineOrbits().then(res => {
      const r = res.data;
      this.setState({
        dataOrbit: r.results,
      });
    });
  };

  proccessDropdown = () => {
    // Combobox Processos ( E as rodadas do Refine Orbit que tiveram sucesso )
    const processes = this.state.processes;
    const process_elements = [];
    processes.map(el => {
      process_elements.push({
        label: el.proccess_displayname,
        value: el.id,
        input_list: el.input_list,
      });
      return;
    });

    return (
      <Dropdown
        className="drop"
        key={2}
        value={this.state.process}
        options={process_elements}
        onChange={this.onChangeProcess}
        placeholder="Select a Process"
        optionLabel="label"
      />
    );
  };

  catalogDropdown = () => {
    // Combobox Catalogs
    const catalogs = this.state.catalogs;
    const catalog_elements = [];

    catalogs.map(el => {
      catalog_elements.push({
        label: el.display_name,
        value: el.id,
      });
      return;
    });

    return (
      <Dropdown
        key={2}
        value={this.state.catalog}
        options={catalog_elements}
        onChange={this.onChangeCatalog}
        placeholder="Select a Catalog"
        optionLabel="label"
      />
    );
  };

  leapSecondDropdown = () => {
    // Combobox LeapSecond
    const leaps = this.state.leap_seconds;
    const leaps_elements = [];

    leaps.map(el => {
      leaps_elements.push({
        label: el.display_name,
        value: el.id,
      });
      return;
    });

    return (
      <div>
        <Dropdown
          key={2}
          value={this.state.leap_second}
          options={leaps_elements}
          onChange={this.onChangeLeap}
          placeholder="Select a Leap Second"
          optionLabel="label"
        />
      </div>
    );
  };

  bspPlanetaryDropdown = () => {
    // Combobox BSP Planetary
    const bsps = this.state.bsps_planeraty;
    const bsp_elements = [];

    bsps.map(el => {
      bsp_elements.push({
        label: el.display_name,
        value: el.id,
      });
      return;
    });

    return (
      <div>
        <Dropdown
          key={2}
          value={this.state.bsp_planeraty}
          options={bsp_elements}
          onChange={this.onChangeBsp}
          placeholder="Select a BSP Planetary"
          optionLabel="label"
        />
      </div>
    );
  };

  radiusInput = () => {
    return (
      <Spinner
        value={this.state.catalog_radius}
        onChange={e => this.setState({ catalog_radius: e.value })}
        min={0}
        max={2}
        step={0.01}
      />
    );
  };

  ephemerisDate = () => {
    return (
      <div>
        <Calendar
          value={this.state.ephemeris_initial_date}
          onChange={e => this.setState({ ephemeris_initial_date: e.value })}
          placeholder="Initial Date"
          dateFormat="yy-mm-dd"
        />
        <Calendar
          value={this.state.ephemeris_final_date}
          onChange={e => this.setState({ ephemeris_final_date: e.value })}
          placeholder="Final Date"
        />
      </div>
    );
  };

  render() {
    return (
      <div>
        <div className="flex-row">
          <div className="item-prediction">
            <p className="label-prediction">Proccess</p>
            {this.proccessDropdown()}
            <p className="label-prediction">Catalog</p>
            {this.catalogDropdown()}
            <p className="label-prediction">Leap Seconds</p>
            {this.leapSecondDropdown()}
            <p className="label-prediction">BSP Planetary</p>
            {this.bspPlanetaryDropdown()}
          </div>
          <div className="item-prediction">
            <p className="label-prediction">Catalog Radius</p>
            {this.radiusInput()}
            <p className="label-prediction">
              Ephemeris Initial and final date.
            </p>
            {this.ephemerisDate()}
          </div>
        </div>

        <br />

        <Button
          label="Submit"
          disabled={this.state.actionButton}
          onClick={this.onClick}
          className=" button-TNO button-prediction"
        />
      

        <p>{this.state.message}</p>
      </div>
    );
  }
}

export default PredicitionSelect;
