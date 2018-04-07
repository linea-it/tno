import React, {Component} from 'react';
import { Nav, NavDropdown, MenuItem } from 'react-bootstrap';


class HeaderLinks extends Component{
    render(){
        const notification = (
            <div>
                <i className="fa fa-bell-o"></i>
                <b className="caret"></b>
                <span className="notification">5</span>
                <p className="hidden-lg hidden-md">Notification</p>
            </div>
        );
        const actions = (
            <div>
                <i className="fa fa-bars"></i>
                <p className="hidden-lg hidden-md">Actions</p>
            </div>
        )
        return (
            <div>
                <Nav pullRight>
                    <NavDropdown eventKey={2} title={notification} noCaret id="basic-nav-dropdown">
                        <MenuItem eventKey={2.1}>Notification 1</MenuItem>
                        <MenuItem eventKey={2.2}>Notification 2</MenuItem>
                        <MenuItem eventKey={2.3}>Notification 3</MenuItem>
                        <MenuItem eventKey={2.4}>Notification 4</MenuItem>
                        <MenuItem eventKey={2.5}>Another notifications</MenuItem>
                    </NavDropdown>
                    <NavDropdown eventKey={3} title={actions} noCaret id="basic-nav-dropdown-right">
                        <MenuItem eventKey={3.1}>Action</MenuItem>
                        <MenuItem eventKey={3.2}>Another action</MenuItem>
                        <MenuItem eventKey={3.3}>Something</MenuItem>
                        <MenuItem eventKey={3.4}>Another action</MenuItem>
                        <MenuItem eventKey={3.5}>Something</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey={2.5}>Separated link</MenuItem>
                    </NavDropdown>

                </Nav>
            </div>
        );
    }
}

export default HeaderLinks;
