import { makeStyles } from '@mui/styles'

export const colors = [
  '#4D80CC',
  '#009900',
  '#b32d00',
  '#FEBC4F',
  '#996633',
  '#E6331A',
  '#FFFF99',
  '#1AB399',
  '#CC80CC',
  '#00B3E6',
  '#CC9999',
  '#E6B333',
  '#3366E6',
  '#0033CC',
  '#FEBC4F',
  '#B3B31A',
  '#00E680',
  '#4D8066',
  '#E6FF80',
  '#1AFF33',
  '#999933',
  '#FF3380',
  '#CCCC00',
  '#66E64D',
  '#4DB3FF',
  '#FF6633',
  '#CCFF1A',
  '#FF1A66',
  '#E666FF',
  '#6680B3',
  '#E666B3',
  '#99FF99',
  '#B34D4D',
  '#809900',
  '#E6B3B3',
  '#66991A',
  '#FF99E6',
  '#33991A',
  '#999966',
  '#33FFCC',
  '#66994D',
  '#B366CC',
  '#4D8000',
  '#B33300',
  '#66664D',
  '#991AFF',
  '#9900B3',
  '#E64D66',
  '#4DB380',
  '#FF4D4D',
  '#99E6E6',
  '#6666FF'
]

const useStyles = makeStyles((theme) => ({
  plotWrapper: {
    display: 'flex !important',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('lg')]: {
      overflow: 'auto'
    }
  },

  legendWrapper: {
    float: 'right',
    color: '#586069'
  },

  legend: {
    bottom: '-1px',
    display: 'inline-block',
    margin: '0 5px',
    listStyle: 'none',
    padding: 0
  },

  legendItem: {
    display: 'inline-block',
    width: 10,
    height: 10
  }
}))

export default useStyles
