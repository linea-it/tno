from datetime import datetime
import requests
import os
from bs4 import BeautifulSoup


# Structure with two parameters (name, value)
class Couple:
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def __repr__(self):
        return "".join([str(self.name).ljust(14), " : ", str(self.value)])


class MPC():
    def getObjectURL(self, name):
        # print("getObjectURL(%s)" % name)

        temp_name = name.replace(' ', '+')
        url_object = link = 'https://minorplanetcenter.net/db_search/show_object?object_id=' + temp_name

        # print("URL Object: %s" % url_object)

        return url_object

    def getSubstring(self, char1, char2, string):
        """
            get substring between two characters
            return empty if substring does not exist
        :param char2:
        :param string:
        :return:
        """
        try:
            start = string.index(char1) + len(char1)
            end = string.index(char2, start)
            return string[start: end]
        except ValueError:
            return ""

    def getSpecificValue(self, soup, id_tofind):
        """
            Get specific values from site (to apply to MPC case)
        :param id_tofind:
        :return:
        """
        tag = soup.find(id=id_tofind)
        value = tag.get('value')
        if not value:
            value = "no"
        return value

    def getOrbitalParametersURL(self, number, name, output_path):
        """
            Get file with orbital parameters of one object through of MPC
        :param number:
        :param name:
        :param output_path:
        :return:
        """

        start = datetime.now()

        temp_name = name.replace(' ', '+')
        object_id = name.replace(' ', '')

        filename = name.replace(" ", "") + ".eq0"
        if number != "-" and number is not None:
            filename = number + ".eq0"

        link = 'https://minorplanetcenter.net/db_search/show_object?object_id=' + temp_name
        r = requests.get(link, stream=True)

        header = r.text

        # This text only apper when the object is not registered in MPC yet.
        substring = 'Unknown object'

        download_stats = None

        if substring not in header:
            soup = BeautifulSoup(header, 'html.parser')

            lista = [Couple("object id", object_id)]

            keys = ["number", "name", "designation", "epoch", "peri", "m", "node", "incl", "e", "a"]
            for key in keys:
                lista.append(Couple(key, self.getSpecificValue(soup, key)))

            # If object is numbered then objectID = number
            if lista[1].value != "no":
                lista[0].value = lista[1].value

            # Other way of search designation from MPC site (if it was not found previously)
            if lista[3].value == "no":
                line = str(soup.h3).replace('\n', '')
                desi = self.getSubstring("=", '</', line)
                lista[3].value = desi.strip()
            lista[3].value = lista[3].value.replace(" ", "_")

            table = soup.find_all('table')[0]
            rows = table.find_all('tr')[1:]
            for row in rows:
                cols = row.find_all('td')
                key = self.getSubstring('>', '</', str(cols[0]))
                value = self.getSubstring('>', '</', str(cols[1]))
                if key == 'epoch JD':
                    lista.insert(5, Couple(key, value))
                if key == 'absolute magnitude':
                    lista.append(Couple("Hmag", value))
                if key == 'phase slope':
                    lista.append(Couple("Gslop", value))

            file = os.path.join(output_path, filename)
            out_file = open(file, 'w')
            for item in lista:
                if item.name != "designation":
                    out_file.write(str(item.value) + '\n')
            out_file.close()

            finish = datetime.now()
            size = os.path.getsize(file)

            tdelta = finish - start
            seconds = tdelta.total_seconds()

            # Rename filename
            new_filename = name.replace(' ', '_') + '.eq0'
            new_file = os.path.join(output_path, new_filename)
            os.rename(file, new_file)

            download_stats = dict({
                "start_time": start,
                "finish_time": finish,
                "download_time": seconds,
                "file_size": size,
                "filename": new_filename,
                "file_path": new_file,
                "path": output_path
            })

        return download_stats

    def getObservationsFilename(self, name, number):
        filename = name.replace(" ", "") + ".rwo"

        if number != "-":
            filename = number + ".rwo"

        return filename

    def getObservationsURL(self, name, number):

        tmp_file = name.replace(" ", "_") + '.txt'

        # href = 'https://www.minorplanetcenter.net/tmp/' + tmp_file
        href = 'https://minorplanetcenter.net/tmp/' + tmp_file

        link = self.getObjectURL(name)

        try:
            r = requests.get(link, stream=True, verify=False, timeout=5)
            header = r.text

            # This text only apper when the object is not registered in MPC yet.
            substring = 'Unknown object'

            if substring not in header:
                return href
            else:
                return None
        except Exception as e:
            # TODO escrever  os erros em um LOG
            print(e)
            return None
