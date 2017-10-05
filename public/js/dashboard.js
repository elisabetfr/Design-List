$(document).ready(function(){
	// var json= localStorage.getItem(7);
	// 	json = JSON.parse(json);

	// Coge la direccion en la que estoy: localhost:3000/...
	var currentLocation = window.location.href;
	var currentPath = currentLocation.split(":3000/")[1].split("/")[0].trim(); //Nos quedamos con el contenido de detras de la /. Metodo .trim() quita los espacios al principio y al final


	// Dashboard.html

	if(currentPath == "dashboard"){
		// Mostrar proyectos y listas con fecha de hoy
		var f = new Date();
		var month = f.getMonth()+1;

		// Si el mes que me da es menor a 10, entonces que ponga un 0 delante
		if(month < 10){
			month = "0" + month;
		}

		var hoy = f.getDate() + "-" + month + "-" + f.getFullYear();

		loadTodayProject(hoy);
		loadTodayList(hoy);
	}

	// Funcion para mostrar los proyectos
	function loadTodayProject (hoy) {
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/app/misdatos',

		    // especifica si será una petición POST o GET
		    type : 'GET',
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de proyectos
		    success : function(json) {
		        for(var i=0; i<json.projects.length; i++){
			    	var name = json.projects[i].name;
			    	var startDate = json.projects[i].date; 
			    	var finishDate = json.projects[i].finishDate;
			    	var color = json.projects[i].color;

			    	// Comprobacion y muestra la fecha de hoy
			    	if(finishDate == hoy) {
			    		// Crear variable y capturamos la tarjeta por su id (#hiddenProjectCard),
					// y despues ponemos .clone para hacer un clone de esa tarjeta y almacenar en la variable tarjeta el contenido de la tarjeta 
					var cartaProyectos = $("#hiddenProjectCard").clone();
					cartaProyectos.find(".project-card-color").css("background-color", color);

			    	for(var j=0; j<json.projects[i].tasks.length; j++){
			    		var description = json.projects[i].tasks[j].description;
			    		var state = json.projects[i].tasks[j].state;
					
						// Luego hacemos un removeAttr("hidden") para eliminar el atributo hidden, para así mostrar la tarjeta
						cartaProyectos.removeAttr("hidden");
						// Por ultimo, ponemos .find para buscar dentro del contenido de la tarjeta un elemento por la clase
						// y dentro de él, se le añade un texto

						cartaProyectos.find(".project-card-title span").text(name);
						cartaProyectos.find(".project-card-title span").attr("title", name);
						var li = $('<li class="task-element"><i class="fa fa-check-circle-o"></i> '+description+'</li>');

						if(json.projects[i].tasks[j].state){
							li = $('<li class="task-element" style="text-decoration: line-through"><i class="fa fa-check-circle-o" style="color: lime"></i> '+description+'</li>')
						}

						cartaProyectos.find(".project-card-body ul").append(li);
						cartaProyectos.find(".project-start-date span").text(startDate);
						// proyectos.find(".project-card-users span").text();
						cartaProyectos.find(".project-expire-date span").text(finishDate);
						// Añade la tarjeta proyectos al dashboard
						$("#proyectos").append(cartaProyectos);
					}
			    	}
				}

				$(".trash").on("click", function(){
					var pName = $(this).parent().parent().parent().find(".titleProject").text();

					deleteProjects(pName, $(this));
				});

				$(".plus").on("click", function(){
					var pName = $(this).parent().parent().parent().find(".titleProject").text();
					$("#addTaskBtn").attr("data-pname", pName);
				});

				$(".task-element").on("click", function(){
					var taskName = $(this).text();
					var projectName = $(this).parent().parent().parent().find(".titleProject").text();
					console.log(projectName)
					markProjectTask(projectName, taskName, $(this));
					//deleteProjects(pName, $(this));
				});
		    },

	    // código a ejecutar si la petición falla;
	    // son pasados como argumentos a la función
	    // el objeto de la petición y código de estatus de la petición
		    error : function(xhr, status) {
		        alert('Disculpe, existió un problema');
		    },
	 
	    // código a ejecutar sin importar si la petición falló o no
		    // complete : function(xhr, status) {
		    //     alert('Petición realizada');
		    // }
		});
	}

	$("#addProjectButton").on("click", function(){
		var name = $("#projectNameModal").val();
		var color = $("#projectColorModal").val();
		var tasks = $("#projectTasksModal").val();
		var date = $("#projectDateModal").val();

		addProject(name, color, tasks, date);
	});

	//Funcion para añadir proyectos
	function addProject(name, color, tasks, date){
		$.ajax({
			url: "http://localhost:3000/addproject",
			method: "POST",
			data: {nameProject: name, colorProject: color, cardText: tasks, date: date},
			dataType: "json",
			//Tarjeta de listas
		    success : function(json) {
		        if(json.success){
		        	setTimeout(function(){
		        		window.location.reload();
		        	}, 600);
		        }
		    }
		});
	}


	$("#addListBtn").on("click", function(){
		var name = $("#nameList").val();
		var color = $("#colorList").val();
		var tasks = $("#cardTextList").val();
		var date = $("#dateList").val();

		addList(name, color, tasks, date);
	});

	//Funcion para añadir listas
	function addList(name, color, tasks, date){
		$.ajax({
			url: "http://localhost:3000/addlist",
			method: "POST",
			data: {nameList: name, colorList: color, cardText: tasks, date: date},
			dataType: "json",
			//Tarjeta de listas
		    success : function(json) {
		        if(json.success){
		        	setTimeout(function(){
		        		window.location.reload();
		        	}, 600);
		        }
		    }
		});
	}

	//Funcion para marcar tareas de proyectos como hechas
	function markProjectTask(projectName, taskDescription, taskButton){
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/markprojecttask',

		    // especifica si será una petición POST o GET
		    type : 'POST',

		    data: {description: taskDescription, projectname: projectName}, 
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de proyectos
		    success : function(json) {
		        if(json.success){
		        	$(taskButton).css("text-decoration", "line-through");
		        }
		    },

	    // código a ejecutar si la petición falla;
	    // son pasados como argumentos a la función
	    // el objeto de la petición y código de estatus de la petición
		    error : function(xhr, status) {
		        alert('Disculpe, existió un problema');
		    },
	 
	    // código a ejecutar sin importar si la petición falló o no
		    // complete : function(xhr, status) {
		    //     alert('Petición realizada');
		    // }
		});
	}

	$("#addTaskBtn").on("click", function(){
		var pname = $(this).attr("data-pname");
		var task = $(".inputTask").val();
		projectAddTask(pname, task);
	});

	//Funcion para añadir tarea a proyectos
	function projectAddTask(name, task){
		$.ajax({
			url: "http://localhost:3000/addprojecttask",
			method: "POST",
			data: {description: task, projectname: name},
			dataType: "json",
			//Tarjeta de listas
		    success : function(json) {
		        if(json.success){
		        	setTimeout(function(){
		        		window.location.reload();
		        	}, 600);
		        }
		    }
		});
	}

	$("#addTaskListBtn").on("click", function(){
		var listname = $(this).attr("data-lname").trim();
		var task = $("#inputTaskList").val().trim();
		listAddTask(listname, task);
	});

	//Funcion para añadir tarea a lista
	function listAddTask(name, task){
		$.ajax({
			url: "http://localhost:3000/addlisttask",
			method: "POST",
			data: {description: task, listname: name},
			dataType: "json",
			//Tarjeta de listas
		    success : function(json) {
		        if(json.success){
		        	setTimeout(function(){
		        		window.location.reload();
		        	}, 600);
		        }
		    }
		});
	}


	// Funcion para mostrar las listas
	function loadTodayList (hoy) {
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/app/misdatos',

		    // especifica si será una petición POST o GET
		    type : 'GET',
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de listas
		    success : function(json) {
		        for(var i=0; i<json.lists.length; i++){
			    	var name = json.lists[i].name;
			    	var color = json.lists[i].color;
			    	
			    	// Crear variable y capturamos la tarjeta por su id (#hiddenTaskCard),
					// y despues ponemos .clone para hacer un clone de esa tarjeta y almacenar en la variable tarjeta el contenido de la tarjeta 				

			    	for(var j=0; j<json.lists[i].tasks.length; j++){
			    		var finishDate = json.lists[i].tasks[j].date;
			    		var cartaListas = $("#hiddenTaskCard").clone();
				    	// Comprobacion y muestra la fecha de hoy
				    	if(finishDate == hoy)
				    	{
				    		var description = json.lists[i].tasks[j].description;
				    		var state = json.lists[i].tasks[j].state;
						
							// Luego hacemos un removeAttr("hidden") para eliminar el atributo hidden, para así mostrar la tarjeta
							cartaListas.removeAttr("hidden");
							cartaListas.find(".task-card-color").css("background-color", color);

							if(state){
								cartaListas.find(".taskCheck").css("color", "lime");
							}

							cartaListas.find(".task-card-title span").text(json.lists[i].name);
							// Por ultimo, ponemos .find para buscar dentro del contenido de la tarjeta un elemento por la clase
							// y dentro de él, se le añade un texto
							cartaListas.find(".task-card-body").text(json.lists[i].tasks[j].description);
							// proyectos.find(".project-card-users span").text();
							cartaListas.find(".task-expire-date span").text(json.lists[i].tasks[j].date);
							// Añade la tarjeta proyectos al dashboard
							$("#tareas").append(cartaListas);
				    	}	
					}
				}


				// Marca tareas como hechas

				// El taskCheck debe estar dentro de la funcion porque se aplica una vez estan cargadas las tarjetas, 
				// y hacemos click en check

				$(".taskCheck").on("click", function() {
					console.log("CLICK!")
					var description = $(this).parent().parent().parent().parent().parent().find(".task-card-body").text();
					var listname = $(this).parent().parent().parent().parent().parent().find(".task-card-title span").text();
					var date = $(this).parent().parent().parent().parent().parent().find(".task-expire-date span").text();
					var self = $(this);
					console.log(description)
					// Llamada ajax
					$.ajax({
						url:"http://localhost:3000/marklisttask",
						method: "POST",
						dataType: "json",
						data: {description: description, listname: listname, date: date},

						success: function(json) {
							if(json.success){
								self.css("color", "lime");
								//$(this).parent().parent().parent().parent().parent().remove();
							}
							else{
								alert("ERROR")
							}
						}
					})
				});


				$(".trash").on("click", function() {
					console.log("CLICK!")
					var description = $(this).parent().parent().parent().find(".task-card-body").text();
					var listname = $(this).parent().parent().parent().find(".task-card-title span").text();
					var self = $(this);
					console.log(description)
					// Llamada ajax
					$.ajax({
						url:"http://localhost:3000/deletetask",
						method: "POST",
						dataType: "json",
						data: {description: description, listname: listname},

						success: function(json) {
							if(json.success){
								self.parent().parent().parent().remove();
							}
							else{
								alert("ERROR")
							}
						}
					})
				});

				$(".plus").on("click", function(){
					var listname = $(this).parent().parent().parent().find(".titleProject").text();
					$("#addTaskListBtn").attr("data-lname", listname);
				});
		    },

	    // código a ejecutar si la petición falla;
	    // son pasados como argumentos a la función
	    // el objeto de la petición y código de estatus de la petición
		    error : function(xhr, status) {
		        alert('Disculpe, existió un problema');
		    },
	 
	    // código a ejecutar sin importar si la petición falló o no
		    // complete : function(xhr, status) {
		    //     alert('Petición realizada');
		    // }
		});
	}


	// Mostrar tareas en mis listas

	// Si la ruta es exactamente igual a mislistas, 
	// creamos una variable y con .split cortamos y nos quedamos con mislistas, que es lo que esta despues de /
	if(currentPath == "mislistas"){
		var slug = currentLocation.split(":3000/")[1].split("/")[1].trim();
		loadListTask(slug);
	}

	// Funcion para mostrar tareas de las listas
	function loadListTask (slug) {
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/app/misdatos',

		    // especifica si será una petición POST o GET
		    type : 'GET',
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de listas
		    success : function(json) {
		    	// Comprobacion del slug, para añadir _ si los nombres de tareas tienen espacios entre palabras
		        if(slug.includes("_")){
		        	// Creacion de variable para buscar en las listas, 
		        	// aquella en la que el slug es igual al slug que se encuentra en la funcion 
		        	var foundList = json.lists.find(x => x.slug == slug);

		        	for(var j = 0; j < foundList.tasks.length; j++){
		        		var cartaListas = $("#hiddenTaskCard").clone();
					    	// Comprobacion y muestra la fecha de hoy
					    
				    		var description = foundList.tasks[j].description;
				    		var state = foundList.tasks[j].state;
						
							// Luego hacemos un removeAttr("hidden") para eliminar el atributo hidden, para así mostrar la tarjeta
							cartaListas.removeAttr("hidden");
							cartaListas.find(".task-card-title span").text(foundList.name);
							// Por ultimo, ponemos .find para buscar dentro del contenido de la tarjeta un elemento por la clase
							// y dentro de él, se le añade un texto
							cartaListas.find(".task-card-body").text(foundList.tasks[j].description);
							// proyectos.find(".project-card-users span").text();
							cartaListas.find(".task-expire-date span").text(foundList.tasks[j].date);
							// Añade la tarjeta proyectos al dashboard
							$("#tareas").append(cartaListas);
		        	}
		        }
			}
		});
	}


	// Selector (Buscar por)

	if(currentPath == "misproyectos") {
		$("#projectsSelect").on("change", function(){
			var selected = $(this).val();
			var text = $("#projectsInputSelect").val();

			if(text != ""){
				$("#projectsRow").empty();
				loadProjects(selected, text)
			}
		});
	}

	function loadProjects (type, search) {
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/app/misdatos',

		    // especifica si será una petición POST o GET
		    type : 'GET',
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de proyectos
		    success : function(json) {
		        for(var i=0; i<json.projects.length; i++){
			    	var name = json.projects[i].name;
			    	var startDate = json.projects[i].date; 
			    	var finishDate = json.projects[i].finishDate;

			    	var cartaProyectos = $("#something");

			    	if(type == "sel1"){
			    		if(name.toLowerCase().includes(search.toLowerCase())){
			    			console.log("incluyeee")
			    			cartaProyectos = $("#hiddenProjectCard").clone();
			    		}
			    	}
			    	else if(type == "sel2"){
			    		if(finishDate == search){
			    			cartaProyectos = $("#hiddenProjectCard").clone();
			    		}
			    	}
			    	else if(type == "sel3"){
			    		if(startDate == search){
			    			cartaProyectos = $("#hiddenProjectCard").clone();
			    		}
			    	}
			    	// Comprobacion y muestra la fecha de hoy
			    
			    		// Crear variable y capturamos la tarjeta por su id (#hiddenProjectCard),
					// y despues ponemos .clone para hacer un clone de esa tarjeta y almacenar en la variable tarjeta el contenido de la tarjeta 
					// var cartaProyectos = $("#hiddenProjectCard").clone();

			    	for(var j=0; j<json.projects[i].tasks.length; j++){
			    		var description = json.projects[i].tasks[j].description;
			    		var state = json.projects[i].tasks[j].state;
					
						// Luego hacemos un removeAttr("hidden") para eliminar el atributo hidden, para así mostrar la tarjeta
						cartaProyectos.removeAttr("hidden");
						// Por ultimo, ponemos .find para buscar dentro del contenido de la tarjeta un elemento por la clase
						// y dentro de él, se le añade un texto
						cartaProyectos.find(".project-card-title span").text(name);
						cartaProyectos.find(".project-card-title span").attr("title", name);
						cartaProyectos.find(".project-card-color").css("background-color", json.projects[i].color);
						var li = $('<li class="task-element"><i class="fa fa-check-circle-o"></i> '+description+'</li>');
						cartaProyectos.find(".project-card-body ul").append(li);
						cartaProyectos.find(".project-start-date span").text(startDate);
						// proyectos.find(".project-card-users span").text();
						cartaProyectos.find(".project-expire-date span").text(finishDate);
						// Añade la tarjeta proyectos al dashboard
						$("#projectsRow").append(cartaProyectos);
					}
			    	
				}
		    },

	    // código a ejecutar si la petición falla;
	    // son pasados como argumentos a la función
	    // el objeto de la petición y código de estatus de la petición
		    error : function(xhr, status) {
		        alert('Disculpe, existió un problema');
		    },
	 
	    // código a ejecutar sin importar si la petición falló o no
		    // complete : function(xhr, status) {
		    //     alert('Petición realizada');
		    // }
		});
	}


	//Borrar proyectos
	if(currentPath == "misproyectos") {
		$(".trash").on("click", function(){
			var pName = $(this).parent().parent().parent().find(".titleProject").text();
			deleteProjects(pName, $(this));
		});

		$(".plus").on("click", function(){
			var pName = $(this).parent().parent().parent().find(".titleProject").text();
			$("#addTaskBtn").attr("data-pname", pName);
		});

		$(".task-element").on("click", function(){
					var taskName = $(this).text();
					var projectName = $(this).parent().parent().parent().find(".titleProject").text();
					console.log(projectName)
					markProjectTask(projectName, taskName, $(this));
		});
	}

	function deleteProjects(name, button) {
		console.log("CLICK")
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/deleteproject',

		    // especifica si será una petición POST o GET
		    type : 'POST',

		    data: {projectname: name}, 
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de proyectos
		    success : function(json) {
		        if(json.success){
		        	$(button).parent().parent().parent().remove();
		        }
		    },

	    // código a ejecutar si la petición falla;
	    // son pasados como argumentos a la función
	    // el objeto de la petición y código de estatus de la petición
		    error : function(xhr, status) {
		        alert('Disculpe, existió un problema');
		    },
	 
	    // código a ejecutar sin importar si la petición falló o no
		    // complete : function(xhr, status) {
		    //     alert('Petición realizada');
		    // }
		});

	}


	//Borrar listas
	if(currentPath == "mislistas") {
		$(".trash").on("click", function(){
			var lName = $(this).parent().parent().parent().find(".task-card-title span").text().trim();
			var desc = $(this).parent().parent().parent().find(".titleList").text().trim();
			deleteTask(lName, desc, $(this));
		});

		$(".taskCheck").on("click", function() {
			var description = $(this).parent().parent().parent().parent().parent().find(".titleList").text();
			var listname = $(this).parent().parent().parent().parent().parent().find(".task-card-title span").text();
			var date = $(this).parent().parent().parent().parent().parent().find(".task-expire-date span").text();
			console.log(description, listname, date)
			var self = $(this);

			// Llamada ajax
			$.ajax({
				url:"http://localhost:3000/marklisttask",
				method: "POST",
				dataType: "json",
				data: {description: description, listname: listname, date: date},

				success: function(json) {
					if(json.success){
						self.css("color", "lime");
						//$(this).parent().parent().parent().parent().parent().remove();
					}
					else{
						alert("ERROR")
					}
				}
			})
		});
	}

	function deleteLists(name, button) {
		console.log("CLICK")
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/deletelist',

		    // especifica si será una petición POST o GET
		    type : 'POST',

		    data: {listname: name}, 
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de proyectos
		    success : function(json) {
		        if(json.success){
		        	$(button).parent().parent().parent().remove();
		        }
		    },

	    // código a ejecutar si la petición falla;
	    // son pasados como argumentos a la función
	    // el objeto de la petición y código de estatus de la petición
		    error : function(xhr, status) {
		        alert('Disculpe, existió un problema');
		    },
	 
	    // código a ejecutar sin importar si la petición falló o no
		    // complete : function(xhr, status) {
		    //     alert('Petición realizada');
		    // }
		});

	}

	function deleteTask(name, desc, button) {
		console.log("CLICK")
		$.ajax({
	    // la URL para la petición
		    url : 'http://localhost:3000/deletetask',

		    // especifica si será una petición POST o GET
		    type : 'POST',

		    data: {listname: name, description: desc}, 
		 
		    // el tipo de información que se espera de respuesta
		    dataType : 'json',
	 
	    // código a ejecutar si la petición es satisfactoria;
	    // la respuesta es pasada como argumento a la función

	    	// Tarjeta de proyectos
		    success : function(json) {
		        if(json.success){
		        	$(button).parent().parent().parent().remove();
		        }
		    },

	    // código a ejecutar si la petición falla;
	    // son pasados como argumentos a la función
	    // el objeto de la petición y código de estatus de la petición
		    error : function(xhr, status) {
		        alert('Disculpe, existió un problema');
		    },
	 
	    // código a ejecutar sin importar si la petición falló o no
		    // complete : function(xhr, status) {
		    //     alert('Petición realizada');
		    // }
		});

	}





	// Cargar listas del usuario
	// $.ajax({
	// 	url: "http://localhost:3000/app/misdatos",
	// 	method: "GET",
	// 	dataType: "json",
	// 	//Tarjeta de listas
	//     success : function(json) {
	//         for(var i=0; i<json.lists.length; i++){
	// 	    	var name = json.lists[i].name;
	// 	    	var li = $('<li class="nav-item"> <a class="nav-link" href="/mislistas/'+name+'"><i class="fa fa-list-ul"></i> '+name+'</a> </li>');
	// 			$("#listDefault").append(li);
	// 		}
	//     }
	// });


	//Tarjeta de Proyectos

	//Bucle que coge la longitud del json, 
	//haciendo un if para comprobar si los datos del json son iguales a los datos que estan en los proyectos

 //    for(var i=0; i<json.projects.length; i++){
 //    	var name = json.projects[i].name;
 //    	var startDate = json.projects[i].startDate; 
 //    	var finishDate = json.projects[i].finishDate;

 //    	//Crear variable y capturamos la tarjeta por su id (#hiddenProjectCard),
	// 	//y despues ponemos .clone para hacer un clone de esa tarjeta y almacenar en la variable tarjeta el contenido de la tarjeta 
	// 	var cartaProyectos = $("#hiddenProjectCard").clone();

 //    	for(var j=0; j<json.projects[i].tasks.length; j++){
 //    		var description = json.projects[i].tasks[j].description;
 //    		var state = json.projects[i].tasks[j].state;
		
	// 		//Luego hacemos un removeAttr("hidden") para eliminar el atributo hidden, para así mostrar la tarjeta
	// 		cartaProyectos.removeAttr("hidden");
	// 		//Por ultimo, ponemos .find para buscar dentro del contenido de la tarjeta un elemento por la clase
	// 		//y dentro de él, se le añade un texto
	// 		cartaProyectos.find(".project-card-title span").text(name);
	// 		var li = $('<li class="task-element"><i class="fa fa-check-circle-o"></i> '+description+'</li>');
	// 		cartaProyectos.find(".project-card-body ul").append(li);
	// 		cartaProyectos.find(".project-start-date span").text(startDate);
	// 		// proyectos.find(".project-card-users span").text();
	// 		cartaProyectos.find(".project-expire-date span").text(finishDate);

	// 		//Añade la tarjeta proyectos al dashboard
	// 		$("#proyectos").append(cartaProyectos);
	// 	}
	// }


	//Tarjeta de Listas/Tareas

	//Bucle que coge la longitud del json, 
	//haciendo un if para comprobar si los datos del json son iguales a los datos que estan en las listas
 //    for(var i=0; i<json.lists.length; i++){
 //    	var name = json.lists[i].name;
 //    	var finishDate = json.lists[i].finishDate;
 //    	var description = json.lists[i].description;

 //    	//Crear variable y capturamos la tarjeta por su id (#hiddenTaskCard),
	// 	//y despues ponemos .clone para hacer un clone de esa tarjeta y almacenar en la variable tarjeta el contenido de la tarjeta 
	// 	var cartaListas = $("#hiddenTaskCard").clone();

	// 		//Luego hacemos un removeAttr("hidden") para eliminar el atributo hidden, para así mostrar la tarjeta
	// 		cartaListas.removeAttr("hidden");
	// 		//Por ultimo, ponemos .find para buscar dentro del contenido de la tarjeta un elemento por la clase
	// 		//y dentro de él, se le añade un texto
	// 		cartaListas.find(".task-card-title").text(name);
	// 		cartaListas.find(".task-card-body p").text(description);
	// 		cartaListas.find(".task-expire-date span").text(finishDate);
	// 		//Añade la tarjeta listas/tareas al dashboard
	// 		$("#tareas").append(cartaListas);
	// }
});


