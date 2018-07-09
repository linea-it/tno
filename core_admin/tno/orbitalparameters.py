from datetime import datetime
import csv
import os
class Download():
    def download_file_from_url(self, url, output_path, filename, overwrite=True, ignore_errors=False):
        """
        Esta funcao faz o download de um arquivo
        :param url: url completa de qual arquivo deve ser baixado
        :param dir: path completo onde o arquivo devera se salvo
        :param filename: nome do arquivo apos baixado
        :return: file_path: file path completo do arquivo salvo
        """
        import requests
        import shutil
        import os

        print("Downloading %s " % filename)

        print("From: %s" % url)

        file_path = os.path.join(output_path, filename)

        start = datetime.now()

        # Se a sobreescreita estiver ativa tenta apagar o arquivo
        if overwrite:
            if os.path.isfile(file_path):
                try:
                    os.remove(file_path)
                except OSError as e:
                    print("Failed to remove an existing file")
                    print(e)
                    if ignore_errors:
                        return None, None
                    else:
                        raise e

        if not os.path.exists(file_path):

            try:
                r = requests.get(url, stream=True, verify=False)
                if r.status_code == 200:
                    with open(file_path, 'wb') as f:
                        r.raw.decode_content = True
                        shutil.copyfileobj(r.raw, f)
            except Exception as e:
                print("Failed to download.")
                print(e)
                if ignore_errors:
                    return None, None
                else:
                    raise e

            try:

                finish = datetime.now()

                size = os.path.getsize(file_path)

                tdelta = finish - start
                seconds = tdelta.total_seconds()

                print("File: %s" % file_path)
                print("Downloading Done! File: %s Size: %s bytes Time %s seconds" % (filename, size, seconds))

                download_stats = dict({
                    "start_time": start,
                    "finish_time": finish,
                    "download_time": seconds,
                    "file_size": size,
                    "filename": filename,
                    "file_path": file_path,
                    "path": output_path
                })

                return file_path, download_stats
            except OSError as e:
                msg = "File %s was not downloaded" % file_path
                print(msg)
                if ignore_errors:
                    return None, None
                else:
                    raise Exception(msg)

        else:
            msg = "File %s already exists" % file_path
            print(msg)
            if ignore_errors:
                return None, None
            else:
                raise Exception(msg)


class AstDys():
    def getObjectURL(self, name):
        print("getObjectURL(%s)" % name)

        temp_name = name.replace(' ', '+')
        url_object = 'http://hamilton.dm.unipi.it/astdys2/index.php?pc=1.1.0&n=' + temp_name

        print("URL Object: %s" % url_object)

        return url_object

    def getOrbitalParametersURL(self, number, name):
        print("getOrbitalParametersURL(%s, %s)" % (number, name))

        key = "epoch"
        ext = ".eq0"

        base_url = "http://hamilton.dm.unipi.it/~astdys2/%s/" % key

        filename = name.replace(" ", "") + ext

        if number != "-" and number is not None:
            link2 = "numbered/" + str(int((int(number) / 1000))) + "/" + number + ext
            filename = number + ext
        else:
            temp_name = name.replace(' ', '')
            try:
                year = int(temp_name[:4])
            except ValueError:
                msg = "some error happened with the object: %s" % name
                print(msg)
                raise Exception(msg)

            if year >= 1998:
                link2 = "unumbered/" + temp_name[:5] + "/" + temp_name + ext
            elif year > 1980 and year < 1998:
                link2 = "unumbered/" + temp_name[:4] + "/" + temp_name + ext
            elif year >= 1920 and year <= 1980:
                link2 = "unumbered/" + temp_name[:3] + "0" + "/" + temp_name + ext

        url = base_url + link2
        print("Orbital Parameters URL: %s" % url)
        print("Filename: %s" % filename)

        return url, filename


#Structure with two parameters (name, value)
class Couple:
    def __init__(self, name, value):
        self.name = name
        self.value = value

    def __repr__(self):
        return "".join([str(self.name).ljust(14), " : ", str(self.value)])

class MPC():
    def getObjectURL(self, name):
        print("getObjectURL(%s)" % name)

        temp_name = name.replace(' ', '+')
        url_object = link = 'https://minorplanetcenter.net/db_search/show_object?object_id=' + temp_name

        print("URL Object: %s" % url_object)

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
        import requests
        import os
        from bs4 import BeautifulSoup

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
                # print item
                if item.name != "designation":
                    out_file.write(str(item.value) + '\n')
            out_file.close()

            finish = datetime.now()
            size = os.path.getsize(file)

            tdelta = finish - start
            seconds = tdelta.total_seconds()
            download_stats = dict({
                "start_time": start,
                "finish_time": finish,
                "download_time": seconds,
                "file_size": size,
                "filename": filename,
                "file_path": file,
                "path": output_path
            })

        return download_stats




class GetOrbitalParameters():
    def test(self, limit):
        from random import randint
        return randint(1, limit)

    def getOrbitalParameters(self, number, name, output_path):
        """
            Function to manage the download the file with orbital parameters
        principal source: AstDyS, second alternative source: MPC
        :param number:
        :param name:
        :param output_path:
        :return:
        """

        t0 = datetime.now()

        source = "AstDys"
        # AstDyS Object URL
        url_object = AstDys().getObjectURL(name)

        # AstDys Orbital Parameters URL
        url, filename = AstDys().getOrbitalParametersURL(number, name)

        # Try to download the AstDyS files.
        file_path, download_stats = Download().download_file_from_url(url, output_path=output_path, filename=filename,
                                                                      overwrite=True, ignore_errors=True)
        t1 = datetime.now()

        result = dict({
            "name": name
        })

        # Checking if the object exists in AstDyS if it does not exist it tries to look in the MPC.
        if file_path:
            result = dict({
                "name": name,
                "source": source,
                "filename": filename,
                "download_start_time": t0,
                "download_finish_time": t1,
                "file_size": download_stats.get("file_size"),
                "external_url": url_object,
                "download_url": url
            })

        else:
            print("Object not found in AstDys trying on MPC")
            source = "MPC"

            # MPC Object URL
            url_object = MPC().getObjectURL(name)

            # MPC Orbital Parameters URL
            download_stats = MPC().getOrbitalParametersURL(number, name, output_path)

            if download_stats:
                result = dict({
                    "name": name,
                    "source": source,
                    "filename": download_stats.get("filename"),
                    "download_start_time": download_stats.get("start_time"),
                    "download_finish_time": download_stats.get("finish"),
                    "file_size": download_stats.get("file_size"),
                    "external_url": url_object,
                    "download_url": None
                })


        return result


# ---------------------------------------------------------------------------
import parsl
from parsl import *

AVAILABLE_THREADS = 6

local_config = {
    "sites": [
        {"site": "Threads",
         "auth": {"channel": None},
         "execution": {
             "executor": "threads",
             "provider": None,
             # "maxThreads" : int(os.environ.get('AVAILABLE_THREADS', 2))
             "maxThreads": AVAILABLE_THREADS
         }
         }],
    "globals": {"lazyErrors": True}
}

dfk = DataFlowKernel(config=local_config)

parsl.set_file_logger('parsl.log')

output_path = "/home/glauber/tno/archive/teste"


# App that generates a random number
@App('python', dfk)
def generate(number, name):
    result = GetOrbitalParameters().getOrbitalParameters(number, name, output_path)
    return result



# list_inputs = [('17420', '1988 RL13'), ('-', '1999 CF119')]
# list_inputs = [('17420', '1988 RL13')] # Exemplo AstDys
# list_inputs = [('-', '1999 RC216')]  # Exemplo MPC
# list_inputs = [('-', '2016 WM48')] # Exemplo objeto que nao tem AstDys e MPC

list_inputs = [('17420', '1988 RL13'), ('-', '1999 RC216'), ('-', '2016 WM48')] # AstDys, Mpc, Nenhum
results = []
for number, name in list_inputs:
    results.append(generate(number, name))

# Wait for all apps to finish and collect the results
outputs = [i.result() for i in results]

# Print results
print(outputs)

# Guardar os resultados no csv
header_orb_param = ["name", "source", "filename", "download_start_time", "download_finish_time", "file_size", "external_url", "download_url"]
orbital_parameter_csv = os.path.join(output_path, 'orbital_parameters.csv')
with open(orbital_parameter_csv, 'w') as csvfile:
    fieldnames = header_orb_param
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';')

    writer.writeheader()
    writer.writerows(outputs)
