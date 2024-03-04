import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'

import styles from './styles'

import OverviewContent from '../../../components/Content/Overview.md'
import OccultationPredictionsTableContent from '../../../components/Content/OccultationPredictionsTable.md'
import FilterEventsContent from '../../../components/Content/FilterEvents.md'
import APIContent from '../../../components/Content/API.md'
import OccultationDetailsPageContent from '../../../components/Content/OccultationDetailsPage.md'
import ReleaseNotesContent from '../../../components/Content/ReleaseNotes.md'
import FAQContent from '../../../components/Content/FAQ.md'
import CitationContent from '../../../components/Content/Citations.md'

const menuItems = [
  { label: 'Overview', id: 'overview' },
  { label: 'Release Notes', id: 'release-notes' },
  { label: 'Occultation Predictions Table', id: 'occultation-predictions-table' },
  { label: 'Filtering Events', id: 'filtering-events' },
  { label: 'API', id: 'api' },
  { label: 'Occultation Details Page', id: 'occultation-details-page' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Citations', id: 'citation' }
]

function PublicDocumentation() {
  const classes = styles()
  const [selectedMenuItem, setSelectedMenuItem] = useState('overview')
  const [content, setContent] = useState({
    overview: null,
    releaseNotes: null,
    occultationPredictionsTable: null,
    filterEvents: null,
    api: null,
    occultationDetailsPage: null,
    faq: null,
    citation: null
  })

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const overviewResponse = await fetch(OverviewContent)
        const releaseNotesResponse = await fetch(ReleaseNotesContent)
        const occultationPredictionsTableResponse = await fetch(OccultationPredictionsTableContent)
        const filterEventsResponse = await fetch(FilterEventsContent)
        const apiResponse = await fetch(APIContent)
        const occultationDetailsPageResponse = await fetch(OccultationDetailsPageContent)
        const FAQResponse = await fetch(FAQContent)
        const CitationResponse = await fetch(CitationContent)

        const overviewText = await overviewResponse.text()
        const releaseNotesText = await releaseNotesResponse.text()
        const occultationPredictionsTableText = await occultationPredictionsTableResponse.text()
        const filterEventsText = await filterEventsResponse.text()
        const apiText = await apiResponse.text()
        const occultationDetailsPageText = await occultationDetailsPageResponse.text()
        const faqText = await FAQResponse.text()
        const citationText = await CitationResponse.text()

        setContent({
          overview: overviewText,
          releaseNotes: releaseNotesText,
          occultationPredictionsTable: occultationPredictionsTableText,
          filterEvents: filterEventsText,
          api: apiText,
          occultationDetailsPage: occultationDetailsPageText,
          faq: faqText,
          citation: citationText
        })
      } catch (error) {
        console.error('Error fetching content:', error)
      }
    }

    fetchContent()
  }, [])

  return (
    <Container maxWidth='lg'>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} className={classes.menuContainer}>
          <Card>
            <CardContent>
              <Typography variant='h6'>Menu</Typography>
              <List>
                {menuItems.map((item) => (
                  <ListItem
                    key={item.id}
                    button
                    component='a'
                    href={`#${item.id}`}
                    onClick={() => setSelectedMenuItem(item.id)}
                    selected={selectedMenuItem === item.id}
                  >
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box className={classes.initContainer}>
            <Breadcrumbs aria-label='breadcrumb'>
              <Link color='inherit' href='/'>
                Home
              </Link>
              <Typography color='textPrimary'>Documentation</Typography>
            </Breadcrumbs>
            <Box id='overview' sx={{ display: selectedMenuItem === 'overview' ? 'block' : 'none' }}>
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.overview || ''}</ReactMarkdown>
              </div>
            </Box>
            <Box id='release-notes' sx={{ display: selectedMenuItem === 'release-notes' ? 'block' : 'none' }}>
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.releaseNotes || ''}</ReactMarkdown>
              </div>
            </Box>
            <Box
              id='occultation-predictions-table'
              sx={{ display: selectedMenuItem === 'occultation-predictions-table' ? 'block' : 'none' }}
            >
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.occultationPredictionsTable || ''}</ReactMarkdown>
              </div>
            </Box>
            <Box id='filtering-events' sx={{ display: selectedMenuItem === 'filtering-events' ? 'block' : 'none' }}>
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.filterEvents || ''}</ReactMarkdown>
              </div>
            </Box>
            <Box id='api' sx={{ display: selectedMenuItem === 'api' ? 'block' : 'none' }}>
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.api || ''}</ReactMarkdown>
              </div>
            </Box>
            <Box id='occultation-details-page' sx={{ display: selectedMenuItem === 'occultation-details-page' ? 'block' : 'none' }}>
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.occultationDetailsPage || ''}</ReactMarkdown>
              </div>
            </Box>
            <Box id='faq' sx={{ display: selectedMenuItem === 'faq' ? 'block' : 'none' }}>
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.faq || ''}</ReactMarkdown>
              </div>
            </Box>
            <Box id='citation' sx={{ display: selectedMenuItem === 'citation' ? 'block' : 'none' }}>
              <div className={classes.markdownContent}>
                <ReactMarkdown remarkPlugins={[gfm]}>{content.citation || ''}</ReactMarkdown>
              </div>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PublicDocumentation
