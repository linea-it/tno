# -*- coding: UTF-8 -*-
import os
from flask import Flask, json, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects import postgresql
from common.db import DBBase

app = Flask(__name__)
CORS(app)

# Retrieve Database conection string
try:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URI']
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
except Exception as e:
    raise Exception("The environment variable DATABASE_URI can not be null")

# Starting database connection
# USE SQLAlchemy to execute querys in database.
# Docs:
# http://docs.sqlalchemy.org/en/latest/
# http://docs.sqlalchemy.org/en/latest/dialects/postgresql.html
db = DBBase(app)


@app.route("/")
def hello():
    result = {
        "message": "Hello, Welcome to TNO Filter Objects Class"
    }

    return app.response_class(
        response=json.dumps(result),
        status=200,
        mimetype='application/json'
    )

@app.route("/get_objects")
def get_objects():
    """
    Params:
        - choose a table -> seleciona o tipo do objeto(DYNCLASS) (edited)
        - magnitude filtra o maximo da magnitude minima(VM) (edited)
        - Minumun difference between times - > diferença entre o primeiro e
            ultimo apontamento
        - Show Only Objects with More than one filter in the some night? ->
            objetos que em uma mesma noite possui imagem com mais de um filtro

    Exemplo de URL:
    http://0.0.0.0:7003/des_freq?obj_table=Centaur&magnitude=20&diference=100&more_than_one=true
    """
    from sci.FilterObjects import FilterObjects

    # Retrive Params
    objectTable = request.args.get('objectTable')

    magnitude = None
    if request.args.get('useMagnitude') and float(request.args.get('magnitude')) > 0:
        magnitude = float(request.args.get('magnitude'))

    diffDateNights = None
    if request.args.get('useDifferenceTime') and float(request.args.get('diffDateNights')) > 0:
        diffDateNights = float(request.args.get('diffDateNights'))

    moreFilter = request.args.get('moreFilter')


    rows, count = FilterObjects(app).get_objects(
                        objectTable, magnitude, diffDateNights, moreFilter)

    # {"data": [{"diff_date_nights": 70.0, "diff_nights": 7, "filters": null, "freq": 22, "mag_max": 20.3, "mag_min": 19.5, "name": "2002 TP36"}], "success": "true"}

    result = dict({
        "success": "true",
        "data": rows,
        "totalCount": count
    })

    return app.response_class(
        response=json.dumps(result),
        status=200,
        mimetype='application/json'
    )

@app.route("/object_by_name")
def object_by_name():
    from sci.FilterObjects import FilterObjects

    name = request.args.get('name')

    #name = "2002 TP36"

    rows, count = FilterObjects(app).objects_by_name(name)

    # {"data": [{"diff_date_nights": 70.0, "diff_nights": 7, "filters": null, "freq": 22, "mag_max": 20.3, "mag_min": 19.5, "name": "2002 TP36"}], "success": "true"}

    result = dict({
        "success": "true",
        "data": rows,
        "totalCount": count
    })

    return app.response_class(
        response=json.dumps(result),
        status=200,
        mimetype='application/json'
    )



if __name__ == "__main__":
    app.debug = True
    app.run()
