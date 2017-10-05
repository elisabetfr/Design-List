$(document).ready(function(){

//JSON
//Capturar los inputs(user y login) y creacion de variables para capturar los botones
	// //Captura boton Iniciar sesion
	// var submit= $("#submit");
	// //Variable donde se encuentra el json
	// var json= localStorage.getItem(7);
	// json = JSON.parse(json);
	// //Click del boton Iniciar sesion
	// submit.on("click", function(e){
	// 	var email= $("#email").val();
	// 	var password= $("#password").val();
	// 	e.preventDefault();
	// 	//If para comprobar si email y contraseña son correctos o no
	// 	if(json.email==email && json.password==password) {
	// 		console.log("Usuario correcto")
	// 		window.location.href = "dashboard.html";
	// 	} else {
	// 		console.log("Usuario incorrecto")
	// 	}
	// })
	
	

	//Comparar si el contenido de los inputs es igual al json 

	//Input submit
	// $('#submit').submit(function(){
	//   var email = $('[name="email"]').val();

	//   //AJAX call to your API
	//   $.ajax({
	//     url: 'http://localhost:3000/',
	//     success: function(data) {
	//         // Note: this code is only executed when the AJAX call is successful.
	//         if(data.results.userNumber == userNum){
	//             $('#navBarFirstName').text(data.results.person.firstName);
	//         }
	//     },
	//     error: function (err) {
	//       //If the AJAX call fails, this will be executed.
	//       console.error(err); 
	//     }
	//     dataType: 'JSON'
	//   });

	//   return false; //Prevents the page refresh if an action is already set on the form.
	// });



	// function pintarTarjetas(tipo) {
	// 	//Peticion web que muestra el json
	// 	$.ajax({
   
	// 	    url : 'http://localhost:3000/'+json,
	// 	    type : 'GET',
	// 	    dataType : 'json',
	// 	    success : function(json) {
	// 	        console.log(json);

	// 	        //Bucle que coge la longitud del json, 
	// 	        //haciendo un if para comprobar si los datos de email y password del json son iguales a los que estan en el dashboard
	// 	        for(var i=0; i<json.length; i++){
	// 	        	if(json[i].category.toLowerCase() == categoria) {
		        		
	// 	        	}
	// 	        }
	// 	    },

	// 	    error : function(xhr, status) {
	// 	        alert('Disculpe, existió un problema');
	// 	    },
	// 	    complete : function(xhr, status) {
	// 	        //alert('Petición realizada');
	// 	    }
	// 	});

	//  	return false;
	// }


});