import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Button,
  Typography,
  Slider,
  Icon,
  InputLabel,
  Select,
  Input,
  FormControl,
  Chip,
} from '@material-ui/core';
import Table from '../../components/Table';
import { getSkybotLists } from '../../services/api/SearchSsso';

function SearchSsso({ history, setTitle }) {
  const [tableData, setTableData] = useState([{}]);
  const [tableLoading, setTableLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [vMagnitude, setVmagnitude] = useState([4, 18]);
  const [dynamicClass, setDynamicClass] = useState([0]);
  const [
    subLevelDynamicClassSelected,
    setSubLevelDynamicClassSelected,
  ] = useState([]);
  const [subLevelDynamicClassList, setSubLevelDynamicClassList] = useState([]);
  const [objectCompiled, setObjectCompiled] = useState('Centaur');

  const filters = [];

  useEffect(() => {
    setTitle('Search SSSO');
  }, [setTitle]);

  const optionsClassFirstLevel = [
    { id: 1, label: 'Centaur', value: 'Centaur' },
    { id: 2, label: 'Hungaria', value: 'Hungaria' },
    { id: 3, label: 'KBO', value: 'KBO' },
    { id: 4, label: 'Mars-Crosser', value: 'Mars-Crosser' },
    { id: 5, label: 'MB', value: 'MB' },
    { id: 6, label: 'NEA', value: 'NEA' },
    { id: 7, label: 'Trojan', value: 'Trojan' },
  ];

  const optionsClassSecondLevel = [
    {
      id: 1,
      parentId: 3,
      label: 'Detached',
      value: 'KBO>Detached',
    },
    {
      id: 2,
      parentId: 3,
      label: 'Classical',
      value: 'KBO>Classical',
    },
    {
      id: 3,
      parentId: 3,
      label: 'Classical>Inner',
      value: 'KBO>Classical>Inner',
    },
    {
      id: 4,
      parentId: 3,
      label: 'Classical>Main',
      value: 'KBO>Classical>Main',
    },
    {
      id: 5,
      parentId: 3,
      label: 'Classical>Outer',
      value: 'KBO>Classical>Outer',
    },
    {
      id: 6,
      parentId: 3,
      label: 'Resonant>11:3',
      value: 'KBO>Resonant>11:3',
    },
    {
      id: 7,
      parentId: 3,
      label: 'Resonant>11:6',
      value: 'KBO>Resonant>11:6',
    },
    {
      id: 8,
      parentId: 3,
      label: 'Resonant>11:8',
      value: 'KBO>Resonant>11:8',
    },
    {
      id: 9,
      parentId: 3,
      label: 'Resonant>19:9',
      value: 'KBO>Resonant>19:9',
    },
    {
      id: 10,
      parentId: 3,
      label: 'Resonant>2:1',
      value: 'KBO>Resonant>2:1',
    },
    {
      id: 11,
      parentId: 3,
      label: 'Resonant>3:1',
      value: 'KBO>Resonant>3:1',
    },
    {
      id: 12,
      parentId: 3,
      label: 'Resonant>3:2',
      value: 'KBO>Resonant>3:2',
    },
    {
      id: 13,
      parentId: 3,
      label: 'Resonant>4:3',
      value: 'KBO>Resonant>4:3',
    },
    {
      id: 14,
      parentId: 3,
      label: 'Resonant>5:2',
      value: 'KBO>Resonant>5:2',
    },
    {
      id: 15,
      parentId: 3,
      label: 'Resonant>5:3',
      value: 'KBO>Resonant>5:3',
    },
    {
      id: 16,
      parentId: 3,
      label: 'Resonant>5:4',
      value: 'KBO>Resonant>5:4',
    },
    {
      id: 17,
      parentId: 3,
      label: 'Resonant>7:2',
      value: 'KBO>Resonant>7:2',
    },
    {
      id: 18,
      parentId: 3,
      label: 'Resonant>7:3',
      value: 'KBO>Resonant>7:3',
    },
    {
      id: 19,
      parentId: 3,
      label: 'Resonant>7:4',
      value: 'KBO>Resonant>7:4',
    },
    {
      id: 20,
      parentId: 3,
      label: 'Resonant>9:4',
      value: 'KBO>Resonant>9:4',
    },
    {
      id: 21,
      parentId: 3,
      label: 'Resonant>9:5',
      value: 'KBO>Resonant>9:5',
    },
    {
      id: 22,
      parentId: 3,
      label: 'SDO',
      value: 'KBO>SDO',
    },
    {
      id: 23,
      parentId: 5,
      label: 'Cybele',
      value: 'MB>Cybele',
    },
    {
      id: 24,
      parentId: 5,
      label: 'Hilda',
      value: 'MB>Hilda',
    },
    {
      id: 25,
      parentId: 5,
      label: 'Inner',
      value: 'MB>Inner',
    },
    {
      id: 26,
      parentId: 5,
      label: 'Middle',
      value: 'MB>Middle',
    },
    {
      id: 27,
      parentId: 5,
      label: 'Outer',
      value: 'MB>Outer',
    },
    {
      id: 28,
      parentId: 6,
      label: 'Amor',
      value: 'NEA>Amor',
    },
    {
      id: 29,
      parentId: 6,
      label: 'Apollo',
      value: 'NEA>Apollo',
    },
    {
      id: 30,
      parentId: 6,
      label: 'Aten',
      value: 'NEA>Aten',
    },
    {
      id: 31,
      parentId: 6,
      label: 'Atira',
      value: 'NEA>Atira',
    },
    {
      id: 32,
      parentId: 4,
      label: 'Deep',
      value: 'Mars-Crosser>Deep',
    },
    {
      id: 33,
      parentId: 4,
      label: 'Shallow',
      value: 'Mars-Crosser>Shallow',
    },
  ];

  useEffect(() => {
    let currentSublevelList = [];
    dynamicClass.forEach((i) => {
      const current = optionsClassFirstLevel[i];
      const currentChildren = optionsClassSecondLevel.filter(
        (option) => option.parentId === current.id
      );
      currentSublevelList = currentSublevelList.concat(currentChildren);
    });
    setSubLevelDynamicClassSelected(
      Object.keys(currentSublevelList).map((el) => Number(el))
    );
    setSubLevelDynamicClassList(currentSublevelList);
  }, [dynamicClass, optionsClassFirstLevel, optionsClassSecondLevel]);

  useEffect(() => {
    if (dynamicClass.length > 0) {
      const dynamicClassSelected = dynamicClass
        .map((i) => optionsClassFirstLevel[i].value)
        .concat(
          subLevelDynamicClassSelected.map(
            (i) => subLevelDynamicClassList[i].value
          )
        )
        .join(',');
      setObjectCompiled(dynamicClassSelected);
    }
  }, [
    subLevelDynamicClassSelected,
    subLevelDynamicClassList,
    optionsClassFirstLevel,
    optionsClassSecondLevel,
    dynamicClass,
  ]);

  const loadTableData = ({ pageSize, currentPage, searchValue }) => {
    setTableLoading(true);

    const options = [
      {
        property: 'dynclass__in',
        value: objectCompiled,
      },
      {
        property: 'mv__range',
        value: vMagnitude.join(),
      },
      {
        property: 'ccdnum__isnull',
        value: false,
      },
    ];

    options.forEach((option) => {
      filters.push({
        property: option.property,
        value: option.value,
      });
    });

    getSkybotLists({
      page: currentPage + 1,
      pageSize,
      search: searchValue,
      filters,
    })
      .then((res) => {
        setTotalCount(res.data.count);
        setTableData(res.data.results);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const handleClearFilters = () => {
    setVmagnitude([4, 18]);
    setObjectCompiled('');
    setDynamicClass([]);
  };

  const handleSearchSssoDetail = (row) => {
    history.push(`search-ssso-detail/${row.id}`);
  };

  const handleValues = (value) => {
    const roundValue = parseFloat(value).toFixed(3);
    const stringValue = roundValue.toString();
    return stringValue;
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className="fas fa-info-circle" />,
      action: handleSearchSssoDetail,
      sortingEnabled: false,
    },
    {
      name: 'name',
      title: 'Obj Name',
      width: 100,
      align: 'left',
      headerTooltip: 'Object Name',
    },
    {
      name: 'num',
      title: 'Obj Num',
      width: 130,
      align: 'right',
      headerTooltip: 'Object Number',
    },
    {
      name: 'raj2000',
      title: 'RA (deg)',
      width: 120,
      align: 'right',
      headerTooltip: 'Right Ascension',
      customElement: (row) => (
        <span>{row.raj2000 ? handleValues(row.raj2000) : ''}</span>
      ),
    },
    {
      name: 'decj2000',
      title: 'Dec (deg)',
      width: 120,
      align: 'right',
      headerTooltip: 'Declination',
      customElement: (row) => (
        <span>{row.decj2000 ? handleValues(row.decj2000) : ''}</span>
      ),
    },
    {
      name: 'ccdnum',
      title: 'CCD Num',
      width: 120,
      align: 'right',
      headerTooltip: 'CCD Number',
    },
    {
      name: 'band',
      title: 'Band',
      width: 60,
      align: 'center',
    },
    {
      name: 'expnum',
      title: 'Exp Num',
      width: 130,
      align: 'right',
      headerTooltip: 'Esposure Number',
    },
    {
      name: 'dynclass',
      title: 'Dyn Class',
      width: 100,
      align: 'left',
      headerTooltip: 'Dynamic Class',
    },
    {
      name: 'mv',
      title: 'Visual Mag',
      width: 120,
      align: 'right',
      headerTooltip: 'Visual Magnitude',
    },
    {
      name: 'errpos',
      title: 'Error (arcsec)',
      headerTooltip: 'Error on the position (arcsec)',
      width: 150,
      align: 'right',
      customElement: (row) => (
        <span>{row.errpos ? handleValues(row.errpos) : ''}</span>
      ),
    },
  ];

  const handleDynamicClass = (e) => {
    setSubLevelDynamicClassSelected([]);
    setDynamicClass(e.target.value);
  };

  const handleSubLevelDynamicClass = (e) => {
    setSubLevelDynamicClassSelected(e.target.value);
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="SkyBot Output" />
          <CardContent>
            <form>
              <Grid item lg={7} xl={7}>
                <FormControl>
                  <InputLabel>Dynamic class</InputLabel>
                  <Select
                    multiple
                    value={dynamicClass}
                    onChange={handleDynamicClass}
                    input={<Input />}
                    renderValue={() => (
                      <div>
                        {dynamicClass.map((i) => (
                          <Chip
                            key={optionsClassFirstLevel[i].id}
                            label={optionsClassFirstLevel[i].label}
                          />
                        ))}
                      </div>
                    )}
                  >
                    {optionsClassFirstLevel.map((option, i) => (
                      <MenuItem key={option.id} value={i}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item lg={3} xl={3}>
                <div>
                  <Typography gutterBottom variant="body2">
                    {`Magnitude(g): ${vMagnitude}`}
                  </Typography>
                  <Slider
                    value={vMagnitude}
                    step={1}
                    min={4}
                    max={23}
                    valueLabelDisplay="auto"
                    onChange={(event, value) => {
                      setVmagnitude(value);
                    }}
                  />
                </div>
              </Grid>
              <Grid item lg={2} xl={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </Grid>
              <FormControl>
                <InputLabel>Sublevel dynamic class</InputLabel>
                <Select
                  disabled={!(subLevelDynamicClassList.length > 0)}
                  multiple
                  value={subLevelDynamicClassSelected}
                  onChange={handleSubLevelDynamicClass}
                  input={<Input />}
                  renderValue={() => (
                    <div>
                      {subLevelDynamicClassSelected.map((i) => (
                        <Chip
                          key={subLevelDynamicClassList[i].id}
                          label={subLevelDynamicClassList[i].label}
                        />
                      ))}
                    </div>
                  )}
                >
                  {subLevelDynamicClassList.map((option, i) => (
                    <MenuItem key={option.id} value={i}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </form>
            <Table
              data={tableData}
              columns={tableColumns}
              loadData={loadTableData}
              totalCount={totalCount}
              loading={tableLoading}
              hasToolbar
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

SearchSsso.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default SearchSsso;