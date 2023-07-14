document.addEventListener('DOMContentLoaded', () => {

    // Conexion a websocket
    const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', function() {
        console.log('Hola World');
        socket.emit('serverMessage',{data: 'Im Connected!'});
        });
      
    document.querySelector('#Saves-User').onsubmit = () => {
        var user = document.querySelector("#Username").value;
        localStorage.setItem('Usuario', user);
        console.log(user)
    };
});