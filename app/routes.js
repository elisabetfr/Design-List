var User = require("./models/user.js");
var DateTime = require('node-datetime');

// app/routes.js
module.exports = function(app, passport) {

    // Pagina principal (con enlaces de iniciar sesion y registrarse)
    
    app.get('/', function(req, res) {
        res.render('layouts/index.html'); // load the index.ejs file
    });


    // Escritorio/tablero
    // Usuario debe estar conectado para estar protegido y poder acceder al dashboard.
    // usaremos middleware de ruta para verificar esto (la función isLoggedIn)
    app.get('/dashboard', isLoggedIn, function(req, res) {
        res.render('layouts/dashboard.html', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // Usuario debe estar conectado para estar protegido y poder acceder a '/misproyectos'.
    // usaremos middleware de ruta para verificar esto (la función isLoggedIn)
    app.get('/misproyectos', isLoggedIn, function(req, res) {
        res.render('layouts/misProyectos.html', {
            user : req.user, // get the user out of session and pass to template
            projects: req.user.projects
        });
    });

    
    // Usuario debe estar conectado para estar protegido y poder acceder a '/mislistas'.
    // usaremos middleware de ruta para verificar esto (la función isLoggedIn)
    app.get('/mislistas', isLoggedIn, function(req, res) {
        res.render('layouts/misListas.html', {
            user : req.user // saca al usuario de la sesión y pasa a la plantilla
        });
    });

    
    // Logout (Cerrar sesion)
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    // Formulario de registro o inicio de sesion
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/dashboard', // Redireccionar a la sección de perfil seguro ('/dashboard')
        failureRedirect : '/', // Redirecciona de nuevo a la página del index si hay algun error
        failureFlash : true // allow flash messages
    }));


// app/routes.js

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // Permite mensajes flash
    }));


    // Modals

    // Crear lista Modal

    // Añadir una nueva lista rellenando los diferentes campos
    app.post('/addlist', isLoggedIn, function(req, res) {

        // Poner Fecha de creacion de proyectos y listas
        var finishDate = DateTime.create(req.body.date); // Coge la fecha que pusimos anteriormente en el html en la variable dt 
        finishDate = finishDate.format("d-m-Y"); // Coge el formato de la variable dt anterior

        // Poner tareas una en cada linea
        var tasks = req.body.cardText.split("\n");
        var tasksArr = [];

        for(var i = 0; i < tasks.length; i++){
            var newTask = {
                description: tasks[i].trim(),
                date: finishDate, 
                state: false
            }

            tasksArr.push(newTask);
        }

        // Coge el nombre y lo corta en los espacios en blanco; con .filter te filtra el array del split, 
        // .join une todos los elementos que tienen texto
        var slug = req.body.nameList.split(" ").filter(function(entry) { return entry.trim() != ''; }).join("_");


        // Lista con todos sus objetos
        var list = {
            name: req.body.nameList,
            color: req.body.colorList,
            tasks: tasksArr,
            slug: slug
        };

        User.findOne({email: req.user.email}, function(err, user) {
            if(err) throw err;

            if(user) {
                User.update({email: req.user.email}, {$push: {lists: list}}, {upsert: true}, function(err) {
                    if(err) res.json({success: false, message: err});

                    res.json({success: true});
                });
            }
        });
    });


    // Obtener tareas de las listas
    app.get('/mislistas/:name', isLoggedIn, function(req, res) {
        res.render('layouts/misListas.html', {
            user: req.user,
            lists: req.user.lists,
            listname: req.params.name
        });
    });


    // Marcar tareas de listas con check
    app.post('/marklisttask', isLoggedIn, function(req, res) {
        var description = req.body.description;
        var listname = req.body.listname;
        var date = req.body.date;
        
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {
                // Se hace un push para añadir las tareas a la base de datos
                User.update({"email":req.user.email, "lists.name":listname}, {$push:{"lists.$.tasks":{description: description, date: date, state: true}}}, function(err){
                    if(err){
                        alert("ERROR: " + err);
                    }
                    // Despues tenemos que hacer un pull para marcar como completadas esas tareas
                    User.update({"email":req.user.email, "lists.name":listname}, {$pull:{"lists.$.tasks":{description: description, date: date, state: false}}}, function(err){
                        if(err){
                            alert("ERROR: " + err);
                        }

                        res.json({success: true});
                    })
                })
            }
        });  
    });


    // Borra tareas de una lista completa
    app.post('/deletetask', isLoggedIn, function(req, res) {
        var description = req.body.description;
        var listname = req.body.listname;
        
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {
                // Se hace un pull para añadir las tareas a la base de datos
                User.update({"email":req.user.email, "lists.name":listname}, {$pull:{"lists.$.tasks":{description: description}}}, function(err){
                    if(err){
                        alert("ERROR: " + err);
                    }
                    res.json({success: true});
                })
            }
        });  
    });



    // Marcar tareas de proyectos con check
    app.post('/markprojecttask', isLoggedIn, function(req, res) {

        var description = req.body.description;
        var projectname = req.body.projectname;
        description = description.trim();
        projectname = projectname.trim();
        
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {
                // Se hace un push para añadir las tareas a la base de datos
                User.update({"email":req.user.email, "projects.name":projectname}, {$push:{"projects.$.tasks":{description: description, state: true}}}, function(err){
                    if(err){
                        console.log("ERROR: " + err);
                    }
                    // Despues tenemos que hacer un pull para eliminar como completadas esas tareas
                    User.update({"email":req.user.email, "projects.name":projectname}, {$pull:{"projects.$.tasks":{description: description, state: false}}}, function(err){
                        if(err){
                            console.log("ERROR: " + err);
                        }

                        res.json({success: true});
                    })
                })
            }
        });  
    });


    // Marcar tareas de proyectos con check
    app.post('/addprojecttask', isLoggedIn, function(req, res) {
        // var description = req.body.description;
        // var projectname = req.body.projectname;
        
        // // Busca un usuario
        // User.findOne({email: req.user.email}, function(err, user) {
        //     // Si no lo encuentra, muestra un error
        //     if(err) throw err;
        //     // Si encuentra al usuario, elimine las tareas
        //     if(user) {
        //         // Se hace un push para añadir las tareas a la base de datos
        //         User.update({"email":req.user.email, "projects.name":projectname}, {$push:{"projects.$.tasks":{description: description, state: true}}}, function(err){
        //             if(err){
        //                 alert("ERROR: " + err);
        //             }
        //             // Despues tenemos que hacer un pull para marcar como completadas esas tareas
        //             User.update({"email":req.user.email, "projects.name":projectname}, {$pull:{"projects.$.tasks":{description: description, state: false}}}, function(err){
        //                 if(err){
        //                     alert("ERROR: " + err);
        //                 }

        //                 res.json({success: true});
        //             })
        //         })
        //     }
        // }); 

        var description = req.body.description;
        var projectname = req.body.projectname;
        
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {
                // Se hace un push para añadir las tareas a la base de datos
                User.update({"email":req.user.email, "projects.name":projectname}, {$push:{"projects.$.tasks":{description: description, state: false}}}, function(err){
                    if(err){
                        alert("ERROR: " + err);
                    }

                    res.json({success: true});
                })
            }
        });  
    });

    // Añade tareas a listas
    app.post('/addlisttask', isLoggedIn, function(req, res) {
        // var description = req.body.description;
        // var projectname = req.body.projectname;
        
        // // Busca un usuario
        // User.findOne({email: req.user.email}, function(err, user) {
        //     // Si no lo encuentra, muestra un error
        //     if(err) throw err;
        //     // Si encuentra al usuario, elimine las tareas
        //     if(user) {
        //         // Se hace un push para añadir las tareas a la base de datos
        //         User.update({"email":req.user.email, "projects.name":projectname}, {$push:{"projects.$.tasks":{description: description, state: true}}}, function(err){
        //             if(err){
        //                 alert("ERROR: " + err);
        //             }
        //             // Despues tenemos que hacer un pull para marcar como completadas esas tareas
        //             User.update({"email":req.user.email, "projects.name":projectname}, {$pull:{"projects.$.tasks":{description: description, state: false}}}, function(err){
        //                 if(err){
        //                     alert("ERROR: " + err);
        //                 }

        //                 res.json({success: true});
        //             })
        //         })
        //     }
        // }); 

        var description = req.body.description;
        var listname = req.body.listname;
        console.log(listname, description)
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {

                // Se hace un push para añadir las tareas a la base de datos
                User.update({"email":req.user.email, "lists.name":listname}, {$push:{"lists.$.tasks":{description: description, state: false, date: "21-09-2017"}}}, function(err){
                    if(err){
                        alert("ERROR: " + err);
                    }

                    res.json({success: true});
                })
            }
        });  
    });


    // Marcar tareas de proyectos completadas
    app.post('/deletetask', isLoggedIn, function(req, res) {
        var description = req.body.description;
        var listname = req.body.listname;
        
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {
                // Se hace un push para añadir las tareas a la base de datos
                User.update({"email":req.user.email, "lists.name":listname}, {$pull:{"lists.$.tasks":{description: description}}}, function(err){
                    if(err){
                        console.log("ERROR: " + err);
                    }
                    res.json({success: true});
                })
            }
        });  
    });



    // Borrar proyectos
    app.post('/deleteproject', isLoggedIn, function(req, res) {
        var projectname = req.body.projectname;
        
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {
                
                User.update({"email":req.user.email, "projects.name":projectname}, {$pull:{projects: {name: projectname}}}, function(err){
                    if(err){
                        alert("ERROR: " + err);
                    }

                    res.json({success: true});
                })
            }
        });  
    });


    // Borrar listas
    app.post('/deletelist', isLoggedIn, function(req, res) {
        var listname = req.body.listname;
        
        // Busca un usuario
        User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, elimine las tareas
            if(user) {
                
                User.update({"email":req.user.email, "lists.name":listname}, {$pull:{lists: {name: listname}}}, function(err){
                    if(err){
                        alert("ERROR: " + err);
                    }

                    res.json({success: true});
                })
            }
        });  
    });


    //Añadir tareas a listas
        app.post('/addtasklist', isLoggedIn, function(req, res) {
            var description = req.body.description;
            var listname = req.body.listname;

            User.findOne({email: req.user.email}, function(err, user) {
            // Si no lo encuentra, muestra un error
            if(err) throw err;
            // Si encuentra al usuario, añade las tareas
            if(user) {
                // User.findOneAndUpdate({email: req.user.email, "lists.name": listname}, {$pull: {lists: {name: listname}}}, function(err) {
                //     if(err) res.json({success: false, message: err});

                //     res.json({success: true});
                // });
                User.update({"email":req.user.email, "lists.name":data.listname}, {$push:{"lists.$.tasks":{description: description, state: false}}})
            }
        });    
        })


    // Crear proyecto Modal

    // Añadir un nuevo proyecto rellenando los diferentes campos
    app.post('/addproject', isLoggedIn, function(req, res) {

        // Poner Fecha de creacion de proyectos y listas
        var dt = DateTime.create(); // Si create() esta vacio, coge la fecha actual del momento
        var currentDate = dt.format('d-m-Y'); // Formato de dia/hora/mes
        var finishDate = DateTime.create(req.body.date); // Coge la fecha que pusimos anteriormente en el html en la variable dt 
        finishDate = finishDate.format("d-m-Y"); // Coge el formato de la variable dt anterior

        var tasks = req.body.cardText.split("\n");
        var tasksArr = [];

        for(var i = 0; i < tasks.length; i++){
            var newTask = {
                description: tasks[i].trim(),
                state: false
            }

            tasksArr.push(newTask);
        }


        // Coge el nombre y lo corta en los espacios en blanco; con .filter te filtra el array del split, 
        // .join une todos los elementos que tienen texto
        var slug = req.body.nameProject.split(" ").filter(function(entry) { return entry.trim() != ''; }).join("_");

        // Proyecto con todos sus objetos 
        var project = {
            name: req.body.nameProject, 
            color: req.body.colorProject,
            date: currentDate,
            finishDate: finishDate,
            tasks: tasksArr,
            slug: slug
        };


        // Buscar si un usuario cuyo email insertado anteriormente en el login o registro,
        // corresponde con el email que se encuentra en la base de datos 
        User.findOne({email: req.user.email}, function(err, user) {
            if(err) throw err;

            if(user) {
                User.update({email: req.user.email}, {$push: {projects: project}}, {upsert: true}, function(err) {
                    if(err) res.json({success: false, message: err});

                    res.json({success: true});
                });
            }
        });
    });


    // Devuelve un json con todos los datos que tenga el usuario, de sus proyectos y de las listas
    app.get('/app/misdatos', isLoggedIn, function(req, res) {

        User.findOne({email: req.user.email}, {_id: 0, password: 0, __v: 0}, function(err, user) {
            if(err) throw err;

            if(user) {
                res.json(user);
            }
        });
    });

};


// Ruta de middleware para asegurarse de que un usuario esta registrado
function isLoggedIn(req, res, next) {

    // Si el usuario esta autentificado en la sesion, puede continuar
    if (req.isAuthenticated())
        return next();

    // si no esta registrado, lo redirecciona a la pagina principal
    res.redirect('/');
}


//Lista por defecto Modal
    //Lista por defecto una vez nos logeamos en el index y ya accedemos a dashboard

    // app.post('/listdefault', isLoggedIn, function(req, res) {
    //     var events = require("events");
    //     var emitter = new events.EventEmitter();
    //     function handler () {
    //         console.log("Lista por defecto");
    //     }
    //     emitter.on("myEvent", handler);
    //     emitter.emit("myEvent");
    //     emitter.removeListener("myEvent", handler);
    //     emitter.emit("myEvent");

    //     User.findOne({email: req.user.email}, function(err, user) {
    //             if(err) throw err;

    //             if(user) {
    //                 User.update({email: req.user.email}, {$push: {projects: listdefault}}, {upsert: true}, function(err) {
    //                     if(err) res.json({success: false, message: err});

    //                     res.json({success: true});
    //                 });
    //             }
    //     });
    // });
