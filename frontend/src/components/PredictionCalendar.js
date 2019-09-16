import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';


function PredictionCalendar({ history, setTitle }) {



  useEffect(() => {
    setTitle("Prediction Calendar");
  }, []);


  return (


    <h1>oi</h1>

  );

}


export default withRouter(PredictionCalendar);
