// React e Prime React
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/omega/theme.css';
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

class AsteroidDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  get initialState() {
    return {
      id: 0,
      asteroid: {},
      files: [],
      images: [],
      tree_data: [],
      selected2: '',
      lightboxIsOpen: false,
      currentImage: 0,
      visible: false,
      imageId: [],
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
        // Recuperar os arquivos de resultados
        this.api.getAsteroidFiles({ id: asteroid_id }).then(res => {
          const files = res.data.results;

          // Lista so com os arquivos que sao imagens
          const excluded_images = ['diff_bsp-ni.png', 'omc_sep.png'];
          const images = [];

          const childrens = [];

          files.forEach(e => {
            if (
              e.file_type === '.png' &&
              !excluded_images.includes(e.filename)
            ) {
              // O source deve apontar para o backend
              e.src = this.api.api + e.src;
              images.push(e);
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

          this.setState({
            id: parseInt(params.id, 10),
            asteroid: asteroid,
            files: files,
            images: images,
            tree_data: tree_data,
          });
        });
      }
    });
  }

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
    console.log('onClickDownload(%o)', asteroid_id);
    this.api.getAsteroidDownloadLink({ asteroid_id }).then(res => {
      const data = res.data;
      console.log(data);
      if (data.success) {
        console.log('FUNCIONOU');
        const file_src = this.api.api + data.src;
        console.log(file_src);
        window.open(file_src);
      } else {
        // TODO: Implementar notificacao de erro.
      }
    });
  };

  render() {
    const asteroid = this.state.asteroid;

    let title = asteroid.name;
    if (asteroid.number && asteroid.number !== '-') {
      title = title + ' - ' + asteroid.number;
    }
    return (
      <div className="content">
        <div className="ui-g">
          <div className="ui-g-4">
            <Card
              title={title}
              subTitle={
                'this result refers to process ' + asteroid.proccess_displayname
              }
            >
              <span>Status: {asteroid.status}</span> <br />
              <span>executed: {asteroid.h_time}</span> <br />
              <span>execution time: {asteroid.h_execution_time}</span> <br />
              <span>Size: {asteroid.h_size}</span> <br />
              <Button
                label="Download"
                icon="pi pi-cloud-download"
                className="ui-button-info"
                onClick={() => this.onClickDownload(asteroid.id)}
              />
            </Card>
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
                    onClick={this.Slideshow}
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
          <div className="ui-g-4">
            <Card
              title="Files"
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
          <div className="ui-g-4">
            <Card
              title="Observations"
              subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
            />
          </div>
          <div className="ui-g-4">
            <Card
              title="Orbital Parameters"
              subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
            />
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

export default withRouter(AsteroidDetail);
