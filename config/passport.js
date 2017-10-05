// config/passport.js

// Cargar todas la cosas que necesitamos
var LocalStrategy   = require('passport-local').Strategy;

// cargar el modelo de usuario
var User            = require('../app/models/user');

// exponemos esta función en nuestra aplicación usando module.exports
module.exports = function(passport) {

   
    // Instalacion de la sesion de passport
    
    // necesario para las sesiones de inicio de sesión persistentes
    // passport necesita capacidad para organizar y anular a los usuarios fuera de sesión

    // utilizado para serializar al usuario para la sesión
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //  usado para deserializar al usuario
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // Signup (Registrarse)

    // estamos usando estrategias nombradas ya que tenemos una para login y otra para registrarse
    // por defecto, si no había nombre, simplemente se llamaría 'local'

    passport.use('local-signup', new LocalStrategy({
        // por defecto, la estrategia local usa el email y la contraseña, no utilizaremos el nombre de usuario
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // nos permite pasar la solicitud completa a la devolución de llamada (callback)
    },

    function(req, email, password, done) {

        // asincronico
        // User.findOne no se disparara a menos que se devuelvan los datos
        process.nextTick(function() {

        // encuentra un usuario cuyo correo electrónico es el mismo que el correo electrónico con el que se registro
        // estamos revisando para ver si ya existe el usuario que intenta ingresar
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // si hay algún error, devuelva el error
            if (err)
                return done(err);

            // comprueba si ya hay un usuario con ese correo electrónico
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                //si no hay usuario con ese correo electrónico, lo crea
                var newUser            = new User();

                // establece las credenciales locales del usuario
                newUser.email    = email;
                newUser.password = newUser.generateHash(password);

                // guarda el usuario
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

    // LOCAL LOGIN (Iniciar sesion)

    // estamos usando estrategias nombradas ya que tenemos una para login y otra para registrarse
    // por defecto, si no hay email, se llamaría 'local'

    passport.use('local-login', new LocalStrategy({
        // por defecto, la estrategia local usa el email y la contraseña, anularemos el nombre de usuario

        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // nos permite pasar la solicitud completa a la devolución de llamada
    },
    function(req, email, password, done) { // callback con correo electrónico y contraseña de nuestro formulario

        // encuentra un usuario cuyo correo electrónico es el mismo que el correo electrónico del formulario de registro
        // se revisa para ver si ya existe el usuario que intenta ingresar
        User.findOne({ 'email' :  email }, function(err, user) {
            // si hay algún error, devuelve el error antes de cualquier otra cosa
            if (err)
                return done(err);

            // si no se encuentra ningún usuario, devuelve el mensaje
            if (!user)
                return done(null, false, req.flash('loginMessage', 'Usuario no encontrado')); // req.flash is the way to set flashdata using connect-flash

            // si se encuentra el usuario pero la contraseña es incorrecta
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Contraseña incorrecta')); // crear el loginMessage y lo guarda en la sesión como flashdata

            // Si todo esta bien, devuelve el usuario con exito
            return done(null, user);
        });

    }));
};