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
  }

  const { formControl } = useStyles(props);
  const { title } = props;

  return (
    <form className={classes.root} autoComplete="off">
      <FormControl variant="outlined" className={`${formControl}`}>
        <InputLabel htmlFor="input">{title}</InputLabel>
        <Select
          value={values.input}
          onChange={handleChange}
          inputProps={{ name: 'input', id: 'input-simple' }}
        >
          <MenuItem className={classes.MenuItem} value={10}>Ten</MenuItem>
          <MenuItem className={classes.MenuItem} value={20}>Twenty</MenuItem>
          <MenuItem className={classes.MenuItem} value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </form>
  );
}

SimpleSelect.propTypes = {
  title: PropTypes.string.isRequired,
};
