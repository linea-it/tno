import React, { Component } from 'react';
import { uniqueId } from 'lodash';
import sizeMe from 'react-sizeme';
import PropTypes from 'prop-types';
import { desfootprint } from './DesFootprint';

class Panel extends Component {
  constructor(props) {
    super(props);

    this.state = this.initialState;

    this.id = uniqueId('aladin-container-');

    // Instancia do Aladin linkado com a div
    this.aladin = null;

    // Verificar se a lib Aladin esta disponivel
    if (window.A) {
      this.libA = window.A;
    }
  }

  static propTypes = {
    position: PropTypes.string,
    fov: PropTypes.number,
    desfootprint: PropTypes.bool,
  };

  get initialState() {
    return {};
  }

  get aladinOptions() {
    return {
      // fov:8,
      fov: 100,
      // target: '02 23 11.851 -09 40 21.59',
      cooFrame: 'J2000',
      survey: 'P/DSS2/color',
      showReticle: true,
      showZoomControl: true,
      showFullscreenControl: true,
      showLayersControl: true,
      showGotoControl: true,
      showShareControl: false,
      showCatalog: true,
      showFrame: true,
      showCooGrid: false,
      fullScreen: false,
      reticleColor: 'rgb(178, 50, 178)',
      reticleSize: 28,
      log: true,
      allowFullZoomout: true,
    };
  }

  componentWillMount() {
    // Antes do Render do Component
  }

  componentDidMount = () => {
    this.create_aladin();
  };

  componentDidUpdate = () => {
    // // Load CCDs:
    // this.api.getExposures({}).then(res => {
    //   const r = res.data;
    //   this.plot_exposures(r.results);
    //   // this.aladin.gotoRaDec([r.results[0].radeg, r.results[0].decdeg]);
    //   // Draw CCds
    //   // this.api.getExposures({}).then(res => {
    //   //   const r = res.data;
    //   //   this.plot_ccds(r.results)
    //   // });
    //   this.aladin.gotoObject(r.results[0].radeg + ', ' + r.results[0].decdeg);
    // });
  };

  create_aladin = () => {
    const options = this.aladinOptions;

    if (this.props.position != null) {
      options.target = this.props.position;
    }

    if (this.props.fov) {
      options.fov = this.props.fov;
    }

    this.aladin = this.libA.aladin(
      // Id da div que recebera o aladin
      `#${this.id}`,
      // opcoes do aladin
      options
    );

    // Desenha o Footprint do Des
    if (this.props.desfootprint) {
      this.footprint(desfootprint, 'DES Footprint', true);
    }

    return this.aladin;
  };

  footprint = (footprint = [], name = 'footprint', visible = true) => {
    const { aladin } = this;

    let overlay;

    if (aladin.view.overlays[0] !== undefined) {
      const { overlays } = aladin.view;

      let plotDes = false;

      for (let i = overlays.length - 1; i >= 0; i--) {
        if (overlays[i].name === name) {
          plotDes = true;

          if (visible) {
            overlays[i].show();
          } else {
            overlays[i].hide();
          }
        }
      }
      if (plotDes === false) {
        overlay = this.libA.graphicOverlay({
          color: '#ee2345',
          lineWidth: 2,
          name: 'des',
        });

        aladin.addOverlay(overlay);
        overlay.add(this.libA.polyline(footprint));
      }
    } else {
      overlay = this.libA.graphicOverlay({
        color: '#ee2345',
        lineWidth: 2,
        name,
      });

      aladin.addOverlay(overlay);
      overlay.add(this.libA.polyline(footprint));
    }
  };

  plot_exposures = (exposures = [], name = 'Exposures') => {
    const { aladin } = this;

    // Verificar se os ccds ja foram plotados
    let overlay = this.getOverlayByName(name);
    if (overlay) {
      // Se ja existir exibir
      overlay.show();
    } else {
      // Se nao existir criar
      overlay = this.libA.graphicOverlay({
        color: '#f75e00',
        lineWidth: 1,
        name: String(name),
      });

      aladin.addOverlay(overlay);

      exposures.forEach((item) => {
        // const exposure = this.libA.circle(item.ra_cent, item.dec_cent, 2.2,{});
        const exposure = this.libA.circle(item.radeg, item.decdeg, 1.1, {});
        overlay.add(exposure);
      });
    }
  };

  plot_ccds = (ccds = [], name = 'CCDs') => {
    const { aladin } = this;

    // Verificar se os ccds ja foram plotados
    let overlay = this.getOverlayByName(name);
    if (overlay) {
      // Se ja existir exibir
      overlay.show();
    } else {
      // Se nao existir criar
      overlay = this.libA.graphicOverlay({
        color: '#64e544',
        lineWidth: 1,
        name: String(name),
      });

      aladin.addOverlay(overlay);

      ccds.forEach((item) => {
        const tPath = [
          [item.rac4, item.decc4],
          [item.rac3, item.decc3],
          [item.rac2, item.decc2],
          [item.rac1, item.decc1],
        ];

        overlay.add(this.libA.polygon(tPath));
      });
    }
  };

  getOverlayByName = (name) => {
    const { aladin } = this;
    const { overlays } = aladin.view;
    let result = null;

    if (overlays.length > 0) {
      overlays.forEach(function (item) {
        if (item.name === name) {
          result = item;
        }
      });
    }

    return result;
  };

  markPosition = (position) => {
    const cat = this.libA.catalog({ name: 'Target', sourceSize: 18 });
    this.aladin.addCatalog(cat);
    cat.addSources([this.libA.marker(position)]);
  };

  render() {
    // Ajuste no Tamanho do container
    let { width, height } = this.props.size;
    if (height === 0) {
      height = width / 2;
    }

    return (
      <div
        id={this.id}
        className="aladin-container"
        style={{ width, height }}
      />
    );
  }
}

export default sizeMe({ monitorHeight: true, monitorWidth: true })(Panel);
