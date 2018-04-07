import React, {Component} from 'react';
import { Grid } from 'react-bootstrap';

class Footer extends Component {
	render() {
		return (
            <footer className="footer">
                <Grid>
                    <nav className="pull-left">
						{/*
						Exemplo de Links no Rodape
                        <ul>
                            <li>
                                <a href="#pablo">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#pablo">
                                    Company
                                </a>
                            </li>
                            <li>
                                <a href="#pablo">
                                    Portfolio
                                </a>
                            </li>
                            <li>
                                <a href="#pablo">
                                   Blog
                                </a>
                            </li>
                        </ul>
						*/}
                    </nav>
                    <p className="copyright pull-right">
                        Created by <a href="http://www.linea.gov.br/">LIneA</a>
                    </p>
                </Grid>
            </footer>
		);
	}
}

export default Footer;
