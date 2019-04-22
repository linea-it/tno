import React, { Component } from 'react';
import { Formik } from 'formik';
import FormSkybot from './FormSkybot';
import * as Yup from 'yup';

// const styles = theme => ({
//   paper: {
//     marginTop: theme.spacing.unit * 8,
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     padding: `${theme.spacing.unit * 5}px ${theme.spacing.unit * 5}px ${theme
//       .spacing.unit * 5}px`,
//   },
//   container: {
//     maxWidth: '200px',
//   },
// });

const validationSchema = Yup.object({
  ra: Yup.string('Enter a name').required('Name is required'),
  dec: Yup.string('Enter a name').required('Name is required'),
});

class FormikTeste extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    // const classes = this.props;
    const values = { ra: '', dec: '' };
    return (
      <React.Fragment>
        {/* <div className={classes.container}> */}
        <Formik
          render={props => <FormSkybot {...props} />}
          initialValues={values}
          validationSchema={validationSchema}
        />
        {/* </div> */}
      </React.Fragment>
    );
  }
}

export default FormikTeste;
