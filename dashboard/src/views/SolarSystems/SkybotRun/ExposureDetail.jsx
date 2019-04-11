// React e Prime React
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import SkybotApi from 'views/SolarSystems/SkybotApi';
// interface components
import { Card } from 'primereact/card';
import Lightbox from 'react-images';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import ListStats from 'components/Statistics/ListStats.jsx';

class ExposureDetail extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      skybotrun: null,
      expnum: null,
    };
  }
  columns = [
    {
      field: 'num',
      header: 'Number',
      sortable: false,
    },
    {
      field: 'name',
      header: 'Name',
      sortable: false,
    },
    {
      field: 'dynclass',
      header: 'DynClass',
      sortable: false,
    },
    {
      field: 'ra',
      header: 'RA',
      sortable: false,
    },
    {
      field: 'dec',
      header: 'Dec',
      sortable: false,
    },
    {
      field: 'mv',
      header: 'mv',
      sortable: false,
    },
    {
      field: 'errpos',
      header: 'errpos',
      sortable: false,
    },
    {
      field: 'd',
      header: 'd',
      sortable: false,
    },
    {
      field: 'epoch',
      header: 'epoch',
      sortable: false,
    },
  ]
  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const skybotrun = params.skybotrun;
    const expnum = params.expnum;

    this.api.getSkybotResultByExposure(skybotrun, expnum).then(res => {
      const data = res.data;
      console.log("Data: ", data)

      this.setState({
        skybotrun: skybotrun,
        expnum: expnum,
        skybotOutput: data.rows,
      });
    })

    // this.api.getAsteroidById({ id: asteroid_id }).then(res => {
    //   const asteroid = res.data;

    //   if (asteroid.id) {
    //     // Recuperar os arquivos de resultados
    //     this.api.getAsteroidFiles({ id: asteroid_id }).then(res => {
    //       const files = res.data.results;

    //       // Lista so com os arquivos que sao imagens
    //       const excluded_images = ['omc_sep.png'];
    //       const images = [];

    //       const childrens = [];

    //       files.forEach(e => {
    //         if (
    //           e.file_type === '.png' &&
    //           !excluded_images.includes(e.filename)
    //         ) {
    //           // O source deve apontar para o backend
    //           e.src = this.api.api + e.src;
    //           // Saber em qual ordem deve ser exibida a imagem.
    //           const idx = this.plot_images_order.indexOf(e.type);

    //           if (idx > -1) {
    //             images[idx] = e;
    //           }
    //         }

    //         childrens.push({
    //           data: e,
    //           expanded: true,
    //         });
    //       });

    //       // Estrutura dos arquivos em forma de tree
    //       const tree_data = [
    //         {
    //           data: {
    //             filename: asteroid.name,
    //           },
    //           children: childrens,
    //           expanded: true,
    //         },
    //       ];

    //       this.setState(
    //         {
    //           id: parseInt(params.id, 10),
    //           asteroid: asteroid,
    //           files: files,
    //           images: images,
    //           tree_data: tree_data,
    //         },
    //         this.getNeighbors(asteroid_id)
    //       );
    //     });

    //     // Recuperar os Inputs
    //     this.api.getAsteroidInputs({ id: asteroid_id }).then(res => {
    //       const inputs = res.data.results;
    //       this.setState({
    //         inputs: inputs,
    //       });
    //     });
    //   }
    // });
  }

  create_nav_bar = () => {
    const { skybotrun } = this.state;

    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() => this.onClickBack(skybotrun)}
          />
        </div>

        <div className="ui-toolbar-group-right" />
      </Toolbar>
    );
  };

  onClickBack = skybotrun => {
    const history = this.props.history;
    history.push({ pathname: `/skybotrun_detail/${skybotrun}` });
  };


  render() {
    // const asteroid = this.state.asteroid;

    const { skybotOutput } = this.state;

    const columns = this.columns.map((col, i) => {
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
            Teste
          </div>
        </div>
        <div className="ui-g" />
        <div className="ui-g">
          <div className="ui-g-12">
            <Card title="Skybot Outputs" subTitle="">
              <DataTable
                value={skybotOutput}
                reorderableColumns={false}
                reorderableRows={false}
                responsive={true}
                scrollable={true}
              >
                {columns}
              </DataTable>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ExposureDetail);
