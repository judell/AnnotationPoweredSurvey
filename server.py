#!/usr/bin/env python2
import BaseHTTPServer
import SimpleHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

def run(server_class=BaseHTTPServer.HTTPServer,
        handler_class=CORSRequestHandler):
    server_address = ('', 8001)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

if __name__ == '__main__':
    run()