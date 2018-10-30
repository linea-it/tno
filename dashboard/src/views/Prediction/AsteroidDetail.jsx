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
// import Content from 'components/CardContent/CardContent.jsx';
// import Lightbox from 'react-images';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import ListStats from 'components/Statistics/ListStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
// import { Row } from 'primereact/row';
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
      files: [],
      images: [],
      tree_data: [],
      selected2: '',
      lightboxIsOpen: false,
      currentImage: 0,
      visible: false,
      imageId: [],
      prev: null,
      next: null,
    };
  }

  input_columns = [
    {
      field: 'input_type',
      header: 'Input',
      sortable: true,
    },
    {
      field: 'source',
      header: 'Source',
      sortable: true,
    },
    {
      field: 'date_time',
      header: 'Date',
      sortable: true,
    },
    {
      field: 'filename',
      header: 'Filename',
      sortable: true,
    },
  ];

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const asteroid_id = params.id;

    this.api.getAsteroidById({ id: asteroid_id }).then(res => {
      const asteroid = res.data;

      if (asteroid.id) {
        this.setState({
          id: parseInt(params.id, 10),
          asteroid: asteroid,
        });

        // Recuperar os arquivos de resultados
        // this.api.getAsteroidFiles({ id: asteroid_id }).then(res => {
        //   const files = res.data.results;

        //   // Lista so com os arquivos que sao imagens
        //   const excluded_images = ['diff_bsp-ni.png', 'omc_sep.png'];
        //   const images = [];

        //   const childrens = [];

        //   files.forEach(e => {
        //     if (
        //       e.file_type === '.png' &&
        //       !excluded_images.includes(e.filename)
        //     ) {
        //       // O source deve apontar para o backend
        //       e.src = this.api.api + e.src;
        //       images.push(e);
        //     }

        //     childrens.push({
        //       data: e,
        //       expanded: true,
        //     });
        //   });

        // Estrutura dos arquivos em forma de tree
        //   const tree_data = [
        //     {
        //       data: {
        //         filename: asteroid.name,
        //       },
        //       children: childrens,
        //       expanded: true,
        //     },
        //   ];

        //   this.setState(
        //     {
        //       id: parseInt(params.id, 10),
        //       asteroid: asteroid,
        //       files: files,
        //       images: images,
        //       tree_data: tree_data,
        //     },
        //     this.getNeighbors(asteroid_id)
        //   );
        // });

        // // Recuperar os Inputs
        // this.api.getAsteroidInputs({ id: asteroid_id }).then(res => {
        //   const inputs = res.data.results;
        //   this.setState({
        //     inputs: inputs,
        //   });
        // });
      }
    });
  }

  getNeighbors = asteroid_id => {
    this.api.getAsteroidNeighbors({ asteroid_id }).then(res => {
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

  onClickDownload = asteroid_id => {
    this.api.getAsteroidDownloadLink({ asteroid_id }).then(res => {
      const data = res.data;
      if (data.success) {
        const file_src = this.api.api + data.src;
        window.open(file_src);
      } else {
        // TODO: Implementar notificacao de erro.
      }
    });
  };

  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back to Refine Orbit"
            icon="fa fa-undo"
            onClick={() =>
              this.onClickBackToRefine(this.state.asteroid.predict_run)
            }
          />
          <Button
            label="Download"
            icon="pi pi-cloud-download"
            className="ui-button-info"
            onClick={() => this.onClickDownload(this.state.asteroid.id)}
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

  onClickBackToRefine = orbit_run => {
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

  render() {
    const asteroid = this.state.asteroid;

    const columns = [
      { field: 'date', header: 'Date Time' },
      { field: 'ra_candidate', header: 'RA Candidate' },
      { field: 'dec_candidate', header: 'Dec Candidate' },
      { field: 'ra_target', header: 'RA Target' },
      { field: 'dec_target', header: 'Dec Target' },
      { field: 'ca', header: 'C/A' },
      { field: 'pa', header: 'P/A' },
      { field: 'g', header: 'G*' },
      { field: 'j', header: 'J*' },
      { field: 'H', header: 'H*' },
      { field: 'K', header: 'K*' },
    ];

    const stats_asteroid = [
      { name: 'Asteroid', value: asteroid.name },
      { name: 'Number', value: asteroid.number },
      { name: 'Execution Time', value: asteroid.h_execution_time },
      { name: 'Size', value: asteroid.h_size },
    ];

    const stats = [
      { name: 'Date Time', value: asteroid.proccess_displayname },
      { name: 'Candidate', value: asteroid.h_time },
      { name: 'Target', value: asteroid.h_execution_time },
      { name: 'vel', value: asteroid.h_size },
      { name: 'Delta', value: asteroid.h_size },
      { name: 'G*', value: asteroid.h_size },
      { name: 'pmra', value: asteroid.h_size },
      { name: 'pmde', value: asteroid.h_size },
    ];
    
    const image = [
      {
        src: '',
        filename: 'earth',
      },
    ];
    // const headerGroup = (
    //   <ColumnGroup>
    //     <Row>
    //       <Column header="Brand" rowSpan={3} />
    //       <Column header="Sale Rate" colSpan={4} />
    //     </Row>
    //     <Row>
    //       <Column header="Sales" colSpan={2} />
    //       <Column header="Profits" colSpan={2} />
    //     </Row>
    //     <Row>
    //       <Column header="Last Year" />
    //       <Column header="This Year" />
    //       <Column header="Last Year" />
    //       <Column header="This Year" />
    //     </Row>
    //   </ColumnGroup>
    // );

    const dynamicColumns = columns.map((col, i) => {
      return <Column key={col.field} field={col.field} header={col.header} />;
    });

    const map = columns.map((col, i) => {
      return (
        <div key={i}>
          <PanelCostumize
            noHeader={true}
            content={
              <div className="ui-g">
                <div className="ui-md-6">
                  {image.map((e, i) => {
                    return (
                      <div className="plot_predict_earth" key={i}>
                        {/* <img id={e.filename} src={map_010} alt={e.filename} /> */}
                      </div>
                    );
                  })}
                </div>
                <div className="ui-md-6">
                  <ListStats
                    title={title}
                    statstext={this.state.asteroid.status}
                    status={false}
                    data={stats}
                  />
                </div>
              </div>
            }
          />
          <br />
        </div>
      );
    });

    let title = asteroid.name;
    if (asteroid.number && asteroid.number !== '-') {
      title = title + ' - ' + asteroid.number;
    }

    const inp_columns = this.input_columns.map((col, i) => {
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
      <div className="content">
        {this.create_nav_bar()}
        <div className="ui-g">
          <div className="ui-md-12">
            <PanelCostumize
              title="Placeholder"
              content={
                <ListStats
                  title={title}
                  statstext={asteroid.status}
                  status={true}
                  data={stats_asteroid}
                />
              }
            />
          </div>
        </div>
        <div className="ui-md-12">
          <PanelCostumize
            title="Placeholder"
            content={
              <DataTable
                value={this.state.asteroid}
                // headerColumnGroup={headerGroup}
              >
                {dynamicColumns}
              </DataTable>
            }
          />
        </div>
        <div className="ui-md-12">{map}</div>

        <div />
        <div className="ui-g">
          <div className="ui-md-12">
            <Card
              title="Catalog"
              subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
            >
              <div className="plot_predict_radius">
                {/* <img src={map_010} alt="radius" /> */}
              </div>
            </Card>
          </div>
          <div className="ui-md-6">
            <Card
              title="Inputs"
              subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
            >
              <DataTable
                value={this.state.inputs}
                sortField={'input_type'}
                sortOrder={1}
              >
                {inp_columns}
              </DataTable>
            </Card>
          </div>
          <div className="ui-md-6">
            <Card
              title="Results"
              subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
            >
              <TreeTable value={this.state.tree_data} sortField={'filename'}>
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
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(AsteroidDetailPrediction);
