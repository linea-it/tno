// React e Prime React
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import OrbitApi from './OrbitApi';
// interface components
import { Card } from 'primereact/card';
import Lightbox from 'react-images';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import ListStats from 'components/Statistics/ListStats.jsx';
class AsteroidDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  plot_images_order = [
    'comparison_nima_jpl_ra',
    'comparison_nima_jpl_dec',
    'residual_all_v1',
    'residual_recent',
    'comparison_bsp_integration',
  ];

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
      download_icon: 'fa fa-cloud-download',
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
        // Recuperar os arquivos de resultados
        this.api.getAsteroidFiles({ id: asteroid_id }).then(res => {
          const files = res.data.results;

          // Lista so com os arquivos que sao imagens
          const excluded_images = ['omc_sep.png'];
          const images = [];

          const childrens = [];

          files.forEach(e => {
            if (
              e.file_type === '.png' &&
              !excluded_images.includes(e.filename)
            ) {
              // O source deve apontar para o backend
              e.src = this.api.api + e.src;
              // Saber em qual ordem deve ser exibida a imagem.
              const idx = this.plot_images_order.indexOf(e.type);

              if (idx > -1) {
                images[idx] = e;
              }
            }

            childrens.push({
              data: e,
              expanded: true,
            });
          });

          // Estrutura dos arquivos em forma de tree
          const tree_data = [
            {
              data: {
                filename: asteroid.name,
              },
              children: childrens,
              expanded: true,
            },
          ];

          this.setState(
            {
              id: parseInt(params.id, 10),
              asteroid: asteroid,
              files: files,
              images: images,
              tree_data: tree_data,
            },
            this.getNeighbors(asteroid_id)
          );
        });

        // Recuperar os Inputs
        this.api.getAsteroidInputs({ id: asteroid_id }).then(res => {
          const inputs = res.data.results;
          this.setState({
            inputs: inputs,
          });
        });
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

  openLightbox = (index, event) => {
    event.preventDefault();
    this.setState({
      currentImage: index,
      lightboxIsOpen: true,
    });
  };
  closeLightbox = () => {
    this.setState({
      currentImage: 0,
      lightboxIsOpen: false,
    });
  };
  gotoPrevious = () => {
    this.setState({
      currentImage: this.state.currentImage - 1,
    });
  };
  gotoNext = () => {
    this.setState({
      currentImage: this.state.currentImage + 1,
    });
  };
  gotoImage = index => {
    this.setState({
      currentImage: index,
    });
  };
  handleClickImage = () => {
    if (this.state.currentImage === this.images.length - 1) return;

    this.gotoNext();
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

  onClickDownload = async asteroid_id => {
    // Alterar o Icone do botao para loading
    this.setState({
      download_icon: 'fa fa-circle-o-notch fa-spin fa-fw',
    });

    const download_link = await this.api.getAsteroidDownloadLink({
      asteroid_id,
    });

    const data = download_link.data;

    if (data.success) {
      const file_src = this.api.api + data.src;

      // window.location.href = file_src;
      window.location.assign(file_src);
    } else {
      // TODO: Implementar notificacao de erro.
    }

    // Alterar o Icone do botao para downlaod
    this.setState({
      download_icon: 'fa fa-cloud-download',
    });
  };

  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() =>
              this.onClickBackToRefine(this.state.asteroid.orbit_run)
            }
          />
          <Button
            label="Download"
            icon={this.state.download_icon}

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
    history.push({ pathname: `/orbit_run_detail/${orbit_run}` });
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

    let title = asteroid.name;
    if (asteroid.number && asteroid.number !== '-') {
      title = title + ' - ' + asteroid.number;
    }

    const stats = [
      { name: 'Proccess', value: asteroid.proccess_displayname },
      { name: 'Executed', value: asteroid.h_time },
      { name: 'Execution Time', value: asteroid.h_execution_time },
      { name: 'Size', value: asteroid.h_size },
    ];

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
          <div className="ui-g-4">
            <ListStats
              title={title}
              statstext={asteroid.status}
              status={true}
              data={stats}
            />
          </div>
        </div>
        <div className="ui-g">
          {this.state.images.map((e, i) => {
            return (
              <div className="ui-g-5" key={i}>
                <Card subTitle={e.filename}>
                  <img
                    key={i}
                    id={e.filename}
                    onClick={el => this.openLightbox(i, el)}
                    width="100%"
                    src={e.src}
                    alt={e.filename}
                  />
                </Card>
              </div>
            );
          })}
        </div>
        <div className="ui-g">
          <div className="ui-g-6">
            <Card title="Inputs" subTitle="">
              <DataTable
                value={this.state.inputs}
                sortField={'input_type'}
                sortOrder={1}
              >
                {inp_columns}
              </DataTable>
            </Card>
          </div>
          <div className="ui-g-6">
            <Card title="Results" subTitle="">
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
        <Lightbox
          currentImage={this.state.currentImage}
          images={this.state.images}
          isOpen={this.state.lightboxIsOpen}
          onClickImage={this.handleClickImage}
          onClickNext={this.gotoNext}
          onClickPrev={this.gotoPrevious}
          onClickThumbnail={this.gotoImage}
          onClose={this.closeLightbox}
        />
      </div>
    );
  }
}

export default withRouter(AsteroidDetail);
