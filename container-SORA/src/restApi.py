import os
import bottle

_allow_origin = '*'
_allow_methods = 'PUT, GET, POST, DELETE, OPTIONS'
_allow_headers = 'Authorization, Origin, Accept, Content-Type, X-Requested-With'

@bottle.hook('after_request')
def enable_cors():
    '''Add headers to enable CORS'''

    bottle.response.headers['Access-Control-Allow-Origin'] = _allow_origin
    bottle.response.headers['Access-Control-Allow-Methods'] = _allow_methods
    bottle.response.headers['Access-Control-Allow-Headers'] = _allow_headers

@bottle.route('/', method = 'OPTIONS')
@bottle.route('/<path:path>', method = 'OPTIONS')
def options_handler(path = None):
    return

class RespApi:
    def __init__(self, host=None, port=None, cachePath=None):
        self.__host = host if host is not None else os.getenv('HOST', '0.0.0.0')
        self.__port = port if port is not None else os.getenv('PORT', 8000)
        self.__cachePath = cachePath if cachePath is not None else os.getenv('CACHE_PATH', '~/output')
        self.__doProcessReponse = None
        
    def setProcessReponse(self,value):
        self.__doProcessReponse = value
        
    def start(self):
        self.__bottle = bottle.Bottle()
        self.__bottle.get("/oi")(self.oi)
        self.__bottle.post("/map")(self.postimage)
        self.__bottle.get("/map")(self.getimage)
        bottle.run(server=bottle.PasteServer,app=self.__bottle, host=self.__host, port=self.__port)
        
    def stop(self):
        bottle.stop()
    
    def __clearName(self, name):
        name = "".join(x for x in name if x.isalnum() or x==' ' or x=='-' or x=='_')
        name = name.replace(' ', '_')
        return name

    
    def postimage(self):
        bodyHttp = bottle.request.json
        if self.__doProcessReponse:
            content = self.__doProcessReponse(bodyHttp, self.__cachePath)
            bottle.response.content_type = 'image/png; charset=latin9'
            #response = bottle.send_file(content, mimetype='image/png', as_attachment=True, attachment_filename='myfile.png')
            return content
        else:
            bottle.abort(404, "Sorry, not available.") 

    def getimage(self):
        params = bottle.request.params
        outputFile = ''
        if self.__doProcessReponse:
            if 'body' in params:
                body = params['body']
                strDate = params['date']
                strTime = params['time']
                fileName = self.__clearName(body+" "+strDate.replace("-","")+" "+strTime.replace(":",""))
                outputFile = os.path.join(self.__cachePath,fileName+".jpg")
            else:
                body = params['name']
                time = params['time']
                v = time.split("T")
                strDate = v[0]
                if '.' in v[1]:
                    v[1] = v[1].split('.')[0]
                strTime = v[1]
                fileName = self.__clearName(body+" "+strDate.replace("-","")+" "+strTime.replace(":",""))
                outputFile = os.path.join(self.__cachePath,fileName+".jpg")
            if os.path.exists(outputFile):
                with open(outputFile,"rb") as f:
                    content = f.read()
                    bottle.response.content_type = 'image/png; charset=latin9'
                    return content
        bottle.abort(404, "Sorry, not available.") 
        
    def oi(self):
        return 'oi'


