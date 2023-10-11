import json
from chatgpt import ChatGPT

model = ChatGPT()

def handle_request(request):
  if(request.method == 'POST':
     message = json.loads(request.data)['message']
     
     response = model.generate_response(message)
     
     return json.dumps({'response' : response})
   else:
     return 'Error: Invalid request method'
     
if _name_ == 'main':
  from flask import Flask, request
     
  app = Flask(_name_)
     
  def chat():
     return handle_request(request)
     
  app.run(port = 8000)
