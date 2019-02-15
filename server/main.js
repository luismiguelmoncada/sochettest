var express = require('express');
var app = express();
//var server = require('http').Server(app);
const https = require('https');
//se usa para acceder al file sistem
const fs = require('fs')
var pathl = require('path');

const httpsOptions = {
  key: fs.readFileSync(pathl.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(pathl.join(__dirname, 'cert.pem'))
};
const port = process.env.PORT || 3000;
var server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
});
var io = require('socket.io')(server); 
var bodyParser = require('body-parser');//body desde ajax, sin esto no lee el body
var sql = require('mssql'); // conectar a sql server

//se usa para la carga de imagenes en el servidor 
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});

var userController = require('./controllers/user'); //importa el js del control para usar sus metodos

//para certificado de seguridad y https


//conexion a base de datos
var dbConfig = {
    user:  'sa',
    password: 'Software1',
    server: '186.86.51.215',
    database:'dbDempos'
};

app.use(express.static('public'));




//esto es para leer el objeto data desde AJAX
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: false,
  parameterLimit:50000 //si no se pone el limite de la imagen en tamaño saca error
}));

//headers para permitir conexiones desde ajax por ejemplo
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});


//prueba de consulta desde angular por metodo get a sql server
app.get('/test', function (req, res) {
    sql.connect(dbConfig, function() {
        var request = new sql.Request();
        request.query('select top 5 r.Descripcion,count(*) as Cantidad from Ordenamientos_Usuarios u inner join Ordenamientos_RolesUsuarios r on u.IdTipoUsuario = r.IdRol group by r.Descripcion ORDER by Cantidad desc', function(err, recordset) {
            if(err) console.log(err);
            res.end(JSON.stringify(recordset)); // Result in JSON format
            sql.close();
        });
    });
})

//prueba de consulta por metodo get que ejecuta el socket y alerta al componete angular
//se puede ejecutar desde postman
app.get('/testin', function (req, res) {

  console.log('entro al metodo get')

  sql.connect(dbConfig, function() {
    var request = new sql.Request();
    request.query('select top 6 r.Descripcion,count(*) as Cantidad from Ordenamientos_Usuarios u inner join Ordenamientos_RolesUsuarios r on u.IdTipoUsuario = r.IdRol group by r.Descripcion ORDER by Cantidad desc', function(err, recordset) {
        if(err) console.log(err);
        res.end(JSON.stringify(recordset)); // Result in JSON format
        sql.close();

        io.emit('messagestest', recordset);
    });
});
})

//guarda archivo en el servidor desde un file
app.post('/upload', upload.single('photo'), (req, res) => {
  if(req.file) {
      res.json(req.file);
  }
  else throw 'error';
});

//guarda imagen en el servidor desde base64
app.post('/uploadPhoto',userController.uploadPhoto);



io.on('connection', function(socket) {
  console.log('Alguien se ha conectado al socket');

  socket.on('disconnect', function(){
    console.log('Alguien se desconecto del socket');
  });
});

/* server.listen(port, function() {
  console.log("Servidor corriendo en puerto: " + port);
}); */