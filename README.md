# Base de Datos Avanzadas  
#### Maestría en Ciencia de Datos v2
#### Universidad Católica Boliviana "San Pablo"
#### Guery Favio Ramirez Martinez

## 1.- Proceso de configuración de alta disponibilidad
EL Obejtivo de la creacíon de Replicaset Es proporcionar ALta Disponibilidad de nuestras bases de datos MongoDB. La idea consiste en tener corriendo varias instancias de mongo con el fin de que la información se replique entre ellas, de tal forma que si el nodo primario se cae, pueda ser remplazado automáticamente por otro.
### 1.1 Esquema de Red
![](images/MDB_1.png)

### 1.2 Configuración
EL  sistema base es linux en su version neon, correspondiente a la familia debian de tal forma se realiza la actualización de los repositorios y paquetes 

```
sudo apt update
sudo apt upgrade
```
A ada servidor una dirección IP fija a través de Netplan.
Lo primero será comprobar si ya disponemos de algún archivo de configuración:
```
sudo nano /etc/netplan/50-netcfg.yaml
```
Por ejemplo de la configuración  de unos de los servidores puede ser la siguiente:
```
	network:
	ethernets:
	    enp0s3:
	        addresses: [192.168.1.210/24]
	        dhcp4: no
	        gateway4: 192.168.1.1
	        nameservers:
	            addresses: [8.8.8.8, 8.8.4.4]
	version: 2
```
Una vez guardado nuestra configuración la podemos aplicar con el siguiente comando.
```
 sudo netplan apply 
```
Si durante la instalación del sistema operativo no hemos configurado el hostname correctamente o hemos partido de un clon de otra máquina virtual, lo cambiaremos por el que corresponda.
```
sudo nano /etc/hostname
```
Entonces para el nodo 1 será:
```
mongodb-01
```
Para que este cambio sea persistente a los reinicios editaremos el siguiente archivo.
```
sudo nano /etc/cloud/cloud.cfg
```
Y pondremos el siguiente setting a *true*.

```
preserve_hostname: true
```
También lo cambiaremos en el archivo host:
```
sudo nano /etc/hosts
```
Además de cambiar su nombre, también tenemos que añadir el Hostname y la Dirección IP de los otros dos nodos.
```
    192.168.1.210	mongodb-01
    192.168.1.211   mongodb-02
    192.168.1.212   mongodb-03
```
Se debe reiniciar los servidores para que los cambios se observen.
```
sudo reboot
```
## Instalación de Replica Set

### Instalación de MongoDB
Antes de empezar a configurar el Replica Set se necesita tener instalado MongoDB de forma independiente en cada servidor.

Importar la clave pública utilizada por el sistema de gestión de paquetes.
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
```
Se importa el repositorio de MongoDB.
```
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
```
Se procede con la instalación de MongoDB.
```
sudo apt-get install -y mongodb-org
```
## Configuración del Replica Set

Ahora se procede a realizar todas las configuraciones necesarias para el Replica Set.

Se edita el archivo **mongod.conf** en todos los servidores.
```
sudo nano /etc/mongod.conf
```
Se modifica el siguiente contenido con la dirección IP correspondiente de cada uno.
 1. mongodb-01:
  	net:
  	  port: 27017
  	  bindIp: 192.168.1.210

 1. mongodb-02:
  	net:
  	  port: 27017
  	  bindIp: 192.168.1.211

 1. mongodb-03:
  	net:
  	  port: 27017
  	  bindIp: 192.168.1.212
Y en el mismo archivo se añade el nombre del Replica Set que sera el mismo para todos (**replica01**).
```
replication:
	  replSetName: "replica01"
```
Se habilta el servicio **mongod** para que se inicie automáticamente cuando se arranquen los servidores.
```
sudo systemctl enable mongod.service"
```
Se reinicia el servicio mongod para que actualice los cambios realizados anteriormente en el archivo mongod.conf.
```
sudo systemctl restart mongod.service
```
Uno de los nodos de MongoDB se ejecuta como PRIMARIO (**MASTER**), y todos los demás nodos funcionarán como SECUNDARIO (**SLAVE**). Los datos están siempre en el nodo PRIMARIO y los conjuntos de datos se replican en todos los demás nodos SECUNDARIOS.

Para configurar el Replica Set se inicia la terminal en uno de los nodos.
```
sudo systemctl restart mongod.service
```
Se inicia el conjunto de réplicas en el nodo 1 ejecutando el siguiente comando.
```
rs.initiate()
```
Posteriormente se añade los otros dos nodos al Replica Set.
```
rs.add("mongodb-02")
rs.add("mongodb-03")
```
Se puede comprobar el estado del RPS ejecutando:
```
rs.status()
```
En el caso de que en el nodo 1 se haya puesto la dirección IP en vez de el nombre, podemos cambiarlo ejecutando los siguientes comando:
>
> ```
> cfg = rs.conf()
> cfg.members[0].host = "mongodb-01:27017"
> rs.reconfig(cfg)
> ```

Y el siguiente comando nos dirá cual de los nodos es el MASTER.
```
rs.isMaster()
```
### Probando Alta Disponibilidad
Una vez tenemos configurado nuestro Replica Set solo queda realizar pruebas para ver si realmente funciona.

Ahora procedemos a parar el servicio de mongodb-01.
```
sudo service mongod stop
```
Si refrescamos la conexión se observa como podemos seguir conectándonos y accediendo a nuestro datos pero en este caso el nodo 1 mongodb-01 esta sin conexión, mongodb-02 a pasado a ser el nodo PRIMARIO y mongodb-03 sigue estando como SECUNDARIO. 

## 2.- Diccionario de datos
### Collection clientes 
| Idx | Nombre | Data Type | Descripción|
|---|---|---|---|
| *🔑 ⬋ | <a name='movies.clientes__id'>&#95;id</a>| oid  |
| *| <a name='movies.clientes_nombreCompleto'>nombreCompleto</a>| string  | Nombre completo del cliente|
| *| <a name='movies.clientes_nit'>nit</a>| string  | Nit del cliente|
| *| <a name='movies.clientes_celular'>celular</a>| string  |Celular del cliente|
| *| <a name='movies.clientes_fechaNacimiento'>fechaNacimiento</a>| date  ||
| *| <a name='movies.clientes_direccion'>direccion</a>| string  ||
| *| <a name='movies.clientes_latitud'>latitud</a>| string  ||
| *| <a name='movies.clientes_longitud'>longitud</a>| string  ||
| *| <a name='movies.clientes_createAt'>createAt</a>| date  ||
| *| <a name='movies.clientes_updateAt'>updateAt</a>| date  ||
| *| <a name='movies.clientes_deleted'>deleted</a>| boolean  ||
|  | <a name='movies.clientes_deleteAt'>deleteAt</a>| date  ||
|  | <a name='movies.clientes_bloqueado'>bloqueado</a>| boolean  ||
|  | <a name='movies.clientes_motivoBloqueo'>motivoBloqueo</a>| string  ||
|  | <a name='movies.clientes___v'>&#95;&#95;v</a>| integer  ||
| Indexes 
| 🔑 | &#95;id&#95; || ON &#95;id|

### Collection descuentos 
| Idx | Nombre | Data Type | Descripción|
|---|---|---|---|
| *🔑 ⬋ | <a name='movies.descuentos__id'>&#95;id</a>| oid  |
| *| <a name='movies.descuentos_minimo'>minimo</a>| integer  | mínimo del intervalo|
| *| <a name='movies.descuentos_maximo'>maximo</a>| integer  | máximo del intervalo|
| *| <a name='movies.descuentos_descuento'>descuento</a>| integer  | Porcentaje de descuento|
| Indexes 
| 🔑 | &#95;id&#95; || ON &#95;id|

### Collection prestamos 
| Idx | Nombre | Data Type | Descripción |
|---|---|---|---|
| *🔑 | <a name='movies.prestamos__id'>&#95;id</a>| oid  |
| *⬈ | <a name='movies.prestamos_cliente'>cliente</a>| oid  |Id de la coleccion cliente|
| *⬈ | <a name='movies.prestamos_videos'>videos</a>| array  | Id de la coleccion video|
| *| <a name='movies.prestamos_fechaDevolucion'>fechaDevolucion</a>| date  | Fecha de la devolucion| 
| *| <a name='movies.prestamos_diasPrestamo'>diasPrestamo</a>| integer  | Dias de prestamo|
| *| <a name='movies.prestamos_descuento'>descuento</a>| integer  | Monto calculado del descuento|
| *| <a name='movies.prestamos_importeTotal'>importeTotal</a>| integer  | Monto total con descuento|
| *| <a name='movies.prestamos_devuelto'>devuelto</a>| boolean  | Indica si el video fue devuelto |
| *| <a name='movies.prestamos_createAt'>createAt</a>| date  |
| *| <a name='movies.prestamos_updateAt'>updateAt</a>| date  |
|  | <a name='movies.prestamos_deleted'>deleted</a>| boolean  |
|  | <a name='movies.prestamos_deleteAt'>deleteAt</a>| date  |
|  | <a name='movies.prestamos___v'>&#95;&#95;v</a>| integer  |
| Indexes 
| 🔑 | &#95;id&#95; || ON &#95;id|| Virtual Relations | Vir | Virtual Relation | ( cliente ) ref [movies&#46;descuentos](#descuentos) (&#95;id) 
|| Vir | Fk_prestamos_clientes | ( cliente ) ref [movies&#46;clientes](#clientes) (&#95;id) 
|| Vir | Fk_prestamos_videos | ( videos ) ref [movies&#46;videos](#videos) (&#95;id) 
|

### Collection tarifas 
| Idx | Nombre | Data Type | Descripción|
|---|---|---|---|
| *🔑 | <a name='movies.tarifas__id'>&#95;id</a>| oid  |
| *| <a name='movies.tarifas_dias'>dias</a>| integer  | Cantidad de dias|
| *| <a name='movies.tarifas_costo'>costo</a>| integer  | Costo de la cantidad de dias del prestamo|
| Indexes 
| 🔑 | &#95;id&#95; || ON &#95;id|

### Collection videos 
| Idx | Nombre | Data Type | Descripción |
|---|---|---|---|
| *🔑 ⬋ | <a name='movies.videos__id'>&#95;id</a>| oid  |
| *| <a name='movies.videos_titulo'>titulo</a>| string  | Nombre de la pelicula|
| *| <a name='movies.videos_genero'>genero</a>| array  | Generos de la pelicula|
| *| <a name='movies.videos_anioPublicacion'>anioPublicacion</a>| integer  | Anio de la publicacion de la pelicula|
| *| <a name='movies.videos_duracion'>duracion</a>| integer  | Duración de la película en minutos|
| *| <a name='movies.videos_reparto'>reparto</a>| array  | Principales actores de la pelicula|
|  | <a name='movies.videos_director'>director</a>| string  |Director de la pelicula|
|  | <a name='movies.videos_nominaciones'>nominaciones</a>| object  | Nominaciones y premios de la pelicula|
| *| <a name='movies.videos_nominaciones.wins'>nominaciones&#46;wins</a>| integer  |
| *| <a name='movies.videos_nominaciones.nominations'>nominaciones&#46;nominations</a>| integer  |
| *| <a name='movies.videos_nominaciones.text'>nominaciones&#46;text</a>| string  |
| *| <a name='movies.videos_costoUnitario'>costoUnitario</a>| double  |Costo unitario de la pelicula|
| *| <a name='movies.videos_copias'>copias</a>| integer  |Cantidad de copias adquiridas|
| *| <a name='movies.videos_createAt'>createAt</a>| date  |
| *| <a name='movies.videos_updateAt'>updateAt</a>| date  |
| *| <a name='movies.videos_deleted'>deleted</a>| boolean  |
|  | <a name='movies.videos_deleteAt'>deleteAt</a>| date  |
|  | <a name='movies.videos___v'>&#95;&#95;v</a>| integer  |
| Indexes 
| 🔑 | &#95;id&#95; || ON &#95;id|
## 3.- Mongo DB Agregaciones
### 3.1 Pipeline
### 3.2 Pipeline Operators
### $group
### $match
### $limit
### $skip
### $unwind
### $project

## 4.-Rendimiento y Análisis de Consultas

## 5.- Conclusiones
