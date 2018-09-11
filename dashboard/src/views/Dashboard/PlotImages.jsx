import React, { Component } from 'react';

// primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// images
import plot2 from 'assets/img/plot2.png';

//custom
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import Content from 'components/CardContent/CardContent.jsx';

class PlotImages extends Component {
  render() {
    return (
      <PanelCostumize
        title="Lorem Ipsum"
        content={
          <div>
            <Content
              header={true}
              title="Lorem Ipsum"
              content={
                <figure className="responsive-image">
                  <img alt="text" src={plot2} />
                </figure>
              }
            />
          </div>
        }
      />
    );
  }
}
export default PlotImages;
