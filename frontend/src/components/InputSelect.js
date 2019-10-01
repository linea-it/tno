import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    marginTop: (props) => props.marginTop,
    margin: theme.spacing(2),
    marginLeft: 30,
    minWidth: 120,
    width: (props) => props.width,

  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  MenuItem: {
    fontSize: 14,
  },
  OutlinedInput: {
    height: 37,
  },
}));

export default function SimpleSelect(props) {
  const classes = useStyles();
  const [values, setValues] = useState({
    input: '',
    name: '',

  });

  const [defaultValue, setDefaultValue] = useState(0);

  function handleChange(event) {
    /*
    A linha abaixo quer dizer:
    Pegue todas as propriedades do objeto e copie-as novamente.
    Porém altere a chave: event.target.name

    Esta é uma forma de alterar os valores das propriedades.
    Neste caso está alterando o valor de
    [event.target.name] para o valor que foi selecionado no select.
    */

    setValues((oldValues) => ({ ...oldValues, [event.target.name]: event.target.value }));

    setDefaultValue(event.target.value);



    switch (event.currentTarget.title) {
      case "input":


        props.setActionButton(false);

        let process_id = event.currentTarget.getAttribute('process_id');
        let orbit_input_list_id = event.currentTarget.getAttribute('orbit_input_list_id');
        let orbit_run_id = event.currentTarget.getAttribute('orbit_run_id');

        props.setSubmition({
          ...props.valueSubmition,
          processId: process_id,
          orbit_run_input_list_id: orbit_input_list_id,
          orbit_run_id: orbit_run_id,


        });



        //Case 

        break;

      case "catalog":
        let catalogId = event.currentTarget.id;
        props.setSubmition({
          ...props.valueSubmition,
          catalogId: catalogId
        });


        break;

      case "leapSeconds":
        let leapSecondsId = event.currentTarget.id;
        props.setSubmition({
          ...props.valueSubmition,
          leap_secondsId: leapSecondsId
        });
        break;

      case "bspPlanetary":
        let bsp_planetaryId = event.currentTarget.id;
        props.setSubmition({
          ...props.valueSubmition,
          bsp_planetaryId: bsp_planetaryId
        })
        break;
    }


  }

  const { formControl } = useStyles(props);
  const { title } = props;

  const loadMenuItems = () => {
    // Receive the data from PredictionOccultation props.
    const generalArray = props.data;
    const { display } = props;
    const { value } = props;


    // Create a map function to define(return) the MenuItems.


    if (generalArray && generalArray.length > 0) {
      //Gera os itens de menus com 2 propriedades diferentes: input_list_id(Lista de objetos) e orbitRun_id
      if (props.title === "input") {

        return generalArray.map((el, i) => (
          <MenuItem
            key={i}
            process_id={el.id}
            orbit_input_list_id={el.input_list}
            className={classes.MenuItem}
            value={i == 0 ? '' : i}
            orbit_run_id={el.proccess}
            title={props.title}
          >
            {eval(display)}
          </MenuItem>
        ));
      }
      else {

        return generalArray.map((el, i) => (
          <MenuItem
            key={i}
            id={el.id}
            className={classes.MenuItem}
            value={i}
            title={props.title}
          >
            {eval(display)}
          </MenuItem>
        ));
      }
    }
  };


  return (
    <form className={classes.root} autoComplete="off">
      <FormControl className={`${formControl}`}>
        <InputLabel htmlFor="input">{title}</InputLabel>
        <Select
          // value={values.input}
          value={defaultValue}
          onChange={handleChange}
          inputProps={{ name: 'input', id: 'input-simple', }}
          displayEmpty
        >


          Sets the defaulValue each SELECT

          {/* Load here the menuItems automatically */}
          {loadMenuItems()}
        </Select>
      </FormControl>
    </form>
  );
}

SimpleSelect.propTypes = {
  title: PropTypes.string.isRequired,
};
