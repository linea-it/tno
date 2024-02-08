import csv
import os
from datetime import datetime
from urllib.request import urlopen
from xml.etree.ElementTree import ElementTree

from django.conf import settings
from lxml import html


class JhonstonArchive:
    def parse_float(self, value):
        try:
            return float(value)
        except:
            return None

    def split_name(self, value):
        if value != "":

            str_number = value[0:9].strip()
            name = value[10:28].strip()

            if str_number != "" and str_number != "*":
                number = str_number.replace("(", "").replace(")", "")
                number.strip()
                number = int(number)
            else:
                number = None

            return number, name
        else:
            return None, None

    def split_discovery(self, value):
        if value != "":
            a = value.split()
            year = a[0].strip()
            month = a[1].strip()

            return "%s-%s" % (year, month)
        else:
            return None

    def get_diameter(self, value):
        flag = False
        diameter = None

        if value != "":
            if value.find("?") != -1:
                flag = True

            diameter = float(value.strip().strip("?"))

        return diameter, flag

    def get_table_data(self):
        # Get Html Page
        html_page = html.fromstring(
            urlopen("http://www.johnstonsarchive.net/astro/tnoslist.html").read()
        )
        body = html_page.find("body")
        pre = body.find("pre")
        # Ascii table in string
        string_table = pre.text.split("\n")

        ignore_lines = [
            "objects which should be designated as planets",
            "objects with MPC designations:",
            "objects without MPC designations (selected):",
        ]

        # Find the first line of data just below the header
        line_index = [
            x
            for x in range(len(string_table))
            if string_table[x].startswith(
                "objects which should be designated as planets"
            )
        ]

        print("First data line: %s" % line_index[0])

        # Removing Headers
        del string_table[0 : line_index[0]]

        # Removes rows that are not records.
        for ignore in ignore_lines:
            line_index = [
                x
                for x in range(len(string_table))
                if string_table[x].startswith(ignore)
            ]

            idx = line_index[0]
            print("Remove line [ %s ] - %s" % (idx, string_table[idx]))
            del string_table[idx]

        rows = []
        for line in string_table:
            if line.strip() != "":
                # print(repr(line))

                number, name = self.split_name(line[0:28])
                diameter, diameter_flag = self.get_diameter(line[99:108].strip())

                row = dict(
                    {
                        "number": number,
                        "name": name,
                        "provisional_designation": line[29:43].strip(),
                        "dynamical_class": line[43:57].strip(),
                        "a": self.parse_float(line[57:65].strip()),
                        "e": self.parse_float(line[65:75].strip()),
                        "perihelion_distance": self.parse_float(line[75:84].strip()),
                        "aphelion_distance": self.parse_float(line[84:92].strip()),
                        "i": self.parse_float(line[92:99].strip()),
                        # "diameter": float(line[99:106].strip().strip('?')),
                        "diameter": diameter,
                        "diameter_flag": diameter_flag,
                        "albedo": self.parse_float(line[106:115].strip()),
                        "b_r_mag": self.parse_float(line[115:121].strip()),
                        "taxon": line[121:128].strip(),
                        "density": self.parse_float(line[128:134].strip()),
                        "known_components": line[134:164].strip(),
                        "discovery": self.split_discovery(line[164:171]),
                    }
                )

                rows.append(row)
        print("Rows: %s" % len(rows))

        return rows

    def write_csv(self, rows):

        filename = self.get_filename()

        with open(filename, "w") as csvfile:
            fieldnames = [
                "number",
                "name",
                "provisional_designation",
                "dynamical_class",
                "a",
                "e",
                "perihelion_distance",
                "aphelion_distance",
                "i",
                "diameter",
                "diameter_flag",
                "albedo",
                "b_r_mag",
                "taxon",
                "density",
                "known_components",
                "discovery",
            ]

            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=";")
            writer.writeheader()

            for row in rows:
                writer.writerow(row)

        return filename

    def get_filename(self):

        today = datetime.now()

        root_path = settings.JHONSTONS_ARCHIVE
        filename = os.path.join(
            root_path, "know_tnos_%s.csv" % today.strftime("%Y-%m-%d")
        )

        print("Filename: %s" % filename)
        return filename
