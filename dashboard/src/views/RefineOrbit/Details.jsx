import React, { Component } from 'react';
import OrbitApi from './OrbitApi';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ListGroup, ListGroupItem, Grid, Row, Col } from 'react-bootstrap';
import download from 'assets/img/download.jpeg';
import plot1 from 'assets/img/1.png';
import plot2 from 'assets/img/2.png';
import plot3 from 'assets/img/3.png';
import plot4 from 'assets/img/4.png';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Tree } from 'primereact/tree';
import { Panel } from 'primereact/panel';
import Lightbox from 'react-images';
import { Dialog } from 'primereact/dialog';

const images = [{ src: plot1 }, { src: plot2 }, { src: plot3 }, { src: plot4 }];

class RefineOrbitDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  get initialState() {
    return {
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
    };
  }

  componentDidMount() {
    this.fetchData(this.state.page, this.state.sizePerPage);
    const data = [
      {
        id: '0001',
        input_displayname: '2013 RR98',
        input_list: '1',
        owner: 'KBO>SDO',
        proccess: '61.470785',
        proccess_displayname: '-16.250106',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: <Button icon="pi pi-check" className="ui-button-success" />,
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
          <Button
            icon="pi pi-exclamation-triangle "
            className="ui-button-warning"
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
        status: <Button icon="pi pi-times " className="ui-button-danger" />,
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

  Slideshow = () => {
    this.setState({ lightboxIsOpen: true });
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
  handleClickImage() {
    if (this.state.currentImage === images.length - 1) return;

    this.gotoNextLightboxImag();
  }

  onClick = () => {
    this.setState({ visible: true });
  };

  onHide = () => {
    this.setState({ visible: false });
  };

  render() {
    const item = [
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '15', value: '15' },
    ];

    const cols = [
      { field: 'input_displayname', header: 'Name' },
      { field: 'owner', header: 'Dinamics class' },
      { field: 'proccess', header: 'RA' },
      { field: 'proccess_displayname', header: 'Dec' },
      { field: 'status', header: 'Status' },
    ];

    const dynamicColumns = cols.map((col, i) => {
      return (
        <Column
          rowClassName={this.rowClassName}
          key={col.field}
          field={col.field}
          header={col.header}
          style={{ textAlign: 'center' }}
        />
      );
    });

    const header = <img alt="Card" height="20" src={download} />;
    const preview = [];
    const lenght = this.state.valor;
    for (let index = 1; index <= lenght; index++) {
      preview.push(
        <AccordionTab header={`2013 RR98 ${index}`}>
          <Grid>
            <Row>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                >
                  <img
                    onClick={this.Slideshow}
                    width="425"
                    height="280"
                    src={plot1}
                  />
                </Card>
              </Col>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                >
                  <img
                    onClick={this.Slideshow}
                    width="425"
                    height="280"
                    src={plot2}
                  />
                </Card>
              </Col>
            </Row>
            <br />
            <Row>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum Lorem ipsum Lorem ipsum"
                >
                  <img
                    onClick={this.Slideshow}
                    width="425"
                    height="280"
                    src={plot3}
                  />
                </Card>
              </Col>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                >
                  <img
                    onClick={this.Slideshow}
                    width="425"
                    height="280"
                    src={plot4}
                  />
                </Card>
              </Col>
            </Row>
          </Grid>
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
                <div className="ui-md-6">
                  <ListGroup>
                    <ListGroupItem>
                      Total de Objetos de entrada&nbsp;:&nbsp;&nbsp;
                      <strong>5</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Total de objetos excecutados&nbsp;:&nbsp;&nbsp;
                      <strong>4</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Total de objetos falhados&nbsp;:&nbsp;&nbsp;
                      <strong>0</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Tempo de execução&nbsp;:&nbsp;&nbsp;
                      <strong>00:02:10</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Tempo médio por objeto&nbsp;:&nbsp;&nbsp;
                      <strong>00:00:23</strong>
                    </ListGroupItem>
                  </ListGroup>
                </div>

                <div className="content-section implementation">
                  <div className="ui-md-6">
                    {/* <Tree className=" ui-tree ui-tree-container"  value={dt} /> */}
                  </div>
                </div>
              </div>
              {/* <div className="ui-md-12">
                <h2>
                  <Message
                    severity="success"
                    text="Success"
                    detail="Validation failed"
                    //style={{ width: 750 + 'px', height: 80 + 'px' }}
                  />
                </h2>
              </div> */}
            </Card>
          </div>
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
          </Toolbar>
          <Accordion>{preview}</Accordion>
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
          <Dialog
            header=" Log Object:Godfather I"
            visible={this.state.visible}
            width="350px"
            modal={true}
            onHide={e => this.setState({ visible: false })}
            style={{ backgroundColor: '#000', width: 900 + 'px' }}
          >
            <pre
              style={{
                color: '#00ff00',
                backgroundColor: '#000',
                height: 600 + 'px',
              }}
            >
              <code>
                <ul style={{ listStyle: 'none' }}>
                  <li>
                    "Records":
                    <ul style={{ listStyle: 'none' }}>
                      <li> "type": "IAMUser",</li>
                      <li> "principalId": "EX_PRINCIPAL_ID",</li>
                      <li> "arn": "arn:aws:iam::123456789012:user/Alice",</li>
                      <li> "accountId": "123456789012",</li>
                    </ul>
                  </li>
                  <li> "eventSource": "cloudtrail.amazonaws.com", </li>
                </ul>
                {/* "Records": 
                "eventVersion": "1.04",
                "userIdentity":
                   
                   
                    
                   
                    "accessKeyId": "EXAMPLE_KEY_ID",
                    "userName": "Alice",
                "eventTime": "2016-07-14T19:15:45Z",
                "eventSource": "cloudtrail.amazonaws.com",
                "eventName": "UpdateTrail",
                "awsRegion": "us-east-2",
                "sourceIPAddress": "205.251.233.182",
                "userAgent": "aws-cli/1.10.32 Python/2.7.9 Windows/7 botocore/1.4.22",
                "errorCode": "TrailNotFoundException",
                "errorMessage": "Unknown trail: myTrail2 for the user: 123456789012",
                "requestParameters": "name": "myTrail2",
                "responseElements": null,
                "requestID": "5d40662a-49f7-11e6-97e4-d9cb6ff7d6a3",
                "eventID": "b7d4398e-b2f0-4faa-9c76-e2d316a8d67f",
                "eventType": "AwsApiCall",
                "recipientAccountId": "123456789012" */}
              </code>
            </pre>
          </Dialog>
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
