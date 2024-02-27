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

import IntroductionContent from '../../../components/Content/Introduction.md'
import PlanetsContent from '../../../components/Content/Planets.md'
import MoonsContent from '../../../components/Content/Moons.md'
import AsteroidsCometsContent from '../../../components/Content/Asteroids_Comets.md'
import InteractiveToolsContent from '../../../components/Content/Interactive_Tools.md'

const menuItems = [
  { label: 'Introduction to the Solar System', id: 'introduction' },
  { label: 'Planets of the Solar System', id: 'planets' },
  { label: 'Moons of the Solar System', id: 'moons' },
  { label: 'Asteroids and Comets', id: 'asteroids-comets' },
  { label: 'Interactive Tools in the Solar System Portal', id: 'interactive-tools' }
]

function PublicDocumentation() {
  const classes = styles()
  const [selectedMenuItem, setSelectedMenuItem] = useState('introduction')
  const [content, setContent] = useState({
    introduction: null,
    planets: null,
    moons: null,
    asteroidsComets: null,
    interactiveTools: null
  })

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const introductionResponse = await fetch(IntroductionContent)
        const planetsResponse = await fetch(PlanetsContent)
        const moonsResponse = await fetch(MoonsContent)
        const asteroidsCometsResponse = await fetch(AsteroidsCometsContent)
        const interactiveToolsResponse = await fetch(InteractiveToolsContent)

        const introductionText = await introductionResponse.text()
        const planetsText = await planetsResponse.text()
        const moonsText = await moonsResponse.text()
        const asteroidsCometsText = await asteroidsCometsResponse.text()
        const interactiveToolsText = await interactiveToolsResponse.text()

        setContent({
          introduction: introductionText,
          planets: planetsText,
          moons: moonsText,
          asteroidsComets: asteroidsCometsText,
          interactiveTools: interactiveToolsText
        })
      } catch (error) {
        console.error('Error fetching content:', error)
      }
    }

    fetchContent()
  }, [])

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} className={classes.menuContainer}>
          <Card>
            <CardContent>
              <Typography variant='h6'>Menu</Typography>
              <List>
                {menuItems.map(item => (
                  <ListItem
                    key={item.id}
                    button
                    component="a"
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
            <Box id="introduction" sx={{ display: selectedMenuItem === 'introduction' ? 'block' : 'none' }}>
              <ReactMarkdown remarkPlugins={[gfm]}>{content.introduction || ''}</ReactMarkdown>
            </Box>
            <Box id="planets" sx={{ display: selectedMenuItem === 'planets' ? 'block' : 'none' }}>
              <ReactMarkdown remarkPlugins={[gfm]}>{content.planets || ''}</ReactMarkdown>
            </Box>
            <Box id="moons" sx={{ display: selectedMenuItem === 'moons' ? 'block' : 'none' }}>
              <ReactMarkdown remarkPlugins={[gfm]}>{content.moons || ''}</ReactMarkdown>
            </Box>
            <Box id="asteroids-comets" sx={{ display: selectedMenuItem === 'asteroids-comets' ? 'block' : 'none' }}>
              <ReactMarkdown remarkPlugins={[gfm]}>{content.asteroidsComets || ''}</ReactMarkdown>
            </Box>
            <Box id="interactive-tools" sx={{ display: selectedMenuItem === 'interactive-tools' ? 'block' : 'none' }}>
              <ReactMarkdown remarkPlugins={[gfm]}>{content.interactiveTools || ''}</ReactMarkdown>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PublicDocumentation
