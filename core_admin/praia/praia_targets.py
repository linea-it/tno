import csv

class PraiaTargets():

    def __init__(self):

        self.praia_target_headers = list([
            { "name": "ra","start":0, "end": 15 },
            { "name": "dec","start":15, "end": 31 },
            { "name": "magnitude","start":31, "end": 39 },
            { "name": "julian_date","start":39, "end": 57 },
            { "name": "site","start":57, "end": 62 },
            { "name": "catalog_code","start":62, "end": 66 },
            { "name": "object","start":66, "end": 86 }])


    def read_targets_file(self, filepath=None):
        print("Read Targets File")
        print("Filepath: %s" % filepath)

        cols = self.praia_target_headers
        
        rows = list()

        with open(filepath) as fp:  
            line = fp.readline()
            while line:
                line = fp.readline()
                record = dict({})

                for col in cols:
                    value = line[col['start']:col['end']]

                    record.update({
                        col['name']: value.strip(' ').strip('/n')
                    })
                   
                if record['ra'] and record['dec']:
                    rows.append(record)

        return rows

    def convert_targets_file_to_csv(self, input_file=None, output_file=None ):
        print("Read Targets File")
        print("Input File: %s" % input_file)
        print("Output File: %s" % output_file)

        cols = self.praia_target_headers
        fieldnames = list()
        for col in cols:
            fieldnames.append(col['name'])


        with open(input_file) as fp:  

            with open(output_file, 'w') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()

                line = fp.readline()

                while line:
                    line = fp.readline()
                    record = dict({})

                    for col in cols:
                        value = line[col['start']:col['end']]

                        record.update({
                            col['name']: value.strip(' ').strip('/n')
                        })
                        
                    if record['ra']:
                        writer.writerow(record)

        return output_file



# rows = PraiaTargets().read_targets_file("targets")
# rows = PraiaTargets().convert_targets_file_to_csv("targets", "targets.csv")

# print(rows)