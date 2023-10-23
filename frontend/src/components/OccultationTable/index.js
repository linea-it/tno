import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Table from '../../components/Table'
import { Card, CardContent, CardHeader, Button, CircularProgress } from '../../../node_modules/@material-ui/core/index'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom'
import moment from '../../../node_modules/moment/moment'
import styles from './style'


function OccultationTable({ loadData, tableData, totalCount, publicPage }) {
    const navigate = useNavigate()
    const defaultHiddenColumnNames = [
        "number",
        "delta",
        "long",
        "loc_t",
        "off_ra",
        "off_dec",
        "proper_motion",
        "j",
        "h",
        "k",
        "ra_target",
        "dec_target",
        "ra_target_deg",
        "dec_target_deg",
        "ra_star_deg",
        "dec_star_deg",
        "e_ra",
        "e_dec",
        "pmra",
        "pmdec",
        "multiplicity_flag",
        "ct"
    ];
    const [occultationsTable, setOccultationsTable] = useState([])
    const [occultationsCount, setOccultationsCount] = useState(0)
    const classes = styles();

    useEffect(() => {
        setOccultationsTable(tableData);
    }, [tableData])

    useEffect(() => {
        setOccultationsCount(totalCount);
    }, [totalCount])


    const occultationsTableColumns = [
        {
            name: 'index',
            title: ' ',
            width: 50,
            sortingEnabled: false
        },
        {
            name: 'detail',
            title: publicPage ? ' ' : 'Detail',
            width: 80,
            customElement: (row) => (
                <Button className={classes.btnDetail} onClick={() => publicPage ? window.open(row.detail, "_blank") : navigate(row.detail)}>
                    <InfoOutlinedIcon />
                </Button>
            ),
            align: 'center',
            sortingEnabled: false,
            headerTooltip: 'Occultation Prediction Details'
        },
        {
            name: 'map_url',
            title: 'Map',
            width: 150,
            align: 'center',
            headerTooltip: 'Occultation Map',
            customElement: (row) => row.map_url !== null ? <img className={classes.imgThumb} src={row.map_url} /> : <i>no map</i>
        },
        {
            name: 'name',
            title: 'Object',
            width: 150,
            align: 'center',
            headerTooltip: 'Asteroid Name (Number)',
            customElement: (row) => <span>{row.name + (row.number ? ' (' + row.number + ')' : '')}</span>
        },
        {
            name: 'number',
            title: 'Number',
            width: 150,
            align: 'center',
            headerTooltip: 'Asteroid Number'
        },
        {
            name: 'date_time',
            title: 'C/A Instant',
            width: 150,
            align: 'center',
            headerTooltip: 'Instant of the Closest Approach in UTC',
            customElement: (row) => row.date_time ? <span title={moment(row.date_time).format('YYYY-MM-DD HH:mm:ss')}>{moment(row.date_time).utc().format('YYYY-MM-DD HH:mm:ss')}</span> : <span>Invalid Date</span>
        },
        {
            name: 'closest_approach',
            title: 'C/A',
            width: 150,
            align: 'center',
            headerTooltip: 'Geocentric Closest Approach (arcsec)',
            customElement: (row) => <span>{row.closest_approach ? row.closest_approach.toFixed(3) : ''}</span>
        },
        {
            name: 'position_angle',
            title: 'P/A',
            width: 150,
            align: 'center',
            headerTooltip: 'Position Angle with respect to the star at closest approach (deg)',
            customElement: (row) => <span>{row.position_angle ? row.position_angle.toFixed(2) : ''}</span>
        },
        {
            name: 'velocity',
            title: 'Velocity',
            width: 150,
            align: 'center',
            headerTooltip: 'Velocity in the plane of the sky (positive is prograde, negative is retrograde) (Km/s)',
            customElement: (row) => <span>{row.velocity ? row.velocity.toFixed(2) : ''}</span>
        },
        {
            name: 'delta',
            title: 'Geoc. Distance',
            width: 150,
            align: 'center',
            headerTooltip: 'Geocentric Distance (AU)',
            customElement: (row) => <span>{row.delta ? row.delta.toFixed(2) : ''}</span>
        },
        {
            name: 'long',
            title: 'Long ',
            width: 150,
            align: 'center',
            headerTooltip: 'East longitude of sub-planet point (positive towards East) (deg)',
            customElement: (row) => <span>{row.long ? row.long.toFixed(2) : ''}</span>
        },
        {
            name: 'loc_t',
            title: 'Local Solar Time',
            width: 150,
            align: 'center',
            headerTooltip: 'Local solar time at sub-planet point (hh:mm)'
        },
        {
            name: 'off_ra',
            title: 'RA offset',
            width: 150,
            align: 'center',
            headerTooltip: 'Offset applied to ephemeris in RA (mas)',
            customElement: (row) => <span>{row.off_ra ? row.off_ra.toFixed(2) : ''}</span>
        },
        {
            name: 'off_dec',
            title: 'DEC offset',
            width: 150,
            align: 'center',
            headerTooltip: 'Offset applied to ephemeris in DEC (mas)',
            customElement: (row) => <span>{row.off_dec ? row.off_dec.toFixed(2) : ''}</span>
        },
        {
            name: 'proper_motion',
            title: 'Proper Motion Status',
            width: 180,
            align: 'center',
            headerTooltip: 'Status of proper motion correction (Ok/No)'
        },
        {
            name: 'g',
            title: 'G mag',
            width: 150,
            align: 'center',
            headerTooltip: "Star's G magnitude (mag)",
            customElement: (row) => <span>{row.g ? row.g.toFixed(2) : ''}</span>
        },
        {
            name: 'j',
            title: 'J mag',
            width: 150,
            align: 'center',
            headerTooltip: "Star's J magnitude (mag)",
            customElement: (row) => <span>{row.j ? row.j.toFixed(2) : ''}</span>
        },
        {
            name: 'h',
            title: 'H mag',
            width: 150,
            align: 'center',
            headerTooltip: "Star's H magnitude (mag)",
            customElement: (row) => <span>{row.h ? row.h.toFixed(2) : ''}</span>
        },
        {
            name: 'k',
            title: 'K mag',
            width: 150,
            align: 'center',
            headerTooltip: "Star's K magnitude (mag)",
            customElement: (row) => <span>{row.k ? row.k.toFixed(2) : ''}</span>
        },
        {
            name: 'ra_target',
            title: 'Object RA',
            width: 150,
            align: 'center',
            headerTooltip: "Object's Right Ascension (hh mm ss.ssss)"
        },
        {
            name: 'dec_target',
            title: 'Object DEC',
            width: 150,
            headerTooltip: "Object's Declination (dd mm ss.sss)",
            align: 'center',
        },
        {
            name: 'ra_target_deg',
            title: 'Object RA (deg)',
            width: 150,
            align: 'center',
            headerTooltip: "Object's Right Ascension (deg)",
            customElement: (row) => <span>{row.ra_target_deg ? row.ra_target_deg.toFixed(8) : ''}</span>
        },
        {
            name: 'dec_target_deg',
            title: 'Object DEC (deg)',
            width: 150,
            align: 'center',
            headerTooltip: "Object's Declination (deg)",
            customElement: (row) => <span>{row.dec_target_deg ? row.dec_target_deg.toFixed(8) : ''}</span>
        },
        {
            name: 'ra_star_candidate',
            title: 'Star RA',
            width: 150,
            align: 'center',
            headerTooltip: "Star's Right Ascension (hh mm ss.ssss)"
        },
        {
            name: 'dec_star_candidate',
            title: 'Star DEC',
            width: 150,
            align: 'center',
            headerTooltip: "Star's Declination (dd mm ss.sss)"
        },
        {
            name: 'ra_star_deg',
            title: 'Star RA (deg)',
            width: 150,
            align: 'center',
            headerTooltip: "Star's Right Ascension (deg)",
            customElement: (row) => <span>{row.ra_star_deg ? row.ra_star_deg.toFixed(8) : ''}</span>
        },
        {
            name: 'dec_star_deg',
            title: 'Star DEC (deg)',
            width: 150,
            align: 'center',
            headerTooltip: "Star's Declination (deg)",
            customElement: (row) => <span>{row.dec_star_deg ? row.dec_star_deg.toFixed(8) : ''}</span>
        },
        {
            name: 'e_ra',
            title: 'Star RA unc',
            width: 150,
            align: 'center',
            headerTooltip: "Star's RA uncertainty (mas)",
            customElement: (row) => <span>{row.e_ra ? row.e_ra.toFixed(2) : ''}</span>
        },
        {
            name: 'e_dec',
            title: 'Star DEC unc',
            width: 150,
            align: 'center',
            headerTooltip: "Star's DEC uncertainty (mas)",
            customElement: (row) => <span>{row.e_dec ? row.e_dec.toFixed(2) : ''}</span>
        },
        {
            name: 'pmra',
            title: 'Star RA pm',
            width: 150,
            align: 'center',
            headerTooltip: "Star's proper motion in RA (mas/y)",
            customElement: (row) => <span>{row.pmra ? row.pmra.toFixed(2) : ''}</span>
        },
        {
            name: 'pmdec',
            title: 'Star DEC pm',
            width: 150,
            align: 'center',
            headerTooltip: "Star's proper motion in DEC (mas/y)",
            customElement: (row) => <span>{row.pmdec ? row.pmdec.toFixed(2) : ''}</span>
        },
        {
            name: 'multiplicity_flag',
            title: 'Multiplicity Flag ',
            width: 150,
            align: 'center',
            headerTooltip: "See documentation for details"
        },
        {
            name: 'ct',
            title: 'CT ',
            width: 150,
            align: 'center',
            headerTooltip: "Only Gaia DR1 stars used"
        },
    ]

    return (
        <>
            <Card>
                <CardHeader title={`Total Occultation Predictions: ${occultationsCount}`} />
                <CardContent>
                    <Table
                        columns={occultationsTableColumns}
                        data={occultationsTable}
                        loadData={loadData}
                        hasSearching={false}
                        hasPagination
                        hasColumnVisibility={true}
                        hasToolbar={true}
                        totalCount={occultationsCount}
                        reload={true}
                        defaultHiddenColumnNames={defaultHiddenColumnNames}
                        defaultSorting={[{ columnName: 'date_time', direction: 'asc' }]}
                    />
                </CardContent>
            </Card>
        </>
    )
}

OccultationTable.propTypes = {
    loadData: PropTypes.func,
    tableData: PropTypes.array,
    totalCount: PropTypes.number,
    publicPage: PropTypes.bool

}

OccultationTable.defaultProps = {
    loadData: () => null,
    tableData: [],
    totalCount: 0,
    publicPage: false
}

export default OccultationTable
