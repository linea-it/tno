import datetime
import posixpath
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from astroquery.jplhorizons import Horizons
from des.dao.observation import DesObservationDao
from django.conf import settings


def ephemeris_from_jpl(name, date_start, date_end):
    obj = Horizons(
        id=name,
        location="500",
        id_type="smallbody",
        epochs={
            "start": date_start.strftime("%Y-%m-%d"),
            "stop": date_end.strftime("%Y-%m-%d"),
            "step": "1d",
        },
    )

    eph = obj.ephemerides()
    return eph


def passRA_axisLimit(distanceRA, arrayRA):
    """
    Finds out if an element of a list (or array) of RA coordinates crosses the boundary

    Compare all distances d[i] with the specific value (0<distanceRA<360)
    (d[i+1] = abs(ra[i+1]- ra[i])) where 0 <= i <= len(arrayRA) - 1.
    If d(i+1) > distanceRA then the element arrayRA[i+1] passed the boundary

    input
        arrayRA: array, list
        distanceRA: int, float. Value between 0 and 360

    return
        index: int, the index of the element that crossed the boundary.
            Empty (None) if there is no crossing element
    """
    index = None
    for i in range(len(arrayRA) - 1):
        diff = abs(arrayRA[i + 1] - arrayRA[i])
        if diff > distanceRA:
            index = i + 1
            break
    return index


def plot_observations_by_asteroid(name, format, width=600, height=400):
    dao = DesObservationDao()
    rows = dao.by_asteroid_name(name)

    dfObs = pd.DataFrame(rows)
    dfObs = dfObs[["date_obs", "ra", "dec", "offset_ra", "offset_dec"]]

    # Define the number of days to set the begin and end limit to plot
    delta_days = datetime.timedelta(days=10)

    date_start = dfObs["date_obs"].min() - delta_days
    date_end = dfObs["date_obs"].max() + delta_days

    # Baixa a ephemeris para o asteroid e guarda um cache para proximas consultas.
    eph_filename = f"{name}-%s-%s" % (
        date_start.strftime("%Y-%m-%d"),
        date_end.strftime("%Y-%m-%d"),
    )
    eph_filepath = Path(settings.MEDIA_TMP_DIR).joinpath(eph_filename)

    if eph_filepath.exists():
        df_jpl = pd.read_csv(eph_filepath, sep=";")
    else:
        eph = ephemeris_from_jpl(name, date_start, date_end)
        df_jpl = eph["datetime_str", "RA", "DEC"].to_pandas()
        df_jpl.rename(
            columns={"datetime_str": "date", "RA": "ra", "DEC": "dec"}, inplace=True
        )
        df_jpl.to_csv(eph_filepath, index=False, header=True, sep=";")

    raObs = dfObs["ra"].values
    indexObs = passRA_axisLimit(200, raObs)

    if indexObs:
        dfObs["correction_ra"] = dfObs.loc[:, "ra"]
        for i in range(indexObs, len(dfObs)):
            dfObs.at[i, "correction_ra"] = dfObs.at[i, "correction_ra"] + 360

    raJPL = df_jpl["ra"].values
    indexJPL = passRA_axisLimit(300, raJPL)

    if indexJPL:
        df_jpl["correction_ra"] = df_jpl.loc[:, "ra"]
        for i in range(indexJPL, len(df_jpl)):
            df_jpl.at[i, "correction_ra"] = df_jpl.at[i, "correction_ra"] + 360

    xDataJPL = "ra"
    textRA_JPL = "x"
    if "correction_ra" in df_jpl:
        textRA_JPL = "customdata[0]"
        xDataJPL = "correction_ra"

    fig1 = px.line(
        df_jpl,
        x=xDataJPL,
        y="dec",
        color_discrete_sequence=["black"],
        hover_data=["ra", "dec"],
    )
    fig1.update_traces(line=dict(dash="dash"), name="JPL")
    fig1.update_traces(hovertemplate="ra=%{" + textRA_JPL + ":.3f}<br>dec=%{y:.3f}")
    fig1["data"][0]["showlegend"] = True

    xDataDES = "ra"
    textRA_DES = (
        "<b>ra</b>=%{x:.3f}<br>"
        + "<b>dec</b>=%{y:.3f}<br>"
        + "<b>date</b>=%{customdata[0]}<br>"
        + "<b>offset_ra</b>=%{customdata[1]:.3f}<br>"
        + "<b>offset_dec</b>=%{customdata[2]:.3f}"
    )
    if "correction_ra" in dfObs:
        xDataDES = "correction_ra"
        textRA_DES = (
            "<b>ra</b>=%{customdata[0]:.3f}<br>"
            + "<b>dec</b>=%{y:.3f}<br>"
            + "<b>date</b>=%{customdata[1]}<br>"
            + "<b>offset_ra</b>=%{customdata[2]:.3f}<br>"
            + "<b>offset_dec</b>=%{customdata[3]:.3f}"
        )

    fig2 = px.scatter(
        dfObs,
        x=xDataDES,
        y="dec",
        color_discrete_sequence=["red"],
        hover_data=["ra", "dec", "date_obs", "offset_ra", "offset_dec"],
    )
    fig2.update_traces(
        marker=dict(size=20, symbol="square-open-dot"),
        name="DES",
        hovertemplate=textRA_DES,
    )
    fig2["data"][0]["showlegend"] = True

    fig = go.Figure(data=fig1.data + fig2.data)

    fig.update_layout(
        autosize=False,
        width=width,
        height=height,
        font=dict(size=20),
        title=dict(text="DES observations for " + name, x=0.5),
        xaxis=dict(
            title_text="RA (deg)",
            showline=True,
            linecolor="black",
            showgrid=True,
            gridcolor="LightGray",
            mirror=True,
            ticks="outside",
            tickmode="array",
        ),
        yaxis=dict(
            title_text="Dec (deg)",
            showline=True,
            linecolor="black",
            showgrid=True,
            gridcolor="LightGray",
            mirror=True,
            ticks="outside",
        ),
        margin=dict(l=50, r=50, b=50, t=50, pad=4),
        plot_bgcolor="LightSteelBlue",
        paper_bgcolor="LightGray",
    )

    if "correction_ra" in df_jpl:
        # Important part to recover infor from the figure
        full_fig = fig.full_figure_for_development(
            warn=False
        )  # recover data from figure
        range_vl = full_fig.layout.xaxis.range  # get range of x axis
        distance_tick = full_fig.layout.xaxis.dtick  # get distance between ticks

        # calculate number of ticks of your figure
        number_ticks = int((range_vl[1] - range_vl[0]) / distance_tick) + 1

        # generate your ticks values and text
        tick_vals = [
            int(range_vl[0]) + distance_tick * num for num in range(number_ticks)
        ]
        tick_text = [val - 360 if val > 360 else val for val in tick_vals]

        fig.update_layout(xaxis=dict(tickvals=tick_vals, ticktext=tick_text))

    plot_filename = f"plot_des_observations_{name}-%s-%s.{format}" % (
        date_start.strftime("%Y-%m-%d"),
        date_end.strftime("%Y-%m-%d"),
    )
    plot_filepath = Path(settings.DATA_TMP_DIR).joinpath(plot_filename)
    plot_url = posixpath.join(settings.DATA_TMP_URL, plot_filename)

    if format == "html":
        fig.write_html(plot_filepath)
    else:
        fig.write_image(plot_filepath)

    if plot_filepath.exists():
        return plot_url
    else:
        raise Exception("It was not possible to create the plot.")
