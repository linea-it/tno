import json
import os

class JsonFile():

    def write(self, obj, json_file):
        with open(json_file, 'w') as steps_file:
            json.dump(obj, steps_file)

    def read(self, json_file):
        obj = None
        with open(json_file, 'r') as json_file:
            obj = json.load(json_file)

        return obj