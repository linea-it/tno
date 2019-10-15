import React, { useState, useEffect } from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import CardMedia from '@material-ui/core/CardMedia';
import { makeStyles } from '@material-ui/styles';
import { Card, CardHeader, CardActions } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Fab from '@material-ui/core/Fab';



export default function CustomAsteroidGridList({
  tileData,
  baseUrl,
  handleImgDetail,
  hasActions,
  buttonTitle,
  buttonIcon,
  height,
  cellHeight,
  spacing,
}) {



  const useStyles = makeStyles((theme) => ({
    gridList: {
      width: "100%",
      height: height,
    },
    imgCard: {
      height: 750,
      width: "100%",
    },
    titleImg: {
      textAlign: 'center',
    },
    cardMedia: {
      height: '80%',
      paddingTop: '56.25%', // 16:9
      width: "90%"
    },
    img: {
      width: '80%',
      height: '50%',
    },
    underTitle: {
      alignContent: "center",
      justifyContent: "center",
      textAlign: "center",

    },
    cardActions: {
      justifyContent: "center",
    },
    fab: {
      // marginLeft: '30%',
    },
    leftIcon: {
      marginRight: theme.spacing(1),
    },

  }));

  const classes = useStyles();

  const [actions, setActions] = useState(false);


  useEffect(() => {
    setActions(hasActions);
  }, []);


  return (
    <>
      <GridList cellHeight={cellHeight} cols={window.innerWidth <= 1280 ? 2 : 4} spacing={spacing} className={classes.gridList}>
        {!tileData ? null : tileData.map(tile => (
          <GridListTile key={tile.id} cols={1}>
            <Card className={classes.imgCard}>
              <CardHeader
                title={<span className={classes.titleImg}>{tile.asteroid_name}</span>}
              />
              <CardMedia
                className={classes.cardMedia}
                image={baseUrl + tile.src} className={classes.img}
                title={tile.title ? tile.title : tile.asteroid_name}
              />
              <Divider />
              <p className={classes.underTitle}>{tile.date_time}</p>
              <p className={classes.underTitle}>G mag*: {tile.g}</p>
              {actions && <CardActions className={classes.cardActions}>
                <Fab variant="extended" size={"small"} aria-label="extended" className={classes.fab} onClick={() => handleImgDetail(tile.id)}>
                  {buttonIcon}
                  {buttonTitle}
                </Fab>
              </CardActions>}
            </Card>
          </GridListTile>
        ))}
      </GridList>
    </>
  );
}