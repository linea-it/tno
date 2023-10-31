import Box from '@mui/material/Box';
function ImageCell(props) {
  if (props.value == null) {
    return (
      <Box 
      component="a"
      href={`/prediction-event-detail/${props.row.id}`}
      target="_blank"
      >   
      <Box
      // width={props.colDef.computedWidth}
      // height={props.colDef.computedWidth}
      height={68}
      >
        {/* TODO Adicionar uma imagem placeholder */}
        </Box>
      </Box>
    )
  }
  return (
    <Box 
      component="a"
      href={`/prediction-event-detail/${props.row.id}`}
      target="_blank"
    >
      <Box
        component="img"
        // width={props.colDef.computedWidth}
        width='auto'
        height={68}
        alt=""
        src={props.value}
      />
    </Box>
  );
}

export const ImageCol = {
  resizable: false,
  filterable: false,
  sortable: false,
  editable: false,
  groupable: false,
  align: 'center',
  renderCell: (params) => <ImageCell {...params} />,
};

export const NameCol = {
  resizable: false,
  filterable: false,
  sortable: false,
  editable: false,
  groupable: false,
  width: 150,
  align: 'center',
  valueGetter: (params) => {
    return params.row.number !== null ? `${params.row.name} (${params.row.number})` : `${params.row.name}`
  },  
  renderCell: (params) => {
    return (
      <Box 
      component="a"
      href={`/prediction-event-detail/${params.row.id}`}
      target="_blank"
      sx={{textDecoration: 'none'}}
      >
        {params.value}
      </Box>
    )
  },
};

export const floatFixedPrecision2 = {
  type: 'number',
  width: 100,
  valueFormatter: (params) => {
    if (params.value !== undefined && params.value !== null) {
      return `${params.value.toFixed(2)}`;
    }
    return ''
  },
};

export const floatFixedPrecision3 = {
  type: 'number',
  width: 100,
  valueFormatter: (params) => {
    if (params.value !== undefined && params.value !== null) {
      return `${params.value.toFixed(3)}`;
    }
    return ''
  },
};

export const floatFixedPrecision8 = {
  type: 'number',
  width: 150,
  valueFormatter: (params) => {
    if (params.value !== undefined && params.value !== null) {
      return `${params.value.toFixed(8)}`;
    }
    return ''
  },
};
export const PredictionEventsColumns = [
  // {
  //   field: 'index',
  //   headerName: 'Index',
  //   description: 'Internal ID',
  //   type: 'number',
  //   width: 50,
  //   valueGetter: (params) => {
  //     console.log(params)
  //     return  params.api.getRowIndexRelativeToVisibleRows(params.id)
  //   },      
  // },
  {
    field: 'id',
    headerName: 'ID',
    description: 'Internal ID',
    // type: 'number',
    headerAlign: 'center',
    align: 'center',
    width: 100
  },
  {
    field: 'map_url',
    headerName: 'Map',
    headerAlign: 'center',
    align: 'center',
    ...ImageCol
  },
  {
    field: 'name',
    headerName: 'Object',
    description: 'Asteroid Name (Number)',
    minWidth: 160,
    maxWidth: 200,
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    ...NameCol
  },
  {
    field: 'number',
    headerName: 'Ast Number',
    description: 'Asteroid Number',
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'dynclass',
    headerName: 'Dynamic class',
    description: 'Dynamic class',
    width: 180,
    headerAlign: 'center',
    align: 'center',
  },  
  {
    field: 'date_time',
    headerName: 'C/A Instant',
    description: 'Instant of the Closest Approach in UTC',
    width: 180,
    type: 'dateTime',
    headerAlign: 'center',
    align: 'center',
    valueGetter: ({ value }) => value && new Date(value),
  },
  {
    field: 'closest_approach',
    headerName: 'C/A',
    description: 'Geocentric Closest Approach (arcsec)',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision3
  },
  {
    field: 'position_angle',
    headerName: 'P/A',
    description: 'Position Angle with respect to the star at closest approach (deg)',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'velocity',
    headerName: 'Velocity',
    description: 'Velocity in the plane of the sky (positive is prograde, negative is retrograde) (Km/s)',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'delta',
    headerName: 'Distance',
    description: 'Geocentric Distance (AU)',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'long',
    headerName: 'Long',
    description: 'East longitude of sub-planet point (positive towards East) (deg)',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'loc_t',
    headerName: 'Local Solar Time',
    description: 'Local solar time at sub-planet point (hh:mm)',
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'off_ra',
    headerName: 'RA offset',
    description: 'Offset applied to ephemeris in RA (mas)',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'off_dec',
    headerName: 'DEC offset',
    description: 'Offset applied to ephemeris in DEC (mas)',
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'proper_motion',
    headerName: 'Proper Motion Status',
    description: 'Status of proper motion correction (Ok/No)',
    align: 'center',
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'g',
    headerName: 'G mag',
    description: "Star's G magnitude (mag)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'j',
    headerName: 'J mag',
    description: "Star's J magnitude (mag)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'h',
    headerName: 'H mag',
    description: "Star's H magnitude (mag)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'k',
    headerName: 'K mag',
    description: "Star's K magnitude (mag)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'ra_target',
    headerName: 'Object RA',
    description: "Object's Right Ascension (hh mm ss.ssss)",
    width: 130,
    headerAlign: 'center',
    align: 'center',
    sortable: false
  },
  {
    field: 'dec_target',
    headerName: 'Object DEC',
    description: "Object's Declination (dd mm ss.sss)",
    width: 130,
    headerAlign: 'center',
    align: 'center',
    sortable: false
  },
  {
    field: 'ra_target_deg',
    headerName: 'Object RA (deg)',
    description: "Object's Right Ascension (deg)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision8
  },
  {
    field: 'dec_target_deg',
    headerName: 'Object DEC (deg)',
    description: "Object's Declination (deg)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision8
  },
  {
    field: 'ra_star_candidate',
    headerName: 'Star RA',
    description: "Star's Right Ascension (hh mm ss.ssss)",
    width: 130,
    headerAlign: 'center',
    align: 'center',
    sortable: false
  },
  {
    field: 'dec_star_candidate',
    headerName: 'Star DEC',
    description: "Star's Declination (dd mm ss.sss)",
    width: 130,
    headerAlign: 'center',
    align: 'center',
    sortable: false
  },
  {
    field: 'ra_star_deg',
    headerName: 'Star RA (deg)',
    description: "Star's Right Ascension (deg)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision8
  },
  {
    field: 'dec_star_deg',
    headerName: 'Star DEC (deg)',
    description: "Star's Declination (deg)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision8
  },
  {
    field: 'e_ra',
    headerName: 'Star RA unc',
    description: "Star's RA uncertainty (mas)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'e_dec',
    headerName: 'Star DEC unc',
    description: "Star's DEC uncertainty (mas)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'pmra',
    headerName: 'Star RA pm',
    description: "Star's proper motion in RA (mas/y)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  {
    field: 'pmdec',
    headerName: 'Star DEC pm',
    description: "Star's proper motion in DEC (mas/y)",
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    ...floatFixedPrecision2
  },
  // {
  //   field: 'multiplicity_flag',
  //   headerName: 'Multiplicity Flag ',
  //   description: "See documentation for details",
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: false
  // },
  // {
  //   field: 'ct',
  //   headerName: 'CT',
  //   description: "Only Gaia DR1 stars used",
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: false
  // },
];

export const predictionEventsColumnVisibilityModel = {
  id: true,
  map_url: true,
  name: true,
  number: false,
  dynclass: true,
  date_time: true,
  closest_approach: true,
  position_angle: true,
  velocity: true,
  delta: true,
  long: false,
  loc_t: false,
  off_ra: false,
  off_dec: false,
  proper_motion: false,
  g: true,
  j: false,
  h: false,
  k: false,
  ra_target: false,
  dec_target: false,
  ra_target_deg: false,
  dec_target_deg: false,
  ra_star_candidate: true,
  dec_star_candidate: true,
  ra_star_deg: false,
  dec_star_deg: false,
  e_ra: false,
  e_dec: false,
  pmra: false,
  pmdec: false,
  // multiplicity_flag: false,
  // ct: false,
}
