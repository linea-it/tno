import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';

function TestCalendar({ history, match: { params } }) {

  const [values, setValues] = useState({
    id: null,
    date: null,
    view: null,
    flag: null,
    sDate: null, //Start Date
    fDate: null, //Final Date
    searching: "",
  });


  useEffect(() => {
    setValues({
      id: params.id,
      date: params.date,
      view: params.view,
      flag: params.flag,
      sDate: params.sDate,
      fDate: params.fDate,
      searching: params.searching,
    });
  }, []);


  const handleClick = () => {

    if (values.flag === "calendar") {
      history.push(`/occultation-calendar-back/${values.id}/${values.date}/${values.view}/${values.sDate}/${values.fDate}`);
    } else {
      console.log("Occultation");
    }
  };

  const handleClick = () => {

    if (values.flag === "calendar") {
      history.push(`/occultation-calendar-back/${values.id}/${values.date}/${values.view}/${values.sDate}/${values.fDate}/${values.searching}`);
    } else {
      console.log("Occultation");
    }
  };



  return (
    <div>
      <button onClick={handleClick}>
        Back
      </button>
    </div>
  );
}

export default withRouter(TestCalendar);
