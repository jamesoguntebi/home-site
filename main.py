import jinja2
import os
import webapp2

jinja_current_directory = jinja2.Environment(
    loader = jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions = ['jinja2.ext.autoescape'],
    autoescape = False)


def sendTemplate(request_handler, file_name, template_dict = {}):
    """Uses jinja to send a template response.

    Args:
        requestHandler: A RequestHandler to use to respond.
        fileName: Assumed to be a template at /templates/<file_name>.html.
        templateData: Dictionary to pass to the template.
    """
    template = jinja_current_directory.get_template('templates/%s.html' % file_name)
    request_handler.response.write(template.render(template_dict))


class MainHandler(webapp2.RequestHandler):
    def get(self):
        sendTemplate(self, 'home')


app = webapp2.WSGIApplication([
    ('/', MainHandler),
], debug=True)
