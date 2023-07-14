
// Conexion a websocket
let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
var name = localStorage.getItem('Usuario');
let canales = localStorage.getItem('Canal');

function limpiarLocalStorage() {
    localStorage.clear();
}

document.addEventListener('DOMContentLoaded', () => {

    // Codigo para enviar mensaje mendiante el teclado ENTER
    document.querySelector('#Mensaje').addEventListener("keydown", event => {
        if (event.key == "Enter") {
            document.getElementById('enviar').click();
        }
    });
    // Boton para enviar el mensaje
    $('#enviar').on('click', function () {
        let mensaje = document.querySelector('#Mensaje').value;
        let mensaje2 = mensaje.trim()
        if (mensaje2 == "") {
            alert("Ingrese texto en el campo de mensaje")
        } else {
            socket.emit('message', { 'usuario': name, 'mensaje': mensaje, 'canal': localStorage.getItem('Canal') });
            document.getElementById("Mensaje").value = "";
        }

    });

    // Mensaje a mostrar en la pagina
    socket.on('messages', function (msg) {
        if (msg.user == name) {
            $('#BoxMessage1').append('<li><div class="messageBox" style="--user-color: #234A65"><span class="meta"><span class="badges"></span><span class="name">' + msg.user + ' ' + msg.tiempo + '</span><i class="metaBG"></i></span><span class="message" id="texto-msj">' + msg.msgs + '</span></div></li>' + '<br><br>');
        } else {
            $('#BoxMessage1').append('<li><div class="messageBox" style="--user-color: #F4A651"><span class="meta"><span class="badges"></span><span class="name">' + msg.user + ' ' + msg.tiempo + '</span><i class="metaBG"></i></span><span class="message" id="texto-msj">' + msg.msgs + '</span></div></li>' + '<br><br>');
        }
    });

    // Validar si el canal ya se encuentra creado
    document.querySelector('#Channel_NEW').onclick = () => {

        let canales_new = document.querySelector('#new_channels').value;
        let canales_new2 = canales_new.trim()

        if (canales === canales_new2) {
            alert('Este Canal es incorrecto')
            console.log('error:')
        }
        else {
            localStorage.setItem('Canal', canales_new2);
            socket.emit('N_Channels', { 'canal': canales_new2, 'usuario': name });
            console.log('Canal creado:')
            $('#exampleModal').modal('hide')
        }
    }
    socket.on('New_Canal', function (data) {
        if (data.codigo === 'existe') {
            alert("Este canal ya existe");
        }
        else {
            $('#listaCanal').append(`<a onclick="selectCanal('` + data.Canal + `');" class="nav-link active selectCanal" >` + data.Canal + `</a><hr class="my-1">`);
        }
        console.log("BUENA BUENA")
    });
    socket.on('entrar', function (data) {
        console.log(data.DS);
        socket.emit('lista_M', { 'canal': localStorage.getItem('Canal') });
    });
    socket.on('salir', function (data) {
        console.log(data.DS1);
    });
    socket.on('lista', function (data) {
        let room = document.querySelector('#Room');
        room.value = "";
        room.innerHTML = `Room: ${localStorage.getItem('Canal')}`;
        document.querySelector('#BoxMessage1').innerHTML = '';
        data.lista_m.forEach(element => {
            if (element.user == name) {
                $('#BoxMessage1').append('<li><div class="messageBox" style="--user-color: #234A65"><span class="meta"><span class="badges"></span><span class="name">' + element.user + ' ' + element.tiempo + '</span><i class="metaBG"></i></span><span class="message" id="texto-msj">' + element.msgs + '</span></div></li>' + '<br><br>');
            } else {
                $('#BoxMessage1').append('<li><div class="messageBox" style="--user-color: #F4A651"><span class="meta"><span class="badges"></span><span class="name">' + element.user + ' ' + element.tiempo + '</span><i class="metaBG"></i></span><span class="message"id="texto-msj">' + element.msgs + '</span></div></li>' + '<br><br>');
            }

        });
    });
});
// Funcion para unirse o salir de los canales creados
function selectCanal(data) {
    if (data == localStorage.getItem('Canal')) {
        console.log('Ya entre a la room:')
    } else {
        if (localStorage.getItem('Canal') != null) {
            // Limpiamos los mensaje creado en el canal
            document.querySelector('#BoxMessage1').innerHTML = '';
            socket.emit('leave', { 'usuario': name, 'canal': localStorage.getItem('Canal') });
        }
        socket.emit('join', { 'usuario': name, 'canal': data });
        localStorage.setItem('Canal', data);
    }
    let room = document.querySelector('#Room');
    room.value = "";
    room.innerHTML = `Room: ${data}`;
}
// Validacion para el usuario para unirse al canal predeterminado o al ultimo canal entrado
if (!localStorage.getItem('Canal')) {
    localStorage.setItem('Canal', 'General');
    socket.emit('join', { 'usuario': name, 'canal': localStorage.getItem('Canal') })
} else {
    socket.emit('join', { 'usuario': name, 'canal': localStorage.getItem('Canal') })
}
// TOQUE PERSONAL Button de emoji
window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#emoji-button');
    const picker = new EmojiButton();
    picker.on('emoji', emoji => {
        document.querySelector('#Mensaje').value += emoji;
    });
    button.addEventListener('click', () => {
        picker.pickerVisible ? picker.hidePicker() : picker.showPicker(button);
    });
});

  