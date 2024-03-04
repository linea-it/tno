import { makeStyles } from '@mui/styles'
import { grey, blue } from '@mui/material/colors'

const styles = makeStyles((theme) => ({
  initContainer: {
    paddingTop: 20,
    paddingBottom: 100
  },
  grid: {
    margin: 'auto'
  },
  textFormat: {
    marginTop: 40,
    fontSize: '1.07rem!important',
    fontFamily: 'arial',
    fontWeight: '100',
    lineHeight: '1.5',
    textAlign: 'justify',
    color: grey[700],
    letterSpacing: '0.0em',
    textTransform: 'none'
  },
  menuContainer: {
    position: 'sticky',
    top: -10,
    height: '75vh',
    overflowY: 'auto'
  },
  markdownContent: {
    color: grey[700], // Default text color set to grey[700]
    '& p, & li, & th, & td': {
      lineHeight: '1.5'
    },
    '& blockquote': {
      backgroundColor: blue[50], // Light blue background for blocks
      padding: '10px 20px',
      margin: '20px 0',
      borderLeft: `10px solid ${theme.palette.primary.main}` // Using primary color for border
      // color: theme.palette.primary.main, // Same blue for text inside blocks
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      color: grey[800] // Darker shade of grey for heading titles
    },
    '& table': {
      width: '100%', // Full-width tables
      borderCollapse: 'collapse', // Collapse borders into a single border
      border: `1px solid ${grey[700]}`, // Light blue borders for the table
      marginBottom: '1rem' // Space below the table
    },
    '& th, & td': {
      border: `1px solid ${grey[300]}`, // Light blue borders for table cells
      padding: '8px', // Padding inside cells
      textAlign: 'left' // Text align left for table cells
    },
    '& th': {
      backgroundColor: grey[300], // Light blue background for table column titles
      color: grey[700], // Dark blue text for table column titles, using primary color
      fontWeight: 'bold', // Bold font weight for headers
      textAlign: 'left' // Centralized table column titles
    }
  }
}))

export default styles
