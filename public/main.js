var socket = io.connect('https://localhost:3000', { 'forceNew': true });

socket.on('messagestest', function(data) {
  console.log(data);
  render(data);
})

socket.on('stream',function(image){
  socket.broadcast.emit('stream',image);
})

function render (data) {
  var html = data.map(function(elem, index) {
    return(`<div>
              <strong>${elem.author}</strong>:
              <em>${elem.text}</em>
            </div>`);
  }).join(" ");

  document.getElementById('messages').innerHTML = html;
}

function addMessage(e) {
  var message = {
    author: document.getElementById('username').value,
    text: document.getElementById('texto').value
  };

  socket.emit('new-message', message);
  
  return false;



  
  
}
