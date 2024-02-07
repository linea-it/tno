import pandas as pd


def csv_to_dataframe(filepath, delimiter=";", header=True, page=1, pageSize=100):

    skiprows = None

    if page == 1 and header is True:
        skiprows = 1
    else:
        skiprows = (page * pageSize) - pageSize

    df_temp = pd.read_csv(filepath, delimiter=delimiter)

    columns = []
    if header is True:
        for col in df_temp.columns:
            columns.append(col)

    count = df_temp.shape[0]
    del df_temp

    # Ler o arquivo.
    df = pd.read_csv(
        filepath, names=columns, delimiter=delimiter, skiprows=skiprows, nrows=pageSize
    )

    df = df.fillna(0)

    rows = []
    for record in df.itertuples():
        row = dict({})

        for header in columns:
            row[header] = getattr(record, header)

        rows.append(row)

    return rows, count
