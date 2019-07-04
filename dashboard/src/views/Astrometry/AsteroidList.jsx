import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import PraiaApi from './PraiaApi';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import PropTypes from 'prop-types';
import moment from 'moment';

class AsteroidList extends Component {
    state = this.initialState;
    api = new PraiaApi();




    render() {
        return (
            <h5>tabela</h5>
        );
    }



}

export default AsteroidList;
