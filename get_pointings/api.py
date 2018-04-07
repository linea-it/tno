# -*- coding: UTF-8 -*-
from flask import Flask, json, request, jsonify

app = Flask(__name__)


@app.route("/")
def hello():

    result = {
        "message": "Hello, Welcome to TNO getPointings"
    }

    return app.response_class(
        response=json.dumps(result),
        status=200,
        mimetype='application/json'
    )


@app.route("/test_ncsa_db")
def test_ncsa_db():
    from sqlalchemy import create_engine

    try:

        str_con = (
            "oracle://%(username)s:%(password)s@(DESCRIPTION=(" +
            "ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=%(host)s)(" +
            "PORT=%(port)s)))(CONNECT_DATA=(SERVER=dedicated)(" +
            "SERVICE_NAME=%(database)s)))"
        ) % {
            'username': '',
            'password': '',
            'host': '',
            'port': '',
            'database': ''
        }

        engine = create_engine(str_con)


        with engine.connect() as con:

            return app.response_class(
                response=json.dumps({
                    "message": "NCSA Database Ok"
                }),
                status=200,
                mimetype='application/json'
            )
    except Exception as e:
        # TODO logging this error
        return app.response_class(
            status=500,
            mimetype='application/json'
        )



if __name__ == "__main__":
    app.debug = True
    app.run()
