import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import moment from 'moment';
import PraiaApi from './PraiaApi';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import ListStats from 'components/Statistics/ListStats.jsx';


export default class AsteroidRunDetail extends Component {
  state = this.initialState;
  api = new PraiaApi();

  // static propTypes = {
  //     match: PropTypes.object.isRequired,
  //     history: PropTypes.any.isRequired,
  //   };

  get initialState() {
    return {
      id: 0,
      asteroid: {},
      inputs: [],
      files: [],
      prev: null,
      next: null,
      download_icon: 'fa fa-cloud-download',
      praiaId: 0,
      proccess: null,
    };
  }

  input_columns = [
    {
      field: 'input_type',
      header: 'Input Type',
      sortable: true,
    },
    {
      field: 'h_file_size',
      header: 'File Size',
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


    this.setState({ proccess: params.proccess });

    const asteroid_id = params.id;
    this.api.getAsteroidById(asteroid_id).then(res => {
      this.setState({ asteroid: res.data });
    });

    // Recuperar os Inputs
    this.api.getInputsByAsteroidId({ id: asteroid_id }).then(res => {
      const inputs = res.data.results;

      this.setState({
        inputs: inputs,
      });
    });

  }


  onClickBackToAstrometryRun = praia_run => {
    const history = this.props.history;
    history.push({ pathname: `/astrometry_run/${praia_run}` });
  };

  // onClickDownload = async asteroid_id => {
  //     // Alterar o Icone do botao para loading
  //     this.setState({
  //         download_icon: 'fa fa-circle-o-notch fa-spin fa-fw',
  //     });

  //     const download_link = await this.api.getAsteroidDownloadLink({
  //         asteroid_id,
  //     });

  //     const data = download_link.data;

  //     if (data.success) {
  //         const file_src = this.api.api + data.src;

  //         // window.location.href = file_src;
  //         window.location.assign(file_src);
  //     } else {
  //         // TODO: Implementar notificacao de erro.
  //     }

  //     // Alterar o Icone do botao para downlaod
  //     this.setState({
  //         download_icon: 'fa fa-cloud-download',
  //     });
  // };


  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() =>
              this.onClickBackToAstrometryRun(this.state.asteroid.astrometry_run)
            }
          />
          <Button
            label="Download"
            icon={this.state.download_icon}
            className="ui-button-info"
            disabled="disabled"
          // onClick={() => this.onClickDownload(this.state.asteroid.id)}
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

  handleView = (rowData) => {

    const proccess = this.state.proccess;

    const filepath = encodeURIComponent(rowData.file_path);
    const filename = encodeURIComponent(rowData.filename);
    const title = encodeURIComponent("File " + rowData.filename + " of the asteroid " + rowData.asteroid + ". \u00a0  Execution: " + proccess);

    const history = this.props.history;
    history.push(`/astrometry_read_csv/${filepath}/${filename}/${title}`);
  }

  actionTemplate = (rowData) => {

    if (rowData.file_type === 'csv') {
      return (
        <Button
          type="button"
          icon="fa fa-search"
          className="ui-button-info"
          title="View"

          onClick={() => this.handleView(rowData)}
        />
      );
    }
  }

  render() {
    const { asteroid, inputs } = this.state;

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

    return (
      <div>
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

        <div className="ui-g-8">
          <Card>
            <DataTable
              value={inputs}
              sortField={'input_type'}
              sortOrder={1}
            >
              {inp_columns}
              <Column
                style={{ textAlign: 'center' }}
                body={this.actionTemplate}
              />
            </DataTable>
          </Card>
        </div>
      </div>
    );
  }
}