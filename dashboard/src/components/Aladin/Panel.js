import React, { Component } from 'react';
import { uniqueId } from 'lodash';
import sizeMe from 'react-sizeme';
import { desfootprint } from './DesFootprint';
class AladinPanel extends Component {
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

  get initialState() {
    return {};
  }

  get aladinOptions() {
    return {
      // fov:8,
      fov: 100,
      // target: '02 23 11.851 -09 40 21.59',
      // target: '06 12 46.187 -45 45 15.40',
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
    // console.log("Depois do component estar renderizado")

    this.create_aladin();
  };

  componentDidUpdate = () => {
    // console.log("Depois do componente ter atualizado")

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
    this.aladin = this.libA.aladin(
      // Id da div que recebera o aladin
      '#' + this.id,
      // opcoes do aladin
      this.aladinOptions
    );

    this.footprint(desfootprint, 'DES Footprint', true);

    return this.aladin;
  };

  footprint = (footprint = [], name = 'footprint', visible = true) => {
    const aladin = this.aladin;

    let overlay;

    if (aladin.view.overlays[0] !== undefined) {
      const overlays = aladin.view.overlays;

      let plotDes = false;

      for (var i = overlays.length - 1; i >= 0; i--) {
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
        name: name,
      });

      aladin.addOverlay(overlay);
      overlay.add(this.libA.polyline(footprint));
    }
  };

  plot_exposures = (exposures = [], name = 'Exposures') => {
    const aladin = this.aladin;

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

      exposures.forEach(item => {
        // const exposure = this.libA.circle(item.ra_cent, item.dec_cent, 2.2,{});
        const exposure = this.libA.circle(item.radeg, item.decdeg, 1.1, {});
        overlay.add(exposure);
      });
    }
  };

  plot_ccds = (ccds = [], name = 'CCDs') => {
    const aladin = this.aladin;

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

      ccds.forEach(item => {
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

  getOverlayByName = name => {
    const aladin = this.aladin;
    const overlays = aladin.view.overlays;
    let result = null;

    if (overlays.length > 0) {
      overlays.forEach(function(item) {
        if (item.name === name) {
          result = item;
        }
      });
    }

    return result;
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
        style={{ width: width, height: height }}
      />
    );
  }
}

export default sizeMe({ monitorHeight: true, monitorWidth: true })(AladinPanel);
