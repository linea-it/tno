import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import HeaderLinks from '../Header/HeaderLinks.jsx';

import imagine from 'assets/img/sidebar-3.jpg';
import logo from 'assets/img/reactlogo.png';

import appRoutes from 'routes/app.jsx';
// import { Tooltip } from 'primereact/tooltip';

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
          <a
            href="https://www.creative-tim.com"
            className="simple-text logo-mini"
          >
            <div className="logo-img">
              <img src={logo} alt="logo_image" />
            </div>
          </a>
          <a
            href="https://www.creative-tim.com"
            className="simple-text logo-normal"
          >
            Tno
          </a>
        </div>
        <div className="sidebar-wrapper">
          <ul className="nav">
            {this.state.width <= 991 ? <HeaderLinks /> : null}
            {appRoutes.map((prop, key, i) => {
              // const listaFake = [];
              // for (let index = 0; index < i.length; index++) {
              //   console.log(listaFake.push(i[index].helpText));
              // }
              // this.helpTextInclude(listaFake);

              if (!prop.redirect && !prop.hidden) {
                return (
                  <li className={this.activeRoute(prop.path)} key={key}>
                    <NavLink
                      id="id"
                      to={prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                    {/* <Tooltip
                      for="#id"
                      tooltipEvent="focus"
                      title=""
                      tooltipPosition="bottom"
                    /> */}
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
