import csv


class DownloadParameters:
    def read_input(self, input_file):

        records = []
        with open(input_file) as csvfile:
            reader = csv.DictReader(csvfile, delimiter=";")
            for row in reader:

                if row.get("need_download") in ["True", "true", "1", "t", "y", "yes"]:
                    row["need_download"] = True

                    self.need_download += 1

                else:
                    row["need_download"] = False

                    self.not_need_download += 1

                records.append(row)

        return records

    def update_or_create_record(self, record):
        """
        Este Metodo deve ser sobrescrito

        Instancia um Django Model e executa o metodo update_or_create

        return obj, created
        """

        pass

    def register_downloaded_files(self, records):
        # Apos o Download e necessario o registro
        new = 0
        updated = 0
        downloaded = 0
        not_downloaded = 0

        for record in records:

            if record.get("filename"):
                downloaded += 1

                obj, created = self.update_or_create_record(record)

                if created:
                    new += 1
                    self.logger.debug("Registered [ %s ] " % record.get("name"))
                else:
                    updated += 1
                    self.logger.debug("Updated [ %s ] " % record.get("name"))
            else:
                not_downloaded += 1

        # TODO esta informacao tem que ficar dentro do metodo run
        self.logger.info(
            "Inputs [ %s ] Downloaded [ %s ] Registered [ %s ] Updated [ %s ] Not Downloaded [ %s ]"
            % (len(self.input_records), downloaded, new, updated, not_downloaded)
        )
