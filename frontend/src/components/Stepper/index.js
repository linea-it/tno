import React from 'react'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import PropTypes from 'prop-types'

function getSteps() {
  return ['CCD Images', 'Bsp Jpl', 'Gaia Catalog', 'Praia Astrometry', 'Done']
}

export default function AstrometryStepper({ activeStep }) {
  const steps = getSteps()

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps = {}
          const labelProps = {}

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          )
        })}
      </Stepper>
    </>
  )
}

AstrometryStepper.propTypes = {
  activeStep: PropTypes.number.isRequired
}
