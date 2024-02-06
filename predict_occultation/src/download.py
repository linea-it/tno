import os
import requests
import shutil
from datetime import datetime
import functools
import tqdm

class Download():

    def download_file_from_url(self, url, output_path, filename, overwrite=True, ignore_errors=False, timeout=30, auth=None):
        """
        Esta funcao faz o download de um arquivo
        :param url: url completa de qual arquivo deve ser baixado
        :param dir: path completo onde o arquivo devera se salvo
        :param filename: nome do arquivo apos baixado
        :param auth: Tupla (username, password)
        :return: file_path: file path completo do arquivo salvo
        """

        file_path = os.path.join(output_path, filename)

        start = datetime.now()

        # Se a sobreescreita estiver ativa tenta apagar o arquivo
        if overwrite:
            self.remove_file(file_path)

        if not os.path.exists(file_path):
            try:
                requests.packages.urllib3.disable_warnings()
                # Resolve problema de SSL precisa da lib pyopenssl.
                requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += ':RC4-SHA'
                requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS += ':HIGH:!DH:!aNULL'
                try:
                    requests.packages.urllib3.contrib.pyopenssl.DEFAULT_SSL_CIPHER_LIST += ':RC4-SHA'
                    requests.packages.urllib3.contrib.pyopenssl.DEFAULT_SSL_CIPHER_LIST += ':HIGH:!DH:!aNULL'
                except AttributeError:
                    # no pyopenssl support used / needed / available
                    pass

                r = requests.get(url, stream=True, verify=False,
                                 timeout=timeout, auth=auth)
                if r.status_code == 200:
                    # with open(file_path, 'wb') as f:
                    #     r.raw.decode_content = True
                    #     shutil.copyfileobj(r.raw, f)

                    file_size = int(r.headers.get('Content-Length', 0))
                    desc = "(Unknown total file size)" if file_size == 0 else ""
                    r.raw.read = functools.partial(r.raw.read, decode_content=True)
                    with tqdm.tqdm.wrapattr(r.raw, "read", total=file_size, desc=desc) as r_raw:
                        with open(file_path, 'wb') as f:
                            shutil.copyfileobj(r_raw, f)


            except Exception as e:
                if ignore_errors:
                    return None, None
                else:
                    raise e

            try:

                finish = datetime.now()

                size = os.path.getsize(file_path)

                tdelta = finish - start
                seconds = tdelta.total_seconds()

                # print("Downloading Done! File: %s Size: %s bytes Time %s seconds" % (filename, size, seconds))

                download_stats = dict({
                    "start_time": start.isoformat(),
                    "finish_time": finish.isoformat(),
                    "download_time": seconds,
                    "file_size": size,
                    "filename": filename,
                    "file_path": file_path,
                    "path": output_path
                })

                return file_path, download_stats
            except OSError as e:
                msg = "File %s was not downloaded" % file_path
                # print(msg)
                if ignore_errors:
                    return None, None
                else:
                    raise Exception(msg)

        else:
            msg = "File %s already exists" % file_path
            # print(msg)
            if ignore_errors:
                return None, None
            else:
                raise Exception(msg)

    def remove_file(self, file_path):
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except OSError as e:
                raise Exception(f"Failed to remove an existing file. {e}")        