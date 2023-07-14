from logging import debug
import os
from re import I

from flask import Flask, redirect, request, session,sessions, url_for
from flask.templating import render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
from time import localtime, strftime
from collections import deque

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or 'secreto'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

socketio = SocketIO(app, cors_allowed_origins='*')

Channels = ['General']
lista_mensaje = dict()
lista_mensaje['General'] = deque(maxlen=100)

@app.route("/")
def index():
    if request.method == 'GET':
        # Validar al usuario si tiene una session abierta
        if ('Username' in session):
            return render_template("index.html", Channels = Channels)
        else:
            return render_template('login.html')

@app.route("/login", methods=["GET", "POST"])
def login():

    session.clear()
    # Inicio de session del usuario
    if request.method == 'POST':
        
        username = request.form["Username"].strip()
        #if ('Username' in session):
         #   return redirect('/login')
        #Users.append(username)
        session['Username'] = username
        return redirect("/")

    return render_template('login.html')

@app.route("/logout")
def logout():
    # Limpia session y retornamos a la pagina login
    session.clear()
    return redirect("/login")

@socketio.on('message')
def handleMessage(msg):
    global lista_mensaje
    datos = {'msgs': msg['mensaje'], 'user': msg['usuario'], 'tiempo': strftime('%I:%M',localtime())}
    channel = msg['canal']

    #Enviamos mensaje con socket
    print('PRUEBA DE CANALES: ', msg['canal'])
    if lista_mensaje.get(channel) is None:
        lista_mensaje[channel] = deque(maxlen=100)
    lista_mensaje[channel].append(datos)
    print("message", lista_mensaje[channel], channel)
    # Enviar Datos
    emit('messages', datos, room=channel)

# Creacion de nuevos canales
@socketio.on('N_Channels')
def Channel(Canales):
    # Global Channels
    global Channels
    print('CANALESSSSSSSSSSSSSS', Canales['canal'])
    if Canales['canal'] in Channels:
        emit('New_Canal', {'codigo': 'existe', 'user': Canales['usuario']}, broadcast=True)
    else:
        Channels.append(Canales['canal'])
        print(Channels)
        join_room(Canales['canal'])
        emit('New_Canal', {'Canal':Canales['canal']}, broadcast=True)
        
# Unirse al Canal
@socketio.on('join')
def on_join(msg):
    room = msg['canal']
    print('has entered the room.', room)
    join_room(room)
    emit('entrar', {'DS': msg['usuario'] + ' has entered the room.'}, room=room)

# Salir del Canal
@socketio.on('leave')
def on_leave(msg):
    room = msg['canal']
    print('has leave the room.', room)
    leave_room(room)
    emit('salir', {'DS1': msg['usuario'] + ' has leave the room.'}, room=room)

@socketio.on('lista_M')
def lista(msg):
    emit('lista',{'lista_m':list(lista_mensaje[msg['canal']])}, room=msg['canal'])
import base64

@socketio.on('enviarFoto')
def enviar_foto(data):
    image_data = data['imageData']
    file_name = data['fileName']
    image_url = f"ruta/donde/guardar/{file_name}"
    socketio.emit('fotoEnviada', {'imageURL': image_url}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)

