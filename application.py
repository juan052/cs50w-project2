import os

from flask import Flask,render_template
from flask_socketio import emit, join_room, leave_room, SocketIO


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app, cors_allowed_origins='*')
#socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')


@socketio.on("join_room")
def entrar(room):
    # Ingresamos al usuario a la room
    join_room(room)

    # Emitimos un aviso a los usuarios conectados a la room, exceptuando a la persona que se unio
    emit('mensaje', f'Un usuario ha entrado a la sala {room}', broadcast=False, include_self=False, to=room)

    # Mandamos una respuesta al evento emit del cliente
    return room


@socketio.on("message") 
def message(data):
  print(data)
  emit("message", data["message"],  broadcast=False, include_self=True, to=data["room"])
    