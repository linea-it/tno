// React e Prime React
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import PredictionApi from './PredictionApi';
// interface components
import { Card } from 'primereact/card';
import moment from 'moment';
import Lightbox from 'react-images';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import ListStats from 'components/Statistics/ListStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import PlotPrediction from './Plot';

class AsteroidDetailPrediction extends Component {
  state = this.initialState;
  api = new PredictionApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: 0,
      asteroid: {},
      inputs: [],
      occultations: [],
      outputs: [],
      images: [],
      positions: [],
      catalog_stars: [],
      selected2: '',
      lightboxIsOpen: false,
      currentImage: 0,
      visible: false,
      imageId: [],
      prev: null,
      next: null,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const asteroid_id = params.id;

    this.api.getAsteroidById({ id: asteroid_id }).then(res => {
      const asteroid = res.data;

      if (asteroid.id) {
        this.getinputs(asteroid);

        this.getOutputs(asteroid);

        this.getOccultations(asteroid);

        //this.getCatalogData(asteroid);

        this.getNeighbors(asteroid.id);

        let title = asteroid.name;
        if (asteroid.number && asteroid.number !== '-') {
          title = title + ' - ' + asteroid.number;
        }
        this.setState({
          asteroid: asteroid,
          title: title,
        });
      }
    });
  }

  getinputs = asteroid => {
    // Recuperar os arquivos de entrada
    this.api.getAsteroidInputs({ id: asteroid.id }).then(res => {
      const inputs = res.data.results;

      this.setState({
        inputs: inputs,
      });
    });
  };

  getOutputs = asteroid => {
    //Recuperar os arquivos de resultados
    this.api.getAsteroidOutputs({ id: asteroid.id }).then(res => {
      const files = res.data.results;
      const childrens = [];

      files.forEach(e => {
        childrens.push({
          data: e,
          expanded: true,
        });
      });

      //Estrutura dos arquivos em forma de tree
      const tree_data = [
        {
          data: {
            filename: asteroid.name,
          },
          children: childrens,
          expanded: true,
        },
      ];

      this.setState({
        outputs: tree_data,
      });
    });
  };

  getOccultations = asteroid => {
    this.api.getOccultations({ id: asteroid.id }).then(res => {
      const data = res.data.results;

      data.map((row, i) => {
        const src = row.src;
        row.src = src;
        return row;
      });

      this.setState({
        occultations: data,
        count_occultations: res.data.count,
        images: data,
      });
    });
  };

  getCatalogData = asteroid => {
    // Get Positions used in Catalog
    this.api.getCatalogPositions({ id: asteroid.id }).then(res => {
      const positions = res.data.results;

      // Get Stars in Catalog
      this.api.getCatalogStars({ id: asteroid.id }).then(res => {
        const catalog_stars = res.data.results;
        this.setState({
          positions: positions,
          catalog_stars: catalog_stars,
        });
      });
    });
  };

  getNeighbors = id => {
    this.api.getAsteroidNeighbors({ id }).then(res => {
      const neighbors = res.data;
      this.setState({
        prev: neighbors.prev,
        next: neighbors.next,
      });
    });
  };

  // Methods for slide operation
  Slideshow = e => {
    //event.preventDefault();
    this.setState({
      lightboxIsOpen: true,
    });
  };
  gotoNextLightboxImage = () => {
    this.setState({
      currentImage: this.state.currentImage + 1,
    });
  };
  gotoPrevLightboxImage = () => {
    this.setState({
      currentImage: this.state.currentImage - 1,
    });
  };
  CloseLightbox = () => {
    this.setState({ lightboxIsOpen: false });
  };
  gotoImage(index) {
    this.setState({
      currentImage: index,
    });
  }
  handleClickImage = () => {
    if (this.state.currentImage === this.state.images.length - 1) return;
    this.gotoNextLightboxImage();
  };
  onClick = () => {
    const row = this.state.selected2;
    if (!row) {
      alert('Nenhum registro selecionado');
    } else {
      this.setState({ id: row });
      this.setState({ visible: true });
    }
  };
  onHide = () => {
    this.setState({ visible: false });
  };

  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() => this.onClickBack(this.state.asteroid.predict_run)}
          />
        </div>

        <div className="ui-toolbar-group-right">
          <Button
            label="Prev"
            icon="fa fa-arrow-left"
            disabled={this.state.prev ? false : true}
            onClick={() => this.onClickPrev(this.state.prev)}
          />
          <Button
            label="Next"
            icon="fa fa-arrow-right"
            iconPos="right"
            disabled={this.state.next ? false : true}
            onClick={() => this.onClickNext(this.state.next)}
          />
        </div>
      </Toolbar>
    );
  };

  onClickBack = orbit_run => {
    const history = this.props.history;
    history.push({ pathname: `/prediction_detail/${orbit_run}` });
  };

  onClickPrev = prev => {
    const history = this.props.history;
    history.push({ pathname: `${prev}` });
    // TODO nao deveria usar reload aqui.
    window.location.reload();
  };

  onClickNext = next => {
    const history = this.props.history;
    history.push({ pathname: `${next}` });
    window.location.reload();
  };

  statsTable = asteroid => {
    const stats_asteroid = [
      { name: 'Asteroid', value: asteroid.name },
      { name: 'Number', value: asteroid.number },
      { name: 'Execution Time', value: asteroid.h_execution_time },
      { name: 'Occultations', value: asteroid.occultations },
    ];

    return (
      <ListStats
        statstext={asteroid.status}
        status={true}
        data={stats_asteroid}
      />
    );
  };

  moreInfoTable = asteroid => {
    const stats_asteroid = [
      { name: 'Catalog', value: asteroid.catalog },
      { name: 'Neighborhood Stars', value: asteroid.catalog_rows },
      { name: 'Planetary Ephemeris', value: asteroid.planetary_ephemeris },
      { name: 'Leap Seconds', value: asteroid.leap_second },
      { name: 'Observations', value: '*TODO*' },
    ];

    return <ListStats status={false} data={stats_asteroid} />;
  };

  executionTimeTable = asteroid => {

    const stats_asteroid = [
      {
        name: 'Ephemeris',
        value: asteroid.execution_ephemeris,
      },
      {
        name: 'Catalog',
        value: asteroid.execution_catalog,
      },
      { name: 'Search Candidate', value: asteroid.execution_search_candidate },
      { name: 'Maps', value: asteroid.execution_maps },
    ];

    return <ListStats status={false} data={stats_asteroid} />;
  };

  occultationTable = occultations => {
    const columns = [
      {
        field: 'date_time',
        header: 'Date Time',
        style: { textAlign: 'center', width: '180px' },
      },
      {
        field: 'ra_star_candidate',
        header: 'RA Candidate',
      },
      { field: 'dec_star_candidate', header: 'Dec Candidate' },
      { field: 'ra_target', header: 'RA Target' },
      { field: 'dec_target', header: 'Dec Target' },
      {
        field: 'closest_approach',
        header: 'C/A',
        style: { textAlign: 'center', width: '80px' },
      },
      {
        field: 'position_angle',
        header: 'P/A',
        style: { textAlign: 'center', width: '80px' },
      },
      {
        field: 'g',
        header: 'G*',
        style: { textAlign: 'center', width: '60px' },
      },
      {
        field: 'j',
        header: 'J*',
        style: { textAlign: 'center', width: '60px' },
      },
      {
        field: 'h',
        header: 'H*',
        style: { textAlign: 'center', width: '60px' },
      },
      {
        field: 'k',
        header: 'K*',
        style: { textAlign: 'center', width: '60px' },
      },
    ];

    const dynamicColumns = columns.map((col, i) => {
      return (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          style={col.style}
        />
      );
    });

    return (
      <DataTable
        value={occultations}
        rowClassName={rowData => {
          const already_happened = rowData.already_happened;
          return { 'text-indianred': already_happened === true };
        }}
      >
        {dynamicColumns}
      </DataTable>
    );
  };

  occultationsCards = occultations => {
    const cards = occultations.map((occ, i) => {
      return (
        <Card key={i} subTitle="">
          <div className="ui-g">
            {/* MAP */}
            <div className="ui-md-6">
              <img
                key={i}
                id={occ.filename}
                onClick={this.Slideshow}
                width="100%"
                src={occ.src}
                alt={occ.filename}
              />
            </div>
            {/* Atributos */}
            <div className="ui-md-6">
              <div className="flex-container row">
                <p>already_happened</p>
                <span>{occ.already_happened}</span>
              </div>
              <div className="flex-container row">
                <p>asteroid :</p>
                <span>{occ.asteroid}</span>
              </div>
              <div className="flex-container row">
                <p>closest_approach :</p>
                <span>{occ.closest_approach}</span>
              </div>
              <div className="flex-container row">
                <p>ct :</p>
                <span>{occ.ct}</span>
              </div>
              <div className="flex-container row">
                <p>date_time :</p>
                <span>{occ.date_time}</span>
              </div>
              <div className="flex-container row">
                <p>dec_star_candidate :</p>
                <span>{occ.dec_star_candidate}</span>
              </div>
              <div className="flex-container row">
                <p>dec_star_candidate :</p>
                <span>{occ.dec_star_candidate}</span>
              </div>
              <div className="flex-container row">
                <p>dec_target :</p>
                <span>{occ.dec_target}</span>
              </div>
              <div className="flex-container row">
                <p>delta :</p>
                <span>{occ.delta}</span>
              </div>
              <div className="flex-container row">
                <p>e_dec :</p>
                <span>{occ.delta}</span>
              </div>
              <div className="flex-container row">
                <p>e_ra :</p>
                <span>{occ.e_ra}</span>
              </div>
              <div className="flex-container row">
                <p>g :</p>
                <span>{occ.g}</span>
              </div>
              <div className="flex-container row">
                <p>h :</p>
                <span>{occ.h}</span>
              </div>
              <div className="flex-container row">
                <p>id :</p>
                <span>{occ.h}</span>
              </div>
              <div className="flex-container row">
                <p>j :</p>
                <span>{occ.h}</span>
              </div>
              <div className="flex-container row">
                <p>k :</p>
                <span>{occ.k}</span>
              </div>
              <div className="flex-container row">
                <p>loc_t :</p>
                <span>{occ.loc_t}</span>
              </div>
              <div className="flex-container row">
                <p>multiplicity_flag :</p>
                <span>{occ.multiplicity_flag}</span>
              </div>
            </div>
          </div>
        </Card>
      );
    });

    return <div>{cards}</div>;
  };

  inputsTable = inputs => {
    const input_columns = [
      {
        field: 'input_type',
        header: 'Input',
        sortable: true,
      },
      {
        field: 'filename',
        header: 'Filename',
        sortable: true,
      },
      {
        field: 'file_size',
        header: 'File size',
        sortable: true,
      },
      {
        field: 'h_size',
        header: 'h_size',
        sortable: true,
      },
    ];

    const inp_columns = input_columns.map((col, i) => {
      return (
        <Column
          key={i}
          field={col.field}
          header={col.header}
          sortable={col.sortable}
          style={col.style}
          body={col.body}
        />
      );
    });

    return (
      <DataTable value={inputs} sortField={'input_type'} sortOrder={1}>
        {inp_columns}
      </DataTable>
    );
  };

  catalogPlot = (positions, catalog_stars) => {
    if (positions && positions.length > 0 && catalog_stars.length > 0) {
      return (
        <div className="plot_predict_radius">
          <PlotPrediction
            positions={this.state.positions}
            stars={this.state.catalog_stars}
          />
        </div>
      );
    } else {
      return <div className="plot_predict_radius" />;
    }
  };

  outputsTable = outputs => {
    return (
      <TreeTable value={outputs} sortField={'filename'}>
        <Column field="filename" header="Name" sortable={true} />
        <Column
          field="h_size"
          header="Size"
          sortable={true}
          style={{ width: 100 }}
        />
        <Column
          field="file_type"
          header="Type"
          style={{ textAlign: 'center', width: 80 }}
          sortable={true}
        />
      </TreeTable>
    );
  };

  render() {
    return (
      <div className="content">
        {this.create_nav_bar()}
        <div className="ui-g">
          <div className="ui-md-4">
            <PanelCostumize
              title={this.state.title}
              content={this.statsTable(this.state.asteroid)}
            />
          </div>
          <div className="ui-md-4">
            <PanelCostumize
              title="Info"
              content={this.moreInfoTable(this.state.asteroid)}
            />
          </div>
          <div className="ui-md-4">
            <PanelCostumize
              title="Times"
              content={this.executionTimeTable(this.state.asteroid)}
            />
          </div>
        </div>
        <div className="ui-md-12">
          <Card title="Occultations" subTitle="">
            {this.occultationTable(this.state.occultations)}
          </Card>
        </div>
        <div className="ui-md-12">
          {this.occultationsCards(this.state.occultations)}
        </div>

        <div />
        <div className="ui-g">
          <div className="ui-md-12">
            <Card title="Catalog" subTitle="">
              {this.catalogPlot(this.state.positions, this.state.catalog_stars)}
            </Card>
          </div>
          <div className="ui-md-6">
            <Card title="Inputs" subTitle="">
              {this.inputsTable(this.state.inputs)}
            </Card>
          </div>
          <div className="ui-md-6">
            <Card title="Output" subTitle="">
              {this.outputsTable(this.state.outputs)}
            </Card>
          </div>
        </div>
        <Lightbox
          images={this.state.images}
          isOpen={this.state.lightboxIsOpen}
          onClickPrev={this.gotoPrevLightboxImage}
          onClickNext={this.gotoNextLightboxImage}
          onClose={this.CloseLightbox}
          currentImage={this.state.currentImage}
          onClickImage={this.handleClickImage}
          onClickThumbnail={this.gotoImage}
        />
      </div>
    );
  }
}

export default withRouter(AsteroidDetailPrediction);
