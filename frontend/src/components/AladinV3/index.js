import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types'
import A from 'aladin-lite'

export default class AladinV3 extends React.Component {
  // Importante tentei criar o componente com Hooks mas não funcionou corretamente.
  // Usando Class based Component funcionou como esperado.
  // Acredito que seja pelo comportamento do didmount.
  // Aladin precisa que a div já exista antes da função ser chamada.
  //
  // Exemplos que usei como base:
  // https://blog.logrocket.com/complete-guide-react-refs/
  // https://legacy.reactjs.org/docs/hooks-effect.html
  //
  // Complete List with all Options for Aladin
  // https://aladin.cds.unistra.fr/AladinLite/doc/API/
  // Lista de Exemplos:
  // https://aladin.cds.unistra.fr/AladinLite/doc/API/examples/


  constructor(props) {
    super(props);

    // Cria um ID unico para div que vai receber o aladin
    this.id = `aladin-container-${uuidv4()}`

    // Instancia do Aladin linkado com a div
    this.aladin = undefined

    // Verificar se a lib Aladin esta disponivel
    this.libA = A

    // if (window.A) {
    //   this.libA = window.A
    // }
  }

  static propTypes = {
    ra: PropTypes.number,
    dec: PropTypes.number,
  }

  componentDidMount() {
    this.libA.init.then(() => {
      this.aladin = this.libA.aladin(
        `#${this.id}`,
        {
          survey: 'P/allWISE/color', // set initial image survey
          // survey: 'P/DSS2/color', // set initial image survey
          projection: 'SIN', // set a projection
          fov: 0.5, // initial field of view in degrees
          // target: 'NGC 2175', // initial target
          cooFrame: 'ICRS', // set galactic frame reticleColor: '#ff89ff', // change reticle color
          showReticle: false,
          showCooGrid: false,
          fullScreen: false
        }
      );

      // Cria um catalogo com um unico source
      this.drawCatalog()
      // Centraliza a imagem na posição
      this.goToPosition(this.props.ra, this.props.dec)
    })
  }

  componentWillUnmount() { }

  drawCatalog() {
    // Cria um Catalogo contendo a coordenada ra e dec como source.
    // https://aladin.cds.unistra.fr/AladinLite/doc/API/examples/cat-custom-shape/

    if (this.props.ra !== undefined && this.props.dec !== undefined) {
      // create catalog layer with custom draw function
      const cat = this.libA.catalog({
        name: 'Occulted Star',
        shape: 'square',
        sourceSize: 20,
        color: 'cyan'
      });
      this.aladin.addCatalog(cat)
      // add sources to the new layer
      cat.addSources([
        this.libA.source(this.props.ra, this.props.dec, { name: "Occulted Star" })
      ]);
    }
  }

  goToPosition(ra, dec) {
    // Centraliza a imagem na coordenada.
    // https://aladin.cds.unistra.fr/AladinLite/doc/API/  (Managing the view)

    if (ra !== undefined && dec !== undefined) {
      this.aladin.gotoRaDec(ra, dec)
    }
  }

  render() {
    return (<div
      id={this.id}
      style={{
        width: '100%',
        height: '100%',
      }}></div>)
  }
}
