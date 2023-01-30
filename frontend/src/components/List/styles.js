import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    maxWidth: '100%'
  },
  itemText: {
    flex: '1 1'
  },
  itemValueText: ({ align }) => ({
    textAlign: align
  }),
  tooltip: {
    borderBottom: '1px dotted #888',
    cursor: 'help'
  },
  tooltipIcon: {
    fontSize: 10,
    opacity: 0.8,
    marginLeft: 2
  }
})

export default useStyles
