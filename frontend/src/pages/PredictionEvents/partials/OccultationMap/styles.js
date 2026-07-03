import { makeStyles } from '@mui/styles'

const styles = makeStyles(() => ({
  map: {
    width: '100%',
    aspectRatio: '4 / 3',
    maxHeight: 640,
    minHeight: 360,
    borderRadius: '10px',
    zIndex: 0,
    '@media (max-width: 600px)': {
      aspectRatio: '3 / 4',
      minHeight: 420,
      '& .leaflet-control-attribution': {
        display: 'none',
      },
    },
    '& .info.legend': {
      '@media (max-width: 600px)': {
        display: 'none',
      },
    },
    '& .leaflet-reset-control': {
      position: 'absolute',
      top: 80,
      left: 12,
      zIndex: 1000,
    },
  },

  globe: {
    width: '100%',
    '& .globe-svg': {
      width: '100%',
      height: 'auto',
      display: 'block',
    },
  },

  mapThumbsCard: {
    height: '175px',
    width: '190px',
    borderRadius: '10px',
  },

  mapThumbsList: {
    height: '72px',
    width: '93px',
    borderRadius: '10px',
  },
}))

export default styles
