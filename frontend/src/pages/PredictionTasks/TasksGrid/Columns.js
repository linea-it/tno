// import ColumnStatus from '../../components/Table/ColumnStatus'
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
// import Button from '@mui/material/Button'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import moment from 'moment'
dayjs.extend(utc)
dayjs.extend(timezone)

// const renderDetail = (props) => (
//   <Button href={`/dashboard/data-preparation/predict-detail/${props.row.id}`}>
//     <InfoOutlinedIcon />
//   </Button>
// )
// const renderStatus = (props) => <ColumnStatus status={props.row.status} headerName={props.row.error} />

export const tasksColumns = [
  // {
  //   field: 'detail',
  //   headerName: 'Detail',
  //   width: 80,
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: false,
  //   renderCell: renderDetail
  // },
  {
    field: 'id',
    headerName: 'Task ID',
    width: 150
  },
  {
    field: 'asteroid_id',
    headerName: 'Asteroid',
    width: 120
  },
  {
    field: 'state',
    headerName: 'State',
    align: 'center',
    headerAlign: 'center',
    // renderCell: renderStatus
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 100
  },
  {
    field: 'created_at',
    headerName: 'Created At',
    width: 160,
    valueFormatter: (params) => {
      return params.value !== null ? `${dayjs(params.value).utc().format('YYYY-MM-DD HH:mm:ss')}` : ''
    }
  },
  {
    field: 'updated_at',
    headerName: 'Last Update',
    width: 160,
    valueFormatter: (params) => {

      if (!params.value) {
        return ''
      }

      const now = moment.utc()
      const then = moment.utc(params.value)
      const duration = moment.duration(now.diff(then))
      const humanized = duration.humanize({ ss: 1 }) // mostra segundos

      return `${humanized} ago`
    }
  },
  {
    field: 'attempt_count',
    headerName: 'Attempts',
  },
  {
    field: 'next_retry_at',
    headerName: 'Next Retry',
    width: 160,
    valueFormatter: (params) => {

      if (!params.value) {
        return ''
      }

      const now = moment.utc()
      const then = moment.utc(params.value)
      const duration = moment.duration(then.diff(now))
      const humanized = duration.humanize({ ss: 1 }) // mostra segundos

      return `${humanized}`
    }
  },

  {
    field: 'aborted',
    headerName: 'Aborted',
    type: 'boolean',
    width: 100,
    align: 'center',
    headerAlign: 'center'
  }
]

