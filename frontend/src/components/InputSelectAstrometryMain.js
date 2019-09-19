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


    let cases = event.currentTarget.getAttribute("case");


    // inputId: ,
    //   refCatalogId: null,
    //     configId: null,

    switch (cases) {
      case "input":

        props.setSubmition({
          ...props.valueSubmition,
          inputId: event.currentTarget.id

        });

        break;

      case "catalog":
        props.setSubmition({
          ...props.valueSubmition,
          refCatalogId: event.currentTarget.id

        });

        break;

      case "configuration":
        props.setSubmition({
          ...props.valueSubmition,
          configId: event.currentTarget.id

        });
    }

  }

  const { formControl } = useStyles(props);
  const { title } = props;

  const loadMenuItems = () => {
    // Receive the props data from Astrometry.
    const generalArray = props.data;

    //Display shows the names of the list
    //That is effectively shown on select
    //This comes from the props.
    const { display } = props;
    const { value } = props;


    // Create a map function to define(return) the MenuItems.


    if (generalArray && generalArray.length > 0) {

      return generalArray.map((el, i) => (

        <MenuItem
          key={i}
          id={el.id}
          className={classes.MenuItem}
          value={i}
          title={props.title}
          case={props.case}
        >
          {eval(display)}

        </MenuItem>
      ));

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
