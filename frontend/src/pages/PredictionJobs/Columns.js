import ColumnStatus from '../../components/Table/ColumnStatus'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Button from '@mui/material/Button'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import moment from 'moment'
dayjs.extend(utc)
dayjs.extend(timezone)

const renderDetail = (props) => (
  <Button href={`/dashboard/data-preparation/predict-detail/${props.row.id}`}>
    <InfoOutlinedIcon />
  </Button>
)
const renderStatus = (props) => <ColumnStatus status={props.row.status} headerName={props.row.error} />

export const predictionJobsColumns = [
  {
    field: 'detail',
    headerName: 'Detail',
    width: 80,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    renderCell: renderDetail
  },
  {
    field: 'id',
    headerName: 'ID',
    width: 80
  },
  {
    field: 'status',
    headerName: 'Status',
    align: 'center',
    headerAlign: 'center',
    renderCell: renderStatus
  },
  {
    field: 'start',
    headerName: 'Execution Date',
    width: 160,
    valueFormatter: (params) => {
      return params.value !== null ? `${dayjs(params.value).utc().format('YYYY-MM-DD HH:mm:ss')}` : ''
    }
  },
  {
    field: 'exec_time',
    headerName: 'Execution Time',
    width: 110,
    headerTooltip: 'Execution time',
    valueFormatter: (params) => {
      return params.value !== null ? params.value.split('.')[0] : ''
    }
  },
  {
    field: 'count_asteroids',
    headerName: 'Asteroids',
    width: 130,
    align: 'center'
  },
  {
    field: 'count_asteroids_with_occ',
    headerName: 'Ast WO',
    width: 130,
    align: 'center',
    headerTooltip: 'Asteroids with Occultations'
  },
  {
    field: 'count_occ',
    headerName: 'Occultations',
    width: 130,
    align: 'center'
  },
  {
    field: 'count_success',
    headerName: 'Success',
    width: 130,
    align: 'center'
  },
  {
    field: 'count_failures',
    headerName: 'Failures',
    width: 130,
    align: 'center'
  },
  {
    field: 'avg_exec_time',
    headerName: 'Average Execution Time',
    description: 'Average Execution Time',
    width: 130,
    align: 'center',
    valueFormatter: (params) => {
      return params.value !== null ? moment.utc(params.value * 1000).format('HH:mm:ss') : ''
    }
    // customElement: (row) => moment.utc(row.avg_exec_time * 1000).format('HH:mm:ss')
  },
  {
    field: 'owner',
    headerName: 'Owner',
    width: 130,
    flex: 1
  }
]
