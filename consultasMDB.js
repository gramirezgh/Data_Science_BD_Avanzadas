///////  RETORNAR EL DETALLE DE UN PRESTAMO  ////

var pipeline = [

{
    $unwind : "$video"
},
{
    $unwind: "$cliente"
},
{
    $unwind: "$costo"
},
{
    $group : {_id:"$_id", video:{$push:"$video"}, cliente:{$push:"$cliente"}, costo:{$push:"$costo"}}
    
}
]

db.getCollection("prestamos").aggregate(pipeline)


////// PARA UN USUARIO EN PARTICULAR EL HISTORIAL DE CUANTAS VECES ALQUILO CADA PELICULA ///

var pipeline =[

{
    $unwind: "$video"
},
{
    $unwind: "$cliente"
},
{
    $match:{"cliente.nombreCompleto": /^Oros/}
},
{
    $group : {_id:"$_id", video:{$push:"$video"}, cliente:{$push:"$cliente"}}
    
}

]

db.getCollection("prestamos").aggregate(pipeline)

///// RANKIN DE LAS PELICULAS MAS PRESTADAS ////
var pipeline =[
{
    $unwind: "$video"
},
{
    $match:{"cantidadDePeliculas": {$gte:4}}
},
{
    $group : {_id:"$_id", videos:{$push:"$video"}}
    
}
]

db.getCollection("prestamos").aggregate(pipeline)

/////////////////////////////// ANALISIS Y RENDIMIENTO DE LAS CONSULTAS /////////////
///// BRINDA UN DETALLE DE LA CONSULTA A EJECUTARSE CON SUS DIFERENTES PARAMETRICAS /////
db.prestamos.find(
{cantidadDePeliculas:{$gte:2, $lte:5}}
).explain("executionStats")


/* 
    NO EXISTE LA POSIBILIDAD DE CREAR INDEX CLUSTERED A PARTIR DE LA VERSION DE MONGO 4.0.6
    EN VERSIONES ANTERIORES EXISTE LA POSIBILIDAD DE CREAR DICHOS INDICES SEGUN LA DOCUMENTACION
    EN EL SIGUIENTE LINK : https://jira.mongodb.org/browse/SERVER-3294   

*/



