import os
import threading
import time


class WorkAssyncFile:
    def __init__(self, input_path=None, output_path=None):
        self.__input_path = (
            input_path if input_path is not None else os.getenv("INPUT_PATH", "~/input")
        )
        self.__output_path = (
            output_path
            if output_path is not None
            else os.getenv("OUTPUT_PATH", "~/output")
        )
        self.__running = False
        self.__thread = None
        self.__doProcessFile = None
        self.__removeAfterProcess = True

        if not os.path.exists(self.__input_path):
            os.makedirs(self.__input_path)
        if not os.path.exists(self.__output_path):
            os.makedirs(self.__output_path)

    def setRemoverAfterProcess(self, value):
        self.__removeAfterProcess = value

    def getRemoverAfterProcess(self):
        return self.__removeAfterProcess

    def setProcessFile(self, value):
        self.__doProcessFile = value

    def __nextFile(self):
        files = os.listdir(self.__input_path)
        files = list(filter(lambda n: n.endswith(".json"), files))
        files = sorted(
            files, key=lambda n: os.path.getmtime(os.path.join(self.__input_path, n))
        )
        return files[0] if len(files) > 0 else None

    def __execute(self, fileName):
        if self.__doProcessFile != None:
            self.__doProcessFile(self.__input_path, self.__output_path, fileName)
            if self.__removeAfterProcess:
                os.remove(os.path.join(self.__input_path, fileName))

    def __loop(self):
        self.__running = True
        while self.__running:
            fileName = self.__nextFile()
            while fileName != None:
                print(f"filename:{fileName}")
                self.__execute(fileName)
                fileName = self.__nextFile()
            time.sleep(5)

    def start(self):
        if self.__thread is None:
            self.__thread = threading.Thread(target=self.__loop)
            self.__thread.start()

    def stop(self):
        if not self.__thread is None:
            self.__running = False
            self.__thread.join()

    def isRunning(self):
        return self.__running
