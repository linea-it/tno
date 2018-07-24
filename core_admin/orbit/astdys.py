class AstDys():
    def getObjectURL(self, name):

        temp_name = name.replace(' ', '+')
        url_object = 'http://hamilton.dm.unipi.it/astdys2/index.php?pc=1.1.0&n=' + temp_name

        return url_object

    def getOrbitalParametersURL(self, name, number):
        return self.getFileURL(name, number, "epoch", ".eq0")

    def getObservationsURL(self, name, number):
        print("NAME: %s NUMBER: %s", (name, number))
        return self.getFileURL(name, number, "mpcobs", ".rwo")

    def getFileURL(self, name, number, key, ext):
        base_url = "http://hamilton.dm.unipi.it/~astdys2/%s/" % key

        if number != "-" and number is not None:
            link2 = "numbered/" + str(int((int(number) / 1000))) + "/" + number + ext
        else:
            temp_name = name.replace(' ', '')
            try:
                year = int(temp_name[:4])
            except ValueError:
                msg = "some error happened with the object: %s" % name
                raise Exception(msg)

            if year >= 1998:
                link2 = "unumbered/" + temp_name[:5] + "/" + temp_name + ext
            elif year > 1980 and year < 1998:
                link2 = "unumbered/" + temp_name[:4] + "/" + temp_name + ext
            elif year >= 1920 and year <= 1980:
                link2 = "unumbered/" + temp_name[:3] + "0" + "/" + temp_name + ext

        url = base_url + link2

        return url

    def getObitalParametersFilename(self, name, number):
        return self.getFilename(name, number, '.eq0')

    def getObservationsFilename(self, name, number):
        return self.getFilename(name, number, '.rwo')

    def getFilename(self, name, number, ext):

        filename = name.replace(" ", "") + ext

        if number != "-" and number is not None:
            filename = number + ext

        return filename
