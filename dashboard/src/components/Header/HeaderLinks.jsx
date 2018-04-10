import React, { Component } from 'react';
import { NavItem, Nav, NavDropdown, MenuItem } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { logout } from 'auth';

class HeaderLinks extends Component {
  logoutClick = event => {
    logout()
    this.props.history.push('/login');
  };

  render() {
    const notification = (
      <div>
        <i className="fa fa-bell-o" />
        <b className="caret" />
        <span className="notification">5</span>
        <p className="hidden-lg hidden-md">Notification</p>
      </div>
    );
    const actions = (
      <div>
        <i className="fa fa-bars" />
        <p className="hidden-lg hidden-md">Actions</p>
      </div>
    );
    return (
      <div>
        <Nav pullRight>
          <NavDropdown
            eventKey={2}
            title={notification}
            noCaret
            id="basic-nav-dropdown"
          >
            <MenuItem eventKey={2.1}>Notification 1</MenuItem>
            <MenuItem eventKey={2.2}>Notification 2</MenuItem>
            <MenuItem eventKey={2.3}>Notification 3</MenuItem>
            <MenuItem eventKey={2.4}>Notification 4</MenuItem>
            <MenuItem eventKey={2.5}>Another notifications</MenuItem>
          </NavDropdown>
          {/* <NavDropdown
            eventKey={2}
            title="Dropdown"
            id="basic-nav-dropdown-right"
          >
            <MenuItem eventKey={2.1} disabled>
              Profile
            </MenuItem>
            <MenuItem eventKey={2.2} disabled>
              Settings
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={2.5}>Log out</MenuItem>
          </NavDropdown> */}
          <NavItem onClick={this.logoutClick}>Log out</NavItem>
          {/* <NavDropdown
            eventKey={4}
            title={actions}
            noCaret
            id="basic-nav-dropdown-right"
          >
            <MenuItem eventKey={4.1}>Action</MenuItem>
            <MenuItem eventKey={4.2}>Another action</MenuItem>
            <MenuItem eventKey={4.3}>Something</MenuItem>
            <MenuItem eventKey={4.4}>Another action</MenuItem>
            <MenuItem eventKey={4.5}>Something</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={4.6}>Separated link</MenuItem>
          </NavDropdown>*/}
        </Nav>
      </div>
    );
  }
}

export default withRouter(HeaderLinks);
