import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';

import FullCalendar from '@fullcalendar/react';
import DayGridPlugin from '@fullcalendar/daygrid';
import InteractionPlugin from '@fullcalendar/interaction';
import ListPlugin from '@fullcalendar/list';

import { CircularProgress, TextField } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';

import { getOccultations } from '../../services/api/Occultation';

import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/list/main.css';

// TODO: This whole component needs a refactor!
function OccultationCalendar({ setTitle }) {
  const params = useParams();
  const history = useHistory();
  const [events, setEvents] = useState([]);
  const [initialDate, setInitialDate] = useState(
    params.sDate
      ? params.sDate
      : moment(new Date()).startOf('month').format('YYYY-MM-DD')
  );
  const [finalDate, setFinalDate] = useState(
    moment(new Date()).endOf('month').format('YYYY-MM-DD')
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(
    params.searching ? params.searching : ''
  );

  useEffect(() => {
    setTitle('Occultation Calendar');
  }, [setTitle]);

  useEffect(() => {
    setLoading(true);

    const filters = [
      {
        property: 'date_time__range',
        value: [initialDate, finalDate].join(),
      },
      {
        property: 'most_recent_only',
        value: true,
      },
    ];

    if (search && search !== '') {
      filters.push({
        property: 'asteroid__name__icontains',
        value: search,
      });
    }

    getOccultations({ filters, pageSize: 3000 })
      .then((res) => {
        const data = res.results;
        const result = [];

        data.forEach((resp) => {
          // Se o asteroid tiver numero, o nome do asteroid passa a ser NAME(Number) se nao so NAME.
          const asteroidName =
            parseInt(resp.asteroid_number) > 0
              ? `${resp.asteroid_name} (${resp.asteroid_number})`
              : resp.asteroid_name;

          result.push({
            id: resp.id,
            title: asteroidName,
            date: resp.date_time,
            textColor: 'white',
          });
        });

        setEvents(result);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initialDate, finalDate, search]);

  const header = {
    center: 'title',
    right: 'prev,next, ',
    month: 'month',
    listYear: 'Year',
    left: 'dayGridDay,dayGridWeek,dayGridMonth,listYear',
  };

  const handleDateRender = (arg) => {
    const start_date = moment(arg.view.currentStart).format('YYYY-MM-DD');
    const end_date = moment(arg.view.currentEnd)
      .subtract(1, 'days')
      .format('YYYY-MM-DD');

    // Um problema que surgiu nesta página foi o seguinte:
    // Quando o calendário renderiza, ele traz consigo uma data default que é especificada
    // no atributo no componente. Se o calendário não fosse pra página de ocultações estaria tudo certo.
    // Porém como ele vai pra outra página e retorna trazendo as informações de datas iniciais e finais
    // então foi necessário montar um esquema pra que ele não se perdesse nas renderizações.
    // Desto modo toda vez que ele renderiza, ou ele pega o valor dos params que retornam da página de
    // ocultações ou ele renderiza um valor default do dia e mês corrente.
    // Já a parte do código abaixo obriga o calendário re-renderizar, quebrando portanto a regra de valor
    // default. Isso foi extemamente útil pra administrar o conteúdo de forma orgamizada.
    // Ou seja, os valores default são sempre carregados na inicialização.
    // Os valores abaixo definidos são sempre carregados a partir da navegação do usuário.
    // Desta forma consegui amarrar o conteúdo.

    setInitialDate(start_date);
    setFinalDate(end_date);
  };

  // Variable used to change specific button name
  const buttonText = {
    listYear: 'year',
    month: 'month',
  };

  const handleEvent = (e) => {
    history.push({
      pathname: `/occultation/${e.event.id}`,
      state: {
        date: e.event.start,
        view: e.view.type,
        flag: 'calendar',
        initialDate,
        finalDate,
        search,
      },
    });
  };

  const handleEventRender = (event) => {
    const time = moment(event.event.start).format('H');

    if (time >= 18) {
      event.el.innerHTML = `${event.el.innerHTML}<Icon id='sol_lua' class='fas fa-moon'></i>`;
    } else {
      event.el.innerHTML = `${event.el.innerHTML}<Icon id='sol_lua' class='fas fa-sun'></i>`;
    }
  };

  const handleChange = (event) => {
    const fetch = event.target.value;
    setSearch(fetch === '' ? '' : fetch);
  };

  return (
    <div>
      {loading && <CircularProgress size={120} thickness={0.8} />}
      <div>
        <SearchIcon />

        <TextField
          id="standard-search"
          label=""
          placeholder="Search…"
          onChange={handleChange}
          value={search}
          inputProps={{ 'aria-label': 'search' }}
          autoFocus
          type="search"
          fullWidth={false}
        />
      </div>

      {/* params.date is coming back from occulation.
      It's being used to maintain data that went from calendar to occultation.
      Flow:
      1 -User chooses an event.
      2- The specific data goes to occultation.
      3 - On occultation screen user click on back button.
      4 - When back, data comes inside params props.(params are internal(internal operation)); */}
      <FullCalendar
        header={header}
        events={events}
        defaultDate={params.sDate ? params.sDate : initialDate}
        eventClick={handleEvent}
        buttonText={buttonText}
        plugins={[DayGridPlugin, InteractionPlugin, ListPlugin]}
        defaultView={params.view ? params.view : null}
        themeSystem="standard"
        datesRender={handleDateRender}
        weekNumbers
        eventRender={handleEventRender}
      />
    </div>
  );
}

OccultationCalendar.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default OccultationCalendar;
