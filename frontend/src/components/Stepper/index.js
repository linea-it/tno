import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import PropTypes from 'prop-types';

function getSteps() {
  return ['CCD Images', 'Bsp Jpl', 'Gaia Catalog', 'Praia Astrometry', 'Done'];
}

export default function AstrometryStepper({ activeStep }) {
  const steps = getSteps();

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </>
  );
}

AstrometryStepper.propTypes = {
  activeStep: PropTypes.number.isRequired,
};
