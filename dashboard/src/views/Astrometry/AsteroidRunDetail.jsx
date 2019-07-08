import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import moment from 'moment';
import PraiaApi from './PraiaApi';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

export default class AsteroidRunDetail extends Component {
    state = this.initialState;
    api = new PraiaApi();

    // static propTypes = {
    //     match: PropTypes.object.isRequired,
    //     history: PropTypes.any.isRequired,
    //   };

    get initialState() {
        return {
            id: 0,
            asteroid: {},
            inputs: [],
            files: [],
            images: [],
            tree_data: [],
            selected2: '',
            lightboxIsOpen: false,
            currentImage: 0,
            visible: false,
            imageId: [],
            prev: null,
            next: null,
            download_icon: 'fa fa-cloud-download',
            praiaId: 0,
        };
    }

    input_columns = [
        {
            field: 'input_type',
            header: 'Input',
            sortable: true,
        },
        {
            field: 'source',
            header: 'Source',
            sortable: true,
        },
        {
            field: 'date_time',
            header: 'Date',
            sortable: true,
        },
        {
            field: 'filename',
            header: 'Filename',
            sortable: true,
        },
    ];


    componentDidMount() {

        const {
            match: { params },
        } = this.props;


        this.setState({ praiaId: params.id });

    }

    onClickBackToAstrometryRun = praia_run => {
        const history = this.props.history;
        history.push({ pathname: `/astrometry_run/${praia_run}` });
    };

    create_nav_bar = () => {
        return (
            <Toolbar>
                <div className="ui-toolbar-group-left">
                    <Button
                        label="Back"
                        icon="fa fa-undo"
                        onClick={() =>
                            this.onClickBackToAstrometryRun(this.state.praiaId)
                        }
                    />
                    <Button
                        label="Download"
                        icon={this.state.download_icon}
                        className="ui-button-info"
                        onClick={() => this.onClickDownload(this.state.asteroid.id)}
                    />
                </div>

                <div className="ui-toolbar-group-right">
                    <Button
                        label="Prev"
                        icon="fa fa-arrow-left"
                        disabled={this.state.prev ? false : true}
                        onClick={() => this.onClickPrev(this.state.prev)}
                    />
                    <Button
                        label="Next"
                        icon="fa fa-arrow-right"
                        iconPos="right"
                        disabled={this.state.next ? false : true}
                        onClick={() => this.onClickNext(this.state.next)}
                    />
                </div>
            </Toolbar>
        );
    };



    render() {
        console.log(this.state.paramsId);
        return (
            <div>
                {this.create_nav_bar()}
            </div>
        );
    }
}