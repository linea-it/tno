// React e Prime React
import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import OrbitApi from './OrbitApi';
// interface components
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
// import { Tree } from 'primereact/tree';
import Lightbox from 'react-images';
// import { Tree } from 'primereact/tree';
import { Panel } from 'primereact/panel';
//importing images
// import plot1 from 'assets/img/1.png';
import plot1 from 'assets/img/1.png';
import plot2 from 'assets/img/2.png';
import plot3 from 'assets/img/3.png';
import plot4 from 'assets/img/4.png';
import download from 'assets/img/download.jpeg';
import Log from 'views/RefineOrbit/Log.jsx';
import { TreeTable } from 'primereact/treetable';

const statistics = [
  { text: 'Total de Objetos de entrada', value: '5' },
  { text: 'Total de objetos excecutados', value: '4' },
  { text: 'Total de objetos falhados', value: '0' },
  { text: 'Tempo de execução', value: '00:02:10' },
  { text: 'Tempo médio por objeto', value: '00:00:23' },
];
const images = [
  { src: plot1, id: 0 },
  { src: plot2, id: 1 },
  { src: plot3, id: 2 },
  { src: plot4, id: 3 },
];

const data = [
  {
    data: {
      name: 'Documents',
      size: '75kb',
      type: 'Folder',
    },
    children: [
      {
        data: {
          name: 'Work',
          size: '55kb',
          type: 'Folder',
        },
        children: [
          {
            data: {
              name: 'Expenses.doc',
              size: '30kb',
              type: 'Document',
            },
          },
          {
            data: {
              name: 'Resume.doc',
              size: '25kb',
              type: 'Resume',
            },
          },
        ],
      },
      {
        data: {
          name: 'Home',
          size: '20kb',
          type: 'Folder',
        },
        children: [
          {
            data: {
              name: 'Invoices',
              size: '20kb',
              type: 'Text',
            },
          },
        ],
      },
    ],
  },
  {
    data: {
      name: 'Pictures',
      size: '150kb',
      type: 'Folder',
    },
    children: [
      {
        data: {
          name: 'barcelona.jpg',
          size: '90kb',
          type: 'Picture',
        },
      },
      {
        data: {
          name: 'primeui.png',
          size: '30kb',
          type: 'Picture',
        },
      },
      {
        data: {
          name: 'optimus.jpg',
          size: '30kb',
          type: 'Picture',
        },
      },
    ],
  },
];

class RefineOrbitDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  get initialState() {
    return {
      id: '',
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
      // Tempo em segundos entre cada reload da lista
      reload_interval: 10,
      selected: [],
      selected_record: null,
      cars: [],
      valor: '5',
      selected2: '',
      lightboxIsOpen: false,
      currentImage: 0,
      visible: false,
      activeIndex: 0,
    };
  }

  componentDidMount() {
    this.fetchData(this.state.page, this.state.sizePerPage);
    this.setState({ activeIndex: 1 });

    // Array of table rows
    const data = [
      {
        id: '0001',
        input_displayname: '2013 RR98',
        input_list: '1',
        owner: 'KBO>SDO',
        proccess: '61.470785',
        proccess_displayname: '-16.250106',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-check "
            style={{ fontSize: '1.5em', color: 'green' }}
          />
        ),
      },
      {
        id: '0002',
        input_displayname: '2013 RR98',
        input_list: '2',
        owner: 'KBO>SDO',
        proccess: '93.63396',
        proccess_displayname: '-45.186892',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-exclamation-triangle"
            style={{ fontSize: '1.5em', color: '#FF8C00' }}
          />
        ),
      },
      {
        id: '0003',
        input_displayname: '2014 RR98',
        input_list: '3',
        owner: 'KBO>SDO',
        proccess: '93.634311',
        proccess_displayname: '-45.186462',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-times"
            style={{ fontSize: '1.5em', color: '#B22222' }}
          />
        ),
      },
      {
        id: '0004',
        input_displayname: '2014 RR98',
        input_list: '3',
        owner: 'KBO>SDO',
        proccess: '93.634311',
        proccess_displayname: '-45.186462',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-times"
            style={{ fontSize: '1.5em', color: '#B22222' }}
          />
        ),
      },
      {
        id: '0005',
        input_displayname: '2014 RR98',
        input_list: '3',
        owner: 'KBO>SDO',
        proccess: '93.634311',
        proccess_displayname: '-45.186462',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-times"
            style={{ fontSize: '1.5em', color: '#B22222' }}
          />
        ),
      },
    ];
    this.setState({ cars: data });
  }

  fetchData = (page, sizePerPage) => {
    // console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

    this.setState({ loading: true });

    this.api.getOrbitRuns({ page: page, pageSize: sizePerPage }).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        page: page,
        sizePerPage: sizePerPage,
        loading: false,
      });
    });
  };

  // Methods for slide operation

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
    if (this.state.currentImage === images.length - 1) return;
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
  // Render

  // active = value => {};

  render() {
    //Array with the amount of previews
    const item = [
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '15', value: '15' },
    ];

    // Array with table columns
    const cols = [
      { field: 'input_displayname', header: 'Name' },
      { field: 'owner', header: 'Dinamics class' },
      { field: 'proccess', header: 'RA' },
      { field: 'proccess_displayname', header: 'Dec' },
      { field: 'status', header: 'Status' },
    ];

    // Filling the columns
    const dynamicColumns = cols.map((col, i) => {
      return (
        <Column
          rowClassName={this.rowClassName}
          key={i.field}
          field={col.field}
          header={col.header}
          style={{ textAlign: 'center' }}
        />
      );
    });

    const openLightbox = (index, event) => {
      return (
        event.preventDefault(),
        this.setState({
          lightboxIsOpen: true,
          currentImage: index,
        })
      );
    };
    // List of execution statistics
    const List = statistics.map((element, i) => (
      <ListGroupItem key={i}>
        {element.text}:&nbsp;<strong>{element.value}</strong>
      </ListGroupItem>
    ));

    const header = <img alt="Card" height="20" src={download} />;
    const preview = [];
    const lenght = this.state.valor;
    for (let index = 1; index <= lenght; index++) {
      preview.push(
        <AccordionTab header={`2013 RR98 ${index}`}>
          <Panel>
            <div className="ui-g">
              <div className="ui-md-12">
                <div className="ui-g-12">
                  {images.map(function(i) {
                    return (
                      <a
                        key={i.id}
                        onClick={e => {
                          openLightbox(i.id, e);
                        }}
                      >
                        <img width="325" height="280" src={i.src} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>
          <br />
          <Panel>
            <TreeTable value={data} header="Basic">
              <Column field="name" header="Name" />
              <Column field="size" header="Size" />
              <Column field="type" header="Type" />
            </TreeTable>
          </Panel>
        </AccordionTab>
      );
    }
    return (
      <div className="content">
        <div className="ui-g">
          <div className="ui-md-6">
            <Card
              header={header}
              title="Execution Statistics"
              style={{ border: 1 + 'px solid #A9A9A9' }}
              subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
            >
              <div className="ui-g">
                <div className="ui-md-6"> {List}</div>

                <div className="content-section implementation">
                  <div className="ui-md-6" />
                </div>
              </div>
            </Card>
          </div>

          <div className="ui-md-6" />
        </div>
        <br />
        <br />
        <Lightbox
          images={images}
          isOpen={this.state.lightboxIsOpen}
          onClickPrev={this.gotoPrevLightboxImage}
          onClickNext={this.gotoNextLightboxImage}
          onClose={this.CloseLightbox}
          currentImage={this.state.currentImage}
          onClickImage={this.handleClickImage}
          onClickThumbnail={this.gotoImage}
        />
        <Card
          style={{ border: 1 + 'px solid #A9A9A9' }}
          title="Preview"
          subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
        >
          <Toolbar>
            <Dropdown
              style={{ width: '250px' }}
              value={this.state.valor}
              options={item}
              onChange={e => {
                this.setState({ valor: e.value });
              }}
              placeholder="Select a value"
            />
            <Accordion activeIndex={this.activeIndex}>{preview}</Accordion>
          </Toolbar>
        </Card>
        <br />
        <br />
        <Card
          style={{ border: 1 + 'px solid #A9A9A9' }}
          title="Table of Objects"
          subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
        >
          <Toolbar>
            <div className="ui-toolbar-group-left">
              <Button label="View" icon="pi pi-plus" />
              <Button
                label="Log"
                icon="pi pi-file"
                className="ui-button-warning"
                onClick={this.onClick}
              />
            </div>
          </Toolbar>
          <Log
            visible={this.state.visible}
            onHide={this.onHide}
            id={this.state.id}
          />
          <div className="content-section implementation">
            <DataTable
              selectionMode="single"
              style={{ border: 1 + 'px solid #A9A9A9', textAlign: 'center' }}
              value={this.state.cars}
              selection={this.state.selected2}
              onSelectionChange={e => this.setState({ selected2: e.data })}
            >
              {dynamicColumns}
            </DataTable>
          </div>
        </Card>
      </div>
    );
  }
}

export default RefineOrbitDetail;
