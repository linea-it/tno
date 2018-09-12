import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import 'primereact/resources/primereact.min.css';

import HeaderLinks from '../Header/HeaderLinks.jsx';

import imagine from 'assets/img/sidebar-3.jpg';
import logoLinea from 'assets/img/logo-header.png';
//import logoTNO from 'assets/img/logo2.png';

import appRoutes from 'routes/app.jsx';
import { Tooltip } from 'primereact/tooltip';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
    };
  }
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
  }
  updateDimensions() {
    this.setState({ width: window.innerWidth });
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }
  render() {
    return (
      <div
        id="sidebar"
        className="sidebar"
        data-color="black"
        data-image={imagine}
      >
        <div className="sidebar-background" />

        <div className="logo">
          {/* <div className="float-left"> */}
          <a
            //href="https://www.creative-tim.com"
            href="http://www.linea.gov.br/"
            className="simple-text logo-mini"
          >
           <div className="logo-img">
              <img src={logoLinea} alt="logo_image" />
            </div>
          </a>
          {/* </div> */}
          {/* <div className="float-right"> */}
          <a
            href="http://www.linea.gov.br/010-ciencia/1-projetos/6-tno/"
            className="simple-text logo-normal"
          >
            <div className="logo-img">
              {/* <img
                className="margin-top"
                src={logoTNO}
                alt="logo_image"
                width="60"
              /> */}
            </div>
          </a>
          {/* </div> */}
          <br />
        </div>   
        <div className="sidebar-wrapper">
          <ul className="nav">
            {this.state.width <= 991 ? <HeaderLinks /> : null}
            {appRoutes.map((prop, key, i) => {
              const id = 'id_' + key;
              if (!prop.redirect && !prop.hidden) {
                return (
                  <li className={this.activeRoute(prop.path)} key={key}>
                    <NavLink
                      id={id}
                      to={prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                    <Tooltip
                      for={`#${id}`}
                      tooltipEvent="hover"
                      title={prop.helpText}
                      tooltipPosition="left"
                    />
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default Sidebar;
