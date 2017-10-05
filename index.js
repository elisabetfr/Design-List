// set up
// Herramientas que necesitamos
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var path	= require('path');
var nunjucks = require('nunjucks');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var configDB = require('./config/database.js');

// Configuracion
var options = {
  	useMongoClient: true
}

mongoose.connect(configDB.url, options); // Conectarse a la base de datos

//require('./config/passport')(passport); // passport para la configuracion

// Configurar nuestra aplicacion
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // leer las cookies necesarias para auth
app.use(bodyParser()); // obtener información de formularios html

// Configuración de plantillas nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true,
    noCache: false
});

// Establecer Nunjucks como un motor de renderizado para páginas con .html
app.engine( 'html', nunjucks.render ) ;
app.set( 'view engine', 'html' );

// Necesario para passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // sesion secreta
app.use(passport.initialize());
app.use(passport.session()); // sesiones de inicio de sesión persistentes
app.use(flash()); // Uso de connect-flash para mensajes flash almacenados en sesión

// Rutas
require('./app/routes.js')(app, passport); // Carga nuestras rutas y pasa en nuestra aplicación pasaport completamente configurado
require('./config/passport')(passport); // pasa passport para la configuracion

// Lanzamiento y escucha del puerto
app.listen(port);
console.log('The magic happens on port ' + port);

