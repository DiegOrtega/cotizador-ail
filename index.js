var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

var server = require('http').createServer();
var io = require('socket.io')(server);

var http = require('http');
var ejs = require('ejs');
var fs = require('fs');
var pdf = require('html-pdf');

var moment = require('moment');

var multer  =   require('multer');

var fecha = moment().format('DD/MM/YYYY');

var app = express(); 

app.set('port', (process.env.PORT || 5000)); 

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false}));
app.use(express.static(path.join(__dirname, 'public')));


// Conexión con base de datos remota
var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

var graphenedbURL1 = process.env.GRAPHENEDB_COPPER_BOLT_URL;
var graphenedbUser1 = process.env.GRAPHENEDB_COPPER_BOLT_USER;
var graphenedbPass1 = process.env.GRAPHENEDB_COPPER_BOLT_PASSWORD;

//Variables internas (No mover)

var total_nodos, nombre = null, empresa, telefono, mail, productoArray = [], productoArray2 = [], vendedor = null, num_vendedor, num_cot = 0, descuento, extension, email_vendedor, tiempo_entrega, check, tipo_cambio=18, precio, stock_num, modelo, desc, nombre_p, stock_c, modelo_c, color_grano_c, tiempo_c, precio_c, medida_c, unidad_c, unidad_c, vendedorArray = [],  dir = [], ref=[], indexref = 0, indexref2 = 0,  folio = 0, alerta_cambio = false, alerta_datos = false, alerta_cantidad = false, alerta_descuento = false, cambio_nombre = false, cambio_stock = false, cambio_modelo = false, cambio_tiempo = false, cambio_color = false, cambio_precio = false, cambio_medida = false, cambio_unidad = false, cambio_api = false, cambio_folio = false, alerta_busqueda= false, alerta_carrito = false, alerta_datos2= false, alerta_eliminacion = false, ajuste_busqueda = "" , cont = 0, ajuste_carrito = "", hide1 = '-700px', content = '', alerta_tipo = 'success', ajusteVendedor = "", cont2 = 0, ajusteCliente, color_grano, medida, area, division, familia, marca, banner, ajuste_publicidad;

//Protocolo de conexión para servidor cloud heroku

if(graphenedbURL == undefined){
	var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'Sistemas'));
	var session = driver.session();
	
	session
	.run('MATCH (n:VENDEDOR) RETURN n')
	.then(function(res){
		res.records.forEach(function(record){
			vendedorArray.push({
			id: record._fields[0].properties.ID,	
			nombre: record._fields[0].properties.NOMBRE,
			extension: record._fields[0].properties.EXTENSION,
			correo: record._fields[0].properties.CORREO,
			folio: record._fields[0].properties.FOLIO	
			});
			
		});
		console.log("vendedorArray: ");
		console.log(vendedorArray);
	})
	.catch(function(err){
		console.log(err);
	});
	
}else{
	var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
	var driver1 = neo4j.driver(graphenedbURL1, neo4j.auth.basic(graphenedbUser1, graphenedbPass1));
	var session = driver.session();
	var session1 = driver1.session();
	
	session1
	.run('MATCH (n:VENDEDOR) RETURN n')
	.then(function(res){
		res.records.forEach(function(record){
			vendedorArray.push({
			id: record._fields[0].properties.ID,	
			nombre: record._fields[0].properties.NOMBRE,
			extension: record._fields[0].properties.EXTENSION,
			correo: record._fields[0].properties.CORREO,
			folio: record._fields[0].properties.FOLIO	
			});
		});
		console.log("vendedorArray: ");
		console.log(vendedorArray);
	})
	.catch(function(err){
		console.log(err);
	});
	
};

app.get('/', function(request, response){
	
	hide1 = '0px;';
    content = "Bienvenid@! Puedes comenzar a hacer tu nueva cotización de productos Sika o 3M!";
    alerta_tipo = "success";
	
	ajuste_busqueda = "";
    ajuste_carrito = "";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
    
	session
		.run('MATCH (n) RETURN count(n)')
		.then(function(result){
        
			  	result.records.forEach(function(record){
				total_nodos = record._fields[[0]].low; 
				}); 
	
	response.render('pages/3m', {
					desplegar: total_nodos,
					nombre: nombre,
					empresa: empresa,
					telefono: telefono,
					mail: mail,
					productos: productoArray,
					prod_agregados: productoArray2,
					vendedor: vendedor,
					num_vendedor: num_vendedor,
					num_cot: num_cot,
					extension: extension,
					email_vendedor: email_vendedor,
					tiempo_entrega: tiempo_entrega,
					tipo_cambio: tipo_cambio,
					fecha: fecha, 
					precio: precio,
					stock_num: stock_num,
					desc: desc,
					modelo: modelo,
					vendedorArray: vendedorArray,
					dir: dir,
                    indexref: indexref,
                    indexref2: indexref2,
					folio: folio,
                    alerta_cambio: alerta_cambio,
                    alerta_datos: alerta_datos,
                    alerta_busqueda: alerta_busqueda,
                    alerta_carrito: alerta_carrito,
                    alerta_datos2: alerta_datos2,
                    alerta_cantidad: alerta_cantidad, 
                    alerta_descuento: alerta_descuento,
                    cambio_nombre: cambio_nombre, 
                    cambio_stock: cambio_stock, 
                    cambio_modelo: cambio_modelo, 
                    cambio_tiempo: cambio_tiempo, 
                    cambio_color: cambio_color, 
                    cambio_precio: cambio_precio,
                    cambio_medida: cambio_medida, 
                    cambio_unidad: cambio_unidad, 
                    cambio_api: cambio_api,
                    cambio_folio: cambio_folio,
                    alerta_eliminacion: alerta_eliminacion,
                    ajuste_busqueda: ajuste_busqueda,
                    ajuste_carrito: ajuste_carrito,
                    hide1: hide1,
                    content: content,
                    alerta_tipo: alerta_tipo,
                    ajusteVendedor: ajusteVendedor,
                    ajusteCliente: ajusteCliente,
					color_grano: color_grano,
					medida: medida,
					area: area,
					division: division,
					familia: familia,
					marca: marca,
					banner: banner,
					ajuste_publicidad: ajuste_publicidad
				});
		
		})
		.catch(function(err){
		console.log(err);
		})
});

app.get('/3m', function(req, res) {
    
    hide1 = '0px;';
    content = "Bienvenid@! Puedes comenzar a hacer tu nueva cotización de productos Sika o 3M!";
    alerta_tipo = "success";
	
	ajuste_busqueda = "";
    ajuste_carrito = "";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
    
	session
		.run('MATCH (n) RETURN count(n)')
		.then(function(result){
        
			  	result.records.forEach(function(record){
				total_nodos = record._fields[[0]].low; 
				}); 
				
				res.render('pages/3m', {
					desplegar: total_nodos,
					nombre: nombre,
					empresa: empresa,
					telefono: telefono,
					mail: mail,
					productos: productoArray,
					prod_agregados: productoArray2,
					vendedor: vendedor,
					num_vendedor: num_vendedor,
					num_cot: num_cot,
					extension: extension,
					email_vendedor: email_vendedor,
					tiempo_entrega: tiempo_entrega,
					tipo_cambio: tipo_cambio,
					fecha: fecha, 
					precio: precio,
					stock_num: stock_num,
					desc: desc,
					modelo: modelo,
					vendedorArray: vendedorArray,
					dir: dir,
                    indexref: indexref,
					indexref2: indexref2,
					folio: folio,
                    alerta_cambio: alerta_cambio,
                    alerta_datos: alerta_datos,
                    alerta_busqueda: alerta_busqueda,
                    alerta_carrito: alerta_carrito,
                    alerta_datos2: alerta_datos2,
                    alerta_cantidad: alerta_cantidad, 
                    alerta_descuento: alerta_descuento,
                    cambio_nombre: cambio_nombre, 
                    cambio_stock: cambio_stock, 
                    cambio_modelo: cambio_modelo, 
                    cambio_tiempo: cambio_tiempo, 
                    cambio_color: cambio_color, 
                    cambio_precio: cambio_precio,
                    cambio_medida: cambio_medida, 
                    cambio_unidad: cambio_unidad, 
                    cambio_api: cambio_api,
                    cambio_folio: cambio_folio,
                    alerta_eliminacion: alerta_eliminacion,
                    ajuste_busqueda: ajuste_busqueda,
                    ajuste_carrito: ajuste_carrito,
                    hide1: hide1,
                    content: content,
                    alerta_tipo: alerta_tipo,
                    ajusteVendedor: ajusteVendedor,
                    ajusteCliente: ajusteCliente,
					color_grano: color_grano,
					medida: medida,
					area: area,
					division: division,
					familia: familia,
					marca: marca,
					banner: banner,
					ajuste_publicidad: ajuste_publicidad
				});
		
		})
		.catch(function(err){
		console.log(err);
		})
});

app.post('/contacto/add', function(req, res){
	nombre = req.body.contacto_nombre;
	empresa = req.body.contacto_empresa;
	telefono = req.body.contacto_tel;
	mail = req.body.contacto_mail;
    
    ajuste_busqueda = "";
    ajuste_carrito = "";
    ajusteVendedor = "";
    ajusteCliente = "show";
	ajuste_publicidad = "";
    
    hide1 = '0px;';
    content = "Esta cotización es para " + nombre + " Ahora busca los productos que necesites y seleccionalos!";
    alerta_tipo = "success";
	
	console.log("nombre: "+nombre+" empresa: "+empresa+" telefono: "+telefono+" mail: "+mail);

		res.render('pages/3m', {
				desplegar: total_nodos,
				nombre: nombre,
				empresa: empresa,
				telefono: telefono,
				mail: mail,
				productos: productoArray,
				prod_agregados: productoArray2,
				vendedor: vendedor,
				num_vendedor: num_vendedor,
				num_cot: num_cot,
				extension: extension,
				email_vendedor: email_vendedor,
				tiempo_entrega: tiempo_entrega,
				tipo_cambio: tipo_cambio,
				fecha: fecha, 
				precio: precio,
				stock_num: stock_num,
				desc: desc,
				modelo: modelo,
				vendedorArray: vendedorArray,
				dir: dir,
                indexref: indexref,
				indexref2: indexref2,
				folio: folio,
                alerta_cambio: alerta_cambio,
                alerta_datos: alerta_datos,
                alerta_busqueda: alerta_busqueda,
                alerta_carrito: alerta_carrito,
                alerta_datos2: alerta_datos2,
                alerta_cantidad: alerta_cantidad, 
                alerta_descuento: alerta_descuento,
                cambio_nombre: cambio_nombre, 
                cambio_stock: cambio_stock, 
                cambio_modelo: cambio_modelo, 
                cambio_tiempo: cambio_tiempo, 
                cambio_color: cambio_color, 
                cambio_precio: cambio_precio,
                cambio_medida: cambio_medida, 
                cambio_unidad: cambio_unidad, 
                cambio_api: cambio_api,
                cambio_folio: cambio_folio,
                alerta_eliminacion: alerta_eliminacion,
                ajuste_busqueda: ajuste_busqueda,
                ajuste_carrito: ajuste_carrito,
                hide1: hide1,
                content: content,
                alerta_tipo: alerta_tipo,
                ajusteVendedor: ajusteVendedor,
                ajusteCliente: ajusteCliente,
				color_grano: color_grano,
				medida: medida,
				area: area,
				division: division,
				familia: familia,
				marca: marca,
				banner: banner,
				ajuste_publicidad: ajuste_publicidad
		});
});

app.post('/marca/add', function(req, res){
	marca = req.body.marca;
	
	productoArray2 = [];
    
    content = "Estarás cotizando la marca " + marca + "!";
    alerta_tipo = "success";
    
    dir = [];
	
	ajuste_busqueda = "show";
    ajuste_carrito = "";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	console.log('marca: ' + marca );
	
	res.render('pages/3m', {
				desplegar: total_nodos,
				nombre: nombre,
				empresa: empresa,
				telefono: telefono,
				mail: mail,
				productos: productoArray,
				prod_agregados: productoArray2,
				vendedor: vendedor,
				num_vendedor: num_vendedor,
				num_cot: num_cot,
				extension: extension,
				email_vendedor: email_vendedor,
				tiempo_entrega: tiempo_entrega,
				tipo_cambio: tipo_cambio,
				fecha: fecha, 
				precio: precio,
				stock_num: stock_num,
				desc: desc,
				modelo: modelo,
				vendedorArray: vendedorArray,
				dir: dir,
                indexref: indexref,
				folio: folio,
                alerta_cambio: alerta_cambio,
                alerta_datos: alerta_datos,
                alerta_busqueda: alerta_busqueda,
                alerta_carrito: alerta_carrito,
                alerta_datos2: alerta_datos2,
                alerta_cantidad: alerta_cantidad, 
                alerta_descuento: alerta_descuento,
                cambio_nombre: cambio_nombre, 
                cambio_stock: cambio_stock, 
                cambio_modelo: cambio_modelo, 
                cambio_tiempo: cambio_tiempo, 
                cambio_color: cambio_color, 
                cambio_precio: cambio_precio,
                cambio_medida: cambio_medida, 
                cambio_unidad: cambio_unidad, 
                cambio_api: cambio_api,
                cambio_folio: cambio_folio,
                alerta_eliminacion: alerta_eliminacion,
                ajuste_busqueda: ajuste_busqueda,
                ajuste_carrito: ajuste_carrito,
                hide1: hide1,
                content: content,
                alerta_tipo: alerta_tipo,
                ajusteVendedor: ajusteVendedor,
                ajusteCliente: ajusteCliente,
				color_grano: color_grano,
				medida: medida,
				area: area,
				division: division,
				familia: familia,
				marca: marca,
				banner: banner,
				ajuste_publicidad: ajuste_publicidad
		});
	
});

app.post('/busqueda/add', function(req, res){
    
    ajuste_carrito = "";
    ajusteVendedor = "";
    ajusteCliente = "";
    ajuste_busqueda = "show";
	ajuste_publicidad = "";
	
	if(marca == "3M"){
		
	var stock_num = req.body.stock;
	var desc = req.body.desc;
	var modelo = req.body.modelo;
	var color_grano = req.body.color_grano;
	var medida = req.body.medida;
	var area = req.body.area;
	var division = req.body.division;
	var familia = req.body.familia;
	
	
    cont = 1 + cont;
    
    hide1 = '0px;';
    
	if(stock_num == ''){stock_num = null};
	if(desc == ''){desc = null};
	if(modelo == ''){modelo = null};
	if(color_grano == ''){color_grano = null};
	if(medida == ''){medida = null};
	if(area == ''){area = null};
	if(division == ''){division = null};
	if(familia == ''){familia = null};
	
	console.log(stock_num +" "+ desc+" "+modelo+" "+color_grano+" "+medida);
	
	session
		.run("MATCH (n {LABEL:'Producto3M'}) WHERE n.STOCK =~ {stock_1} OR n.AREA =~ {area} OR n.COLOR_GRANO =~ {color_grano} OR n.AIL_CODIGO_SAE =~ {key} OR n.CORMA_CODIGO_SAE =~{key} OR n.DESCRIPCION_AMPLIA1 =~{key} OR n.DESCRIPCION_AMPLIA2 =~{key} OR n.DESCRIPCION_AMPLIA3 =~{key} OR n.DESCUENTO =~{key} OR n.DIVISION =~{division} OR n.FAMILIA =~{familia} OR n.MODELO =~ {modelo} OR n.NOMBRE =~{key} OR n.PIEZAS_CAJA =~{key} OR n.STOCK2 =~ {stock_1} OR n.UPC =~ {key} OR n.PRESENTACION_MEDIDA  =~ {medida} RETURN n LIMIT 100", {stock_1: ".*"+stock_num+".*", key: ".*(?i)"+desc+".*", modelo:".*(?i)"+modelo+".*", color_grano:".*(?i)"+color_grano+".*", medida:".*(?i)"+medida+".*", area:".*(?i)"+area+".*", division:".*(?i)"+division+".*", familia:".*(?i)"+familia+".*"  })
		.then(function(result2){
			result2.records.forEach(function(record){
				productoArray.push({
					id: record._fields[0].identity.low,
					ail_codigo_sae: record._fields[0].properties.AIL_CODIGO_SAE,
					area: record._fields[0].properties.AREA,
					color_grano: record._fields[0].properties.COLOR_GRANO,
					corma_codigo_sae: record._fields[0].properties.CORMA_CODIGO_SAE,
					descripcion_amplia1: record._fields[0].properties.DESCRIPCION_AMPLIA1,
					descripcion_amplia2: record._fields[0].properties.DESCRIPCION_AMPLIA2,
					descripcion_amplia3: record._fields[0].properties.DESCRIPCION_AMPLIA3,
					descuento: record._fields[0].properties.DESCUENTO,
					divisa: record._fields[0].properties.DIVISA,
					division: record._fields[0].properties.DIVISION,
					familia: record._fields[0].properties.FAMILIA,
					fotos: record._fields[0].properties.FOTOS,
					fotos2: record._fields[0].properties.FOTOS2,
					id_db: record._fields[0].properties.ID,
					modelo: record._fields[0].properties.MODELO,
					nombre: record._fields[0].properties.NOMBRE,
					pdf: record._fields[0].properties.PDF,
					PDF2: record._fields[0].properties.PDF2,
					piezas_caja: record._fields[0].properties.PIEZAS_CAJA,
					piezas_minimas: record._fields[0].properties.PIEZAS_MINIMAS,
					precio_distribuidor_especial: record._fields[0].properties.PRECIO_DISTRIBUIDOR_ESPECIAL,
					precio_distribuidor_mxn: record._fields[0].properties.PRECIO_DISTRIBUIDOR_MXN,
					precio_distribuidor_usd: record._fields[0].properties.PRECIO_DISTRIBUIDOR_USD,
					precio_lista_unidad_mxn: record._fields[0].properties.PRECIO_LISTA_UNIDAD_MXN,
					precio_lista_unidad_usd: record._fields[0].properties.PRECIO_LISTA_UNIDAD_USD,
					presentacion_medida: record._fields[0].properties.PRESENTACION_MEDIDA,
					promocion: record._fields[0].properties.PROMOCION,
					stock: record._fields[0].properties.STOCK,
					stock2: record._fields[0].properties.STOCK2,
					tiempo_entrega: record._fields[0].properties.TIEMPO_ENTREGA,
					tipo_servicio: record._fields[0].properties.TIPO_SERVICIO,
					unidad_medida: record._fields[0].properties.UNIDAD_MEDIDA,
					upc: record._fields[0].properties.UPC,
					venta_caja: record._fields[0].properties.VENTA_CAJA,
					cantidad: 1,
				});	
			});
	console.log("tamaño de respuesta de busqueda = " + productoArray.length);

			if(productoArray.length < 1 ){
				content = "No se encontró ningún producto con esa descripción.";
				alerta_tipo = "warning";
			}else{
				content = "Búsqueda exitosa! Selecciona los productos que quieres cotizar. El tamaño del resultado es de " + productoArray.length + " productos.";
				
				alerta_tipo = "success";
			}

			res.render('pages/3m', {
				desplegar: total_nodos,
				nombre: nombre,
				empresa: empresa,
				telefono: telefono,
				mail: mail,
				productos: productoArray,
				prod_agregados: productoArray2,
				vendedor: vendedor,
				num_vendedor: num_vendedor,
				num_cot: num_cot,
				extension: extension,
				email_vendedor: email_vendedor,
				tiempo_entrega: tiempo_entrega,
				tipo_cambio: tipo_cambio,
				fecha: fecha, 
				precio: precio,
				stock_num: stock_num,
				desc: desc,
				modelo: modelo,
				vendedorArray: vendedorArray,
				dir: dir,
				indexref: indexref,
				indexref2: indexref2,
				folio: folio,
				alerta_cambio: alerta_cambio,
				alerta_datos: alerta_datos,
				alerta_busqueda: alerta_busqueda,
				alerta_carrito: alerta_carrito,
				alerta_datos2: alerta_datos2,
				alerta_cantidad: alerta_cantidad, 
				alerta_descuento: alerta_descuento,
				cambio_nombre: cambio_nombre, 
				cambio_stock: cambio_stock, 
				cambio_modelo: cambio_modelo, 
				cambio_tiempo: cambio_tiempo, 
				cambio_color: cambio_color, 
				cambio_precio: cambio_precio,
				cambio_medida: cambio_medida, 
				cambio_unidad: cambio_unidad, 
				cambio_api: cambio_api,
				cambio_folio: cambio_folio,
				alerta_eliminacion: alerta_eliminacion,
				ajuste_busqueda: ajuste_busqueda,
				ajuste_carrito: ajuste_carrito,
				hide1: hide1,
				content: content,
				alerta_tipo: alerta_tipo,
				ajusteVendedor: ajusteVendedor,
				ajusteCliente: ajusteCliente,
				color_grano: color_grano,
				medida: medida,
				area: area,
				division: division,
				familia: familia,
				marca: marca,
				banner: banner,
				ajuste_publicidad: ajuste_publicidad
			});

			productoArray = [];

		 console.log("tamaño de respuesta de busqueda = " + productoArray.length);


		})
		.catch(function(err){
		console.log(err);
		})
		 		
	}else if(marca == "Sika"){
		
		var stock_num = req.body.stock;
		var desc = req.body.desc;
		var medida = req.body.medida;
        var modelo = req.body.modelo;

		console.log('marca: ' + marca );

		cont = 1 + cont;

		hide1 = '0px;';

		if(stock_num == ''){stock_num = null};
		if(desc == ''){desc = null};
		if(modelo == ''){modelo = null};
		if(color_grano == ''){color_grano = null};
		if(medida == ''){medida = null};
		if(area == ''){area = null};
		if(division == ''){division = null};
		if(familia == ''){familia = null};

		console.log(stock_num +" "+ desc+" "+modelo+" "+color_grano+" "+medida);
		
		session
		.run("MATCH (n {LABEL:'ProductoSika'}) WHERE n.CODIGO =~ {stock_1} OR n.DESCRIPCION =~{key} OR n.MODELO =~ {modelo} OR n.NOMBRE =~{key} OR n.KG_MTS =~{medida} OR n.LITROS =~{medida} RETURN n LIMIT 10", {stock_1: ".*"+stock_num+".*", key: ".*(?i)"+desc+".*", modelo:".*(?i)"+modelo+".*", color_grano:".*(?i)"+color_grano+".*", medida:".*(?i)"+medida+".*", area:".*(?i)"+area+".*", division:".*(?i)"+division+".*", familia:".*(?i)"+familia+".*"  })
		.then(function(result2){
			result2.records.forEach(function(record){
				productoArray.push({
					id: record._fields[0].identity.low,
					nombre: record._fields[0].properties.NOMBRE,
					descripcion: record._fields[0].properties.DESCRIPCION,
					kg_mts: record._fields[0].properties.KG_MTS,
					iva: record._fields[0].properties.IVA,
					codigo: record._fields[0].properties.CODIGO,
					litros: record._fields[0].properties.LITROS,
					precio_lista: record._fields[0].properties.PRECIO_LISTA,
					divisa: record._fields[0].properties.DIVISA,
					total: record._fields[0].properties.TOTAL,
					cantidad: 1,
					id_db: record._fields[0].properties.ID,
					modelo: record._fields[0].properties.MODELO
				});	
			});
	
			console.log("tamaño de respuesta de busqueda = " + productoArray.length);

			if(productoArray.length < 1 ){
				content = "No se encontró ningún producto con esa descripción";
				alerta_tipo = "warning";
			}else{
				content = "Búsqueda exitosa! Selecciona los productos que quieres cotizar";
				alerta_tipo = "success";
			}

			res.render('pages/3m', {
				desplegar: total_nodos,
				nombre: nombre,
				empresa: empresa,
				telefono: telefono,
				mail: mail,
				productos: productoArray,
				prod_agregados: productoArray2,
				vendedor: vendedor,
				num_vendedor: num_vendedor,
				num_cot: num_cot,
				extension: extension,
				email_vendedor: email_vendedor,
				tiempo_entrega: tiempo_entrega,
				tipo_cambio: tipo_cambio,
				fecha: fecha, 
				precio: precio,
				stock_num: stock_num,
				desc: desc,
				modelo: modelo,
				vendedorArray: vendedorArray,
				dir: dir,
				indexref: indexref,
				indexref2: indexref2,
				folio: folio,
				alerta_cambio: alerta_cambio,
				alerta_datos: alerta_datos,
				alerta_busqueda: alerta_busqueda,
				alerta_carrito: alerta_carrito,
				alerta_datos2: alerta_datos2,
				alerta_cantidad: alerta_cantidad, 
				alerta_descuento: alerta_descuento,
				cambio_nombre: cambio_nombre, 
				cambio_stock: cambio_stock, 
				cambio_modelo: cambio_modelo, 
				cambio_tiempo: cambio_tiempo, 
				cambio_color: cambio_color, 
				cambio_precio: cambio_precio,
				cambio_medida: cambio_medida, 
				cambio_unidad: cambio_unidad, 
				cambio_api: cambio_api,
				cambio_folio: cambio_folio,
				alerta_eliminacion: alerta_eliminacion,
				ajuste_busqueda: ajuste_busqueda,
				ajuste_carrito: ajuste_carrito,
				hide1: hide1,
				content: content,
				alerta_tipo: alerta_tipo,
				ajusteVendedor: ajusteVendedor,
				ajusteCliente: ajusteCliente,
				color_grano: color_grano,
				medida: medida,
				area: area,
				division: division,
				familia: familia,
				marca: marca,
				banner: banner,
				ajuste_publicidad: ajuste_publicidad
			});

			productoArray = [];

		 console.log("tamaño de respuesta de busqueda = " + productoArray.length);


		})
		.catch(function(err){
		console.log(err);
		})
	
	};
});

app.post('/carrito/add', function(req, res){
	var carrito = req.body.agregar;
    
    ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	if(check == carrito){
		productoArray2.splice(productoArray2.length - 1, 1);
	};
	
	check = carrito;
    
    cont = 0;
    
    if( ajuste_busqueda == "show"){
        ajuste_busqueda = "";
        cont = 0;
    };
    
    hide1 = '0px;';
    
    alerta_tipo = "success";
    
    if ( marca == "3M"){
		
	session	
		.run("MATCH (n {STOCK: {carrito}, LABEL:'Producto3M'}) RETURN n LIMIT 1 ", {carrito: carrito})
		.then(function(result3){
		result3.records.forEach(function(record){
				productoArray2.push({
					id: record._fields[0].identity.low,
					ail_codigo_sae: record._fields[0].properties.AIL_CODIGO_SAE,
					area: record._fields[0].properties.AREA,
					color_grano: record._fields[0].properties.COLOR_GRANO,
					corma_codigo_sae: record._fields[0].properties.CORMA_CODIGO_SAE,
					descripcion_amplia1: record._fields[0].properties.DESCRIPCION_AMPLIA1,
					descripcion_amplia2: record._fields[0].properties.DESCRIPCION_AMPLIA2,
					descripcion_amplia3: record._fields[0].properties.DESCRIPCION_AMPLIA3,
					descuento: record._fields[0].properties.DESCUENTO,
					divisa: record._fields[0].properties.DIVISA,
					division: record._fields[0].properties.DIVISION,
					familia: record._fields[0].properties.FAMILIA,
					fotos: record._fields[0].properties.FOTOS,
					fotos2: record._fields[0].properties.FOTOS2,
					id_db: record._fields[0].properties.ID,
					modelo: record._fields[0].properties.MODELO,
					nombre: record._fields[0].properties.NOMBRE,
					pdf: record._fields[0].properties.PDF,
					PDF2: record._fields[0].properties.PDF2,
					piezas_caja: record._fields[0].properties.PIEZAS_CAJA,
					piezas_minimas: record._fields[0].properties.PIEZAS_MINIMAS,
					precio_distribuidor_especial: record._fields[0].properties.PRECIO_DISTRIBUIDOR_ESPECIAL,
					precio_distribuidor_mxn: record._fields[0].properties.PRECIO_DISTRIBUIDOR_MXN,
					precio_distribuidor_usd: record._fields[0].properties.PRECIO_DISTRIBUIDOR_USD,
					precio_lista_unidad_mxn: record._fields[0].properties.PRECIO_LISTA_UNIDAD_MXN,
					precio_lista_unidad_usd: record._fields[0].properties.PRECIO_LISTA_UNIDAD_USD,
					presentacion_medida: record._fields[0].properties.PRESENTACION_MEDIDA,
					promocion: record._fields[0].properties.PROMOCION,
					stock: record._fields[0].properties.STOCK,
					stock2: record._fields[0].properties.STOCK2,
					tiempo_entrega: record._fields[0].properties.TIEMPO_ENTREGA,
					tipo_servicio: record._fields[0].properties.TIPO_SERVICIO,
					unidad_medida: record._fields[0].properties.UNIDAD_MEDIDA,
					upc: record._fields[0].properties.UPC,
					venta_caja: record._fields[0].properties.VENTA_CAJA,
					cantidad: 1,
					precio_descuento: null,
					precio_cantidad: null,
					mxn_ref: null
				});	
            
			});
		
		productoArray2.forEach(function(producto2, index){
            
            if(producto2.nombre != undefined){
            content = "Agregaste " + (producto2.nombre).substring(0, 75) + "..." + " a tu cotización";
            }else{
                producto2.nombre = "No definido";
                content = "Agregaste un producto a tu cotización";
            }
            
            
			if(producto2.precio_lista_unidad_mxn != undefined){
				producto2.mxn_ref = producto2.precio_lista_unidad_mxn;
				console.log('mxn_ref: ' + producto2.mxn_ref);
			}else{
				console.log("mxn_ref: " + producto2.mxn_ref);
			};
            
            if (ref[index] != 1 ){
                var dir_min = 'http://www.ail.com.mx/imgprod/'+producto2.id_db+'-'+producto2.modelo+'.jpg';
                dir[index] = dir_min.toLowerCase().replace(/\s+/g, '');  
            }else if(ref[index] == 1 ){
                dir[index] = '/img/uploads/'+indexref+'.jpg';
            }
            
            
		});
		
		console.log("productos dentro de carrito = " + productoArray2.length);
		
		 if( alerta_carrito == true){
            alerta_carrito = false;
        }else if( alerta_carrito == false){  
            alerta_carrito = true;
        };
		
		res.render('pages/3m', {
				desplegar: total_nodos,
				nombre: nombre,
				empresa: empresa,
				telefono: telefono,
				mail: mail,
				productos: productoArray,
				prod_agregados: productoArray2,
				vendedor: vendedor,
				num_vendedor: num_vendedor,
				num_cot: num_cot,
				extension: extension,
				email_vendedor: email_vendedor,
				tiempo_entrega: tiempo_entrega,
				tipo_cambio: tipo_cambio,
				fecha: fecha, 
				precio: precio,
				stock_num: stock_num,
				desc: desc,
				modelo: modelo,
				vendedorArray: vendedorArray,
				dir: dir,
                indexref: indexref,
				indexref2: indexref2,
				folio: folio,
                alerta_cambio: alerta_cambio,
                alerta_datos: alerta_datos,
                alerta_busqueda: alerta_busqueda,
                alerta_carrito: alerta_carrito,
                alerta_datos2: alerta_datos2,
                alerta_cantidad: alerta_cantidad, 
                alerta_descuento: alerta_descuento,
                cambio_nombre: cambio_nombre, 
                cambio_stock: cambio_stock, 
                cambio_modelo: cambio_modelo, 
                cambio_tiempo: cambio_tiempo, 
                cambio_color: cambio_color, 
                cambio_precio: cambio_precio,
                cambio_medida: cambio_medida, 
                cambio_unidad: cambio_unidad, 
                cambio_api: cambio_api,
                cambio_folio: cambio_folio,
                alerta_eliminacion: alerta_eliminacion,
                ajuste_busqueda: ajuste_busqueda,
                ajuste_carrito: ajuste_carrito,
                hide1: hide1,
                content: content,
                alerta_tipo: alerta_tipo,
                ajusteVendedor: ajusteVendedor,
                ajusteCliente: ajusteCliente,
				color_grano: color_grano,
				medida: medida,
				area: area,
				division: division,
				familia: familia,
				marca: marca,
				banner: banner,
				ajuste_publicidad: ajuste_publicidad
		});
       
		
		})
		.catch(function(err){
		console.log(err);
		})
	
	}else if(marca == "Sika"){
		
		session	
		.run("MATCH (n {CODIGO: {carrito}, LABEL:'ProductoSika'}) RETURN n LIMIT 1 ", {carrito: carrito})
		.then(function(result3){
		result3.records.forEach(function(record){
				productoArray2.push({
					id: record._fields[0].identity.low,
					nombre: record._fields[0].properties.NOMBRE,
					descripcion: record._fields[0].properties.DESCRIPCION,
					kg_mts: record._fields[0].properties.KG_MTS,
					iva: record._fields[0].properties.IVA,
					codigo: record._fields[0].properties.CODIGO,
					litros: record._fields[0].properties.LITROS,
					precio_lista: record._fields[0].properties.PRECIO_LISTA,
					divisa: record._fields[0].properties.DIVISA,
					total: record._fields[0].properties.TOTAL,
					cantidad: 1,
					id_db: record._fields[0].properties.ID,
					modelo: record._fields[0].properties.MODELO,
					piezas_caja: record._fields[0].properties.CANT_MIN,
					precio_cantidad: 0 ,
					precio_descuento: 0,
					precio_lista_unidad_mxn: 0 ,
					precio_lista_unidad_usd: 0 ,
					descuento: 0,
				});	
            
			});
		
		productoArray2.forEach(function(producto2, index){
            
            if(producto2.nombre != undefined){
                content = "Agregaste " + (producto2.nombre).substring(0, 75) + "..." + " a tu cotización";
            }else{
                producto2.nombre = "No definido";
                content = "Agregaste un producto a tu cotización";
            }
            
			if(producto2.precio_lista_unidad_mxn != undefined){
				producto2.mxn_ref = producto2.precio_lista_unidad_mxn;
				console.log('mxn_ref: ' + producto2.mxn_ref);
			}else{
				console.log("mxn_ref: " + producto2.mxn_ref);
			};
            
            if (ref[index] != 1 ){
                var dir_min = 'http://www.ail.com.mx/imgprod/'+producto2.id_db+'-'+producto2.modelo+'.jpg';
                dir[index] = dir_min.toLowerCase().replace(/\s+/g, '');  
            }else if(ref[index] == 1 ){
                dir[index] = '/img/uploads/'+indexref+'.jpg';
            }
            
            
		});
		
		console.log("productos dentro de carrito = " + productoArray2.length);
		
		 if( alerta_carrito == true){
            alerta_carrito = false;
        }else if( alerta_carrito == false){  
            alerta_carrito = true;
        };
		
		res.render('pages/3m', {
				desplegar: total_nodos,
				nombre: nombre,
				empresa: empresa,
				telefono: telefono,
				mail: mail,
				productos: productoArray,
				prod_agregados: productoArray2,
				vendedor: vendedor,
				num_vendedor: num_vendedor,
				num_cot: num_cot,
				extension: extension,
				email_vendedor: email_vendedor,
				tiempo_entrega: tiempo_entrega,
				tipo_cambio: tipo_cambio,
				fecha: fecha, 
				precio: precio,
				stock_num: stock_num,
				desc: desc,
				modelo: modelo,
				vendedorArray: vendedorArray,
				dir: dir,
                indexref: indexref,
				indexref2: indexref2,
				folio: folio,
                alerta_cambio: alerta_cambio,
                alerta_datos: alerta_datos,
                alerta_busqueda: alerta_busqueda,
                alerta_carrito: alerta_carrito,
                alerta_datos2: alerta_datos2,
                alerta_cantidad: alerta_cantidad, 
                alerta_descuento: alerta_descuento,
                cambio_nombre: cambio_nombre, 
                cambio_stock: cambio_stock, 
                cambio_modelo: cambio_modelo, 
                cambio_tiempo: cambio_tiempo, 
                cambio_color: cambio_color, 
                cambio_precio: cambio_precio,
                cambio_medida: cambio_medida, 
                cambio_unidad: cambio_unidad, 
                cambio_api: cambio_api,
                cambio_folio: cambio_folio,
                alerta_eliminacion: alerta_eliminacion,
                ajuste_busqueda: ajuste_busqueda,
                ajuste_carrito: ajuste_carrito,
                hide1: hide1,
                content: content,
                alerta_tipo: alerta_tipo,
                ajusteVendedor: ajusteVendedor,
                ajusteCliente: ajusteCliente,
				color_grano: color_grano,
				medida: medida,
				area: area,
				division: division,
				familia: familia,
				marca: marca,
				banner: banner,
				ajuste_publicidad: ajuste_publicidad
		});
       
		
		})
		.catch(function(err){
		console.log(err);
		})
	}
	
});

app.post('/eliminacion/add', function(req, res){
	var eliminar = req.body.eliminar;
	//console.log(productoArray2[0].id);
	//console.log("eliminar = " + eliminar);
	console.log(productoArray2.length);
    
    ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
    
    hide1 = '0px;';
    
    alerta_tipo = "warning";
	
	var i = 0;
	
	while(i < productoArray2.length){
        
		if(productoArray2[i].id == eliminar){
            content = "Eliminaste " + (productoArray2[i].nombre).substring(0, 15) + "..." + " de tu cotización";
            
			productoArray2.splice(i, 1);
		};
		console.log(i);
		i++;
	};
	
	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            hide1: hide1,
            content: content,
            alerta_tipo: alerta_tipo,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
		});
});


app.post('/datos/add', function(req, res){
	index = req.body.index;
	
    
    ajuste_busqueda = "";
    ajuste_carrito = "";
    ajusteVendedor = "show";
    ajusteCliente = "";
	ajuste_publicidad = "";
    
    hide1 = '0px;';
    alerta_tipo = "success";
    
	vendedorArray.forEach(function(vendedores, indexRef){
		if(index == indexRef){
			vendedor = vendedores.nombre;
			num_vendedor = vendedores.id;
			num_cot = vendedores.folio;
			extension = vendedores.extension;
			email_vendedor = vendedores.correo;
            content = 'Bienvenid@ ' + vendedor + " Ahora crea el folio de la cotización";
		};
	});
	
	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            hide1: hide1,
            content: content,
            alerta_tipo: alerta_tipo,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
		});
});

var html = fs.readFileSync(__dirname + '/views/pages/cotizacion.ejs', 'utf8');


console.log('file://'+ __dirname + '/public');

app.post('/download', function(req, res){
	
	var options = { 
    	height: "16in",        // allowed units: mm, cm, in, px 
  		width: "16in",	
		base: 'file:///Users/DiegOrtega/Desktop/cotizador/cotizador-3m/public',
	};
	
	var obj = {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
		};
	
	var renderedhtml = ejs.render(html, obj);
    
    pdf.create(renderedhtml, options).toFile('./cotizacion.pdf', function(err, response) {
  		if (err) return console.log(err);
  		console.log(response); 
        res.download('./cotizacion.pdf');
	}); 
	
});

app.get('/pdfprevio', function(req, res){
		productoArray2.forEach(function(producto2, index){
            
            alerta_tipo = "success";
			
			if(marca == "3M"){
				
				var mxn = producto2.precio_lista_unidad_mxn;
				var usd = producto2.precio_lista_unidad_usd;
				var desc_ref = producto2.descuento;
				
				if(usd != undefined){
				var n = usd.indexOf('$');   
                    
				console.log("mxn: " + mxn);
				console.log("usd: " + usd);
				console.log('$:' + n);

				if(producto2.mxn_ref != undefined){ 
					
					var m = mxn.indexOf('$');

					console.log("precio: " + mxn);
					
					mxn = mxn.substring(m+1, mxn.length );
					
					var desc_ref2 = parseFloat(desc_ref);
					
					console.log("desc_ref2: " + desc_ref2); 
					
					var diferencia = (parseFloat(mxn)*((desc_ref2)/100));
					
					console.log("diferencia:"+ diferencia);
					
					console.log("mxn: " + mxn);
					
					producto2.precio_descuento = (mxn - diferencia).toFixed(2);
					
					console.log("precio c/ descuento: " + producto2.precio_descuento);
					
					console.log("cantidad: " + producto2.cantidad);
					
					var cantidad_num = parseFloat(producto2.cantidad);
					
					producto2.precio_cantidad = ((mxn - diferencia)*cantidad_num).toFixed(2);

			 	}else if(n != -1 && producto2.mxn_ref == undefined){
                    

					var usd2 = usd.substring(n+1, usd.length);
					
					console.log("transf = " + usd2);
					
					var cambio_usd = parseFloat(usd2);
					
					producto2.precio_lista_unidad_mxn = (cambio_usd*tipo_cambio).toFixed(2);
					
					var precio_mxn = cambio_usd*tipo_cambio;
					
					var desc_ref2 = parseFloat(desc_ref);
					
					console.log("desc_ref2: " + desc_ref2); 
					
					var diferencia = (precio_mxn*((desc_ref2)/100));
					
					console.log("diferencia:"+ diferencia);
					
					producto2.precio_descuento = (precio_mxn - diferencia).toFixed(2); 
					
					console.log("cantidad: " + producto2.cantidad);
					
					var cantidad_num = parseFloat(producto2.cantidad);
					
					producto2.precio_cantidad = (producto2.precio_descuento*cantidad_num).toFixed(2);
					
					var tipo_cambio_ref = tipo_cambio;

				 }else if(usd == undefined){
                     var m = mxn.indexOf('$');

					console.log("precio: " + mxn);
					
					mxn = mxn.substring(m+1, mxn.length );
					
					var desc_ref2 = parseFloat(desc_ref);
					
					console.log("desc_ref2: " + desc_ref2); 
					
					var diferencia = (parseFloat(mxn)*((desc_ref2)/100));
					
					console.log("diferencia:"+ diferencia);
					
					console.log("mxn: " + mxn);
					
					producto2.precio_descuento = (mxn - diferencia).toFixed(2);
					
					console.log("precio c/ descuento: " + producto2.precio_descuento);
					
					console.log("cantidad: " + producto2.cantidad);
					
					var cantidad_num = parseFloat(producto2.cantidad);
					
					producto2.precio_cantidad = ((mxn - diferencia)*cantidad_num).toFixed(2);
                 };	
			};
                
            if(producto2.precio_cantidad == undefined){
               producto2.precio_cantidad = "No definido"; 
            };
                
            if(producto2.precio_distribuidor_especial == undefined){
                producto2.precio_distribuidor_especial = "No definido";
            };
                
            if(producto2.precio_descuento == undefined){
                producto2.precio_descuento = "No definido";
            }      
				
			}else if(marca == "Sika"){
				
					var desc_ref = producto2.descuento;
				
					if( producto2.divisa == "MXN"){
						
						var mxn = producto2.precio_lista;
						
						producto2.precio_lista_unidad_mxn = producto2.precio_lista;
						
						var m = mxn.indexOf('$');

						console.log("precio: " + mxn);

						mxn = mxn.substring(m+1, mxn.length );
						
						producto2.precio_lista_unidad_usd = (mxn/tipo_cambio).toFixed(2);

						var desc_ref2 = parseFloat(desc_ref);

						console.log("desc_ref2: " + desc_ref2); 

						var diferencia = (parseFloat(mxn)*((desc_ref2)/100));

						console.log("diferencia:"+ diferencia);

						console.log("mxn: " + mxn);

						producto2.precio_descuento = (mxn - diferencia).toFixed(2);

						console.log("precio c/ descuento: " + producto2.precio_descuento);

						console.log("cantidad: " + producto2.cantidad);

						var cantidad_num = parseFloat(producto2.cantidad);

						producto2.precio_cantidad = ((mxn - diferencia)*cantidad_num).toFixed(2);
						
						console.log('producto2.precio_cantidad: ' + producto2.precio_cantidad);
						
					}else if(producto2.divisa == "USD"){
						
						var usd = producto2.precio_lista;
						
						producto2.precio_lista_unidad_usd = producto2.precio_lista;
				
						var n = usd.indexOf('$');

						console.log("mxn: " + mxn);
						console.log("usd: " + usd);
						console.log('$:' + n);

						if(n != -1){

						var usd2 = usd.substring(n+1, usd.length);

						console.log("transf = " + usd2);

						var cambio_usd = parseFloat(usd2);

						producto2.precio_lista_unidad_mxn = (cambio_usd*tipo_cambio).toFixed(2);

						var precio_mxn = cambio_usd*tipo_cambio;

						var desc_ref2 = parseFloat(desc_ref);

						console.log("desc_ref2: " + desc_ref2); 

						var diferencia = (precio_mxn*((desc_ref2)/100));

						console.log("diferencia:"+ diferencia);

						producto2.precio_descuento = (precio_mxn - diferencia).toFixed(2); 

						console.log("cantidad: " + producto2.cantidad);

						var cantidad_num = parseFloat(producto2.cantidad);

						producto2.precio_cantidad = (producto2.precio_descuento*cantidad_num).toFixed(2);

						var tipo_cambio_ref = tipo_cambio;	
					};
				 };	
				
			};
             
            console.log('dir['+ index +']:' + dir[index]);
            if(ref[index] != 1 ){
                var dir_min = 'http://www.ail.com.mx/imgprod/'+producto2.id_db+'-'+producto2.modelo+'.jpg';
                dir[index] = dir_min.toLowerCase().replace(/\s+/g, '');
            }else if(ref[index] == 1){
                dir[index] = '/img/uploads/'+indexref2+'.jpg';
            }; 
            console.log('dir['+ index +']:' + dir[index]);
				 
		});
	
   res.render('pages/cotizacion',{
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
            indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            hide1: hide1,
            content: content,
            alerta_tipo: alerta_tipo,
	   		color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
	   		marca: marca,
	   		banner: banner,
	   		ajuste_publicidad: ajuste_publicidad
   }); 
});

app.post('/tipo_cambio/add', function(req, res){
	tipo_cambio = req.body.tipo_cambio;
    
    hide1 = '0px;';
    alerta_tipo = "success";
    content = "Tipo de cambio actualizado a " + tipo_cambio + " MXN por cada dólar.";
	
	ajuste_busqueda = "";
    ajuste_carrito = "";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
    
    console.log('alerta_cambio: ' + alerta_cambio);
	
	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            hide1: hide1,
            content: content,
            alerta_tipo: alerta_tipo,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
		});
    
});

app.post('/cantidad/add', function(req, res){
	
	cantidad = req.body.cantidad;
	var index = req.body.index;
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			producto2.cantidad = cantidad;
            if(producto2.nombre != undefined){
            content = "Haz seleccionado " + cantidad + " unidades de " + (producto2.nombre).substring(0, 15);
            }else{
             content = "Haz seleccionado " + cantidad + " unidades de un producto.;"
            }
            
		}
	});

    
	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            hide1: hide1,
            content: content,
            alerta_tipo: alerta_tipo,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
		});
	
});

app.post('/descuento/add', function(req, res){
	
	descuento = req.body.descuento;
	var index = req.body.index;
	
	console.log("index: " + index);
    
    
    ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("descuento: " + descuento);
			producto2.descuento = descuento;
            
            if( parseInt(descuento) < 10){
                content = "Haz otorgado " + descuento + "% de descuento al producto " + (producto2.nombre).substring(0, 15) + "...";
                alerta_tipo = "success";
            }else{
                content = "Haz otorgado " + descuento + "% de descuento al producto " + (producto2.nombre).substring(0, 15) + "...";
                alerta_tipo = "warning";
            }    
		}
	});
	
	descuento = 0;
	
	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            hide1: hide1,
            content: content,
            alerta_tipo: alerta_tipo,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
		});
	
});

app.post('/cambio_nombre/add', function(req,res){
	var nombre_p = req.body.nombre;
	var index = req.body.index;
	
    alerta_tipo = "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
    
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("nombre_p: " + nombre_p);
            if(producto2.nombre != undefined){
            content = "Cambiaste el nombre " + (producto2.nombre).substring(0, 75) + "..." + " por " + nombre_p;
            }else{
                content = "Cambiaste el nombre a un producto por " + nombre_p;
            }
            
			producto2.nombre = nombre_p; 
		}
	});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            content: content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post('/cambio_stock/add', function(req,res){
	var stock_c = req.body.stock;
	var index = req.body.index;
    
    alerta_tipo = "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("stock_c: " + stock_c);
			if(marca == "3M"){
				producto2.stock = stock_c;
			}else if(marca == "Sika"){
				producto2.codigo = stock_c;
			}
            
    content = "Cambiaste el nombre el # de stock de" + (producto2.nombre).substring(0, 15) + "..." + " por " + stock_c;
		}
	});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            content: content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post('/cambio_modelo/add', function(req,res){
	var modelo_c = req.body.modelo;
	var index = req.body.index;
    
    alerta_tipo = "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("modelo_c: " + modelo_c);
			producto2.modelo = modelo_c;
            content = "Cambiaste el modelo de:" + (producto2.nombre).substring(0, 15) + "..." + " por " + modelo_c; 
		}
	});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            content: content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post('/cambio_tiempo/add', function(req,res){
	var tiempo_c = req.body.tiempo;
	var index = req.body.index;
    
    alerta_tipo = "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("tiempo_c: " + tiempo_c);
			producto2.tiempo_entrega = tiempo_c;
            content = "Cambiaste en " + tiempo_c + " días el tiempo de entrega de " + (producto2.nombre).substring(0, 15) + "..."; 
		}
	});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            content: content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post('/cambio_color_grano/add', function(req,res){
	var color_grano_c = req.body.color_grano;
	var index = req.body.index;
    
    alerta_tipo: "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("color_grano_c: " + color_grano_c);
			if(marca == "3M"){
				producto2.color_grano = color_grano_c;
			}else if( marca =="Sika"){
				producto2.kg_mts = color_grano_c;
			};
			
            content: "Cambiaste el Color/grano de " + (producto2.nombre).substring(0, 15) + "..." +  " por " +  color_grano_c;
		}
	});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            content: content,
            alerta_tipo: alerta_tipo,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post('/cambio_precio_usd/add', function(req,res){
	var precio_c = req.body.precio;
	var index = req.body.index;
    
    alerta_tipo = "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2,i){
			var mxn = producto2.precio_lista_unidad_mxn;
			var usd = producto2.precio_lista_unidad_usd;
			var desc_ref = producto2.descuento;	
		
            content = "Cambiaste el precio al producto " + (producto2.nombre).substring(0, 15) + "...";
        
			if(index == i){	
				console.log("i: " + i );
				console.log("precio_c: " + precio_c);
				usd = precio_c;
				producto2.precio_lista_unidad_usd = usd;
			};
		
			if(usd != undefined){
				var n = usd.indexOf('$');
				
				console.log("mxn: " + mxn);
				console.log("usd: " + usd);
				console.log('$:' + n);

				if(producto2.mxn_ref != undefined){ 
					
					var m = mxn.indexOf('$');

					console.log("precio: " + mxn);
					
					mxn = mxn.substring(m+1, mxn.length );
					
					var desc_ref2 = parseFloat(desc_ref);
					
					console.log("desc_ref2: " + desc_ref2); 
					
					var diferencia = (parseFloat(mxn)*((desc_ref2)/100));
					
					console.log("diferencia:"+ diferencia);
					
					console.log("mxn: " + mxn);
					
					producto2.precio_descuento = (mxn - diferencia).toFixed(2);
					
					console.log("precio c/ descuento: " + producto2.precio_descuento);
					
					console.log("cantidad: " + producto2.cantidad);
					
					var cantidad_num = parseFloat(producto2.cantidad);
					
					producto2.precio_cantidad = ((mxn - diferencia)*cantidad_num).toFixed(2);

			 	}else if(n != -1 && producto2.mxn_ref == undefined){

					var usd2 = usd.substring(n+1, usd.length);
					
					console.log("transf = " + usd2);
					
					var cambio_usd = parseFloat(usd2);
					
					producto2.precio_lista_unidad_mxn = (cambio_usd*tipo_cambio).toFixed(2);
					
					var precio_mxn = cambio_usd*tipo_cambio;
					
					var desc_ref2 = parseFloat(desc_ref);
					
					console.log("desc_ref2: " + desc_ref2); 
					
					var diferencia = (precio_mxn*((desc_ref2)/100));
					
					console.log("diferencia:"+ diferencia);
					
					producto2.precio_descuento = (precio_mxn - diferencia).toFixed(2); 
					
					console.log("cantidad: " + producto2.cantidad);
					
					var cantidad_num = parseFloat(producto2.cantidad);
					
					producto2.precio_cantidad = (producto2.precio_descuento*cantidad_num).toFixed(2);
					
					var tipo_cambio_ref = tipo_cambio;

				 }else{
					 
					 console.log("transf = " + usd);
					
					var cambio_usd = parseFloat(usd);
					
					producto2.precio_lista_unidad_mxn = (cambio_usd*tipo_cambio).toFixed(2);
					
					var precio_mxn = cambio_usd*tipo_cambio;
					
					var desc_ref2 = parseFloat(desc_ref);
					
					console.log("desc_ref2: " + desc_ref2); 
					
					var diferencia = (precio_mxn*((desc_ref2)/100));
					
					console.log("diferencia:"+ diferencia);
					
					producto2.precio_descuento = (precio_mxn - diferencia).toFixed(2); 
					
					console.log("cantidad: " + producto2.cantidad);
					
					var cantidad_num = parseFloat(producto2.cantidad);
					
					producto2.precio_cantidad = (producto2.precio_descuento*cantidad_num).toFixed(2);
					
					var tipo_cambio_ref = tipo_cambio;
					 
				 };	
			}
				 
		});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            content: content,
            alerta_tipo: alerta_tipo,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post('/cambio_medida/add', function(req,res){
	var medida_c = req.body.medida;
	var index = req.body.index;
    
    alerta_tipo = "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("medida_c: " + medida_c);
			if(marca == "3M"){
				producto2.presentacion_medida = medida_c;
			}else if(marca == "Sika"){
				producto2.litros = medida_c;
			}
			
            content = "Cambiaste la medida del producto " + (producto2.nombre).substring(0, 15) + "..." + " por " + medida_c;
		}
	});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,   
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            content: content,
            alerta_tipo: alerta_tipo,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post('/cambio_unidad/add', function(req,res){
	var unidad_c = req.body.unidad;
	var index = req.body.index;
    
    alerta_tipo = "warning";
	
	ajuste_busqueda = "";
    ajuste_carrito = "show";
    ajusteVendedor = "";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
	productoArray2.forEach(function(producto2, i){
		if(index == i){	
			console.log("i: " + i );
			console.log("unidad_c: " + unidad_c);
			producto2.unidad_medida = unidad_c;
            content = "Cambiaste la unidad de " + (producto2.nombre).substring(0, 15) + "..." + " por " + unidad_c;
		}
	});
	
	res.render('pages/3m', {
            desplegar: total_nodos,
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            mail: mail,
            productos: productoArray,
            prod_agregados: productoArray2,
            vendedor: vendedor,
            num_vendedor: num_vendedor,
            num_cot: num_cot,
            extension: extension,
            email_vendedor: email_vendedor,
            tiempo_entrega: tiempo_entrega,
            tipo_cambio: tipo_cambio,
            fecha: fecha, 
            precio: precio,
            stock_num: stock_num,
            desc: desc,
            modelo: modelo,
            vendedorArray: vendedorArray,
            dir: dir,
            indexref: indexref,
			indexref2: indexref2,
            folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            content: content,
            alerta_tipo: alerta_tipo,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

//Image upload
	var storage = multer.diskStorage({
	  destination: function (req, file, callback) {
		callback(null, './public/img/uploads');
	  },
	  filename: function (req, file, callback) {  
		callback(null, file.originalname + '.jpg')
		indexref = file.originalname;
		 console.log('indexref ' + indexref); 
	  }
	});

	var upload = multer({ storage : storage}).single('producto');


app.post('/publicidad/photo', function(req,res){

    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
		
        var index = req.body.index;
		
		console.log('index ' + index);
		
		if(index == "Banner"){
			
			console.log('indexref2 = ' + indexref  );
			
			banner =  '/img/uploads/'+indexref+'.jpg';
			
			content = "Agregaste el Banner " + indexref;
		   	alerta_tipo = "warning";  
			
			ajuste_busqueda = "";
			ajuste_carrito = "";
			ajusteVendedor = "";
			ajusteCliente = "";
			ajuste_publicidad = "show";
			
			console.log("Banner!!");
			
		}
    
        	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            content: content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
    }); 
	
});
	
	app.post('/api/photo', function(req,res){
	
	upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
		
        var index = req.body.index;
		
		console.log('index ' + index);
		
		if(index != "Banner"){
			
			console.log('index: ' + index);
        
			dir[index] = '/img/uploads/'+indexref+'.jpg';
			indexref2 = indexref;
			ref[index] = 1;
			console.log('dir[index]: ' +  dir[index]);
			console.log('dir: ' +  dir);

			productoArray2.forEach(function(producto2, i){
				if(index == i){	
				   content = "Cambiaste la foto de " + (producto2.nombre).substring(0, 15) + "..." + " por " + indexref;
				   alerta_tipo = "warning";    
				}
			});
			
			
			console.log("FOTO!!");
		};
    
        	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            content: content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
    });
});

app.post('/folio', function(req, res){
	folio = parseInt(req.body.folio);
	folio = folio + 1;
	num_cot = folio;
	
	ajuste_busqueda = "";
    ajuste_carrito = "";
    ajusteVendedor = "show";
    ajusteCliente = "";
	ajuste_publicidad = "";
	
    content = "El folio de esta cotización es " + folio + " Ahora ingresa los datos del cliente!";
    
	console.log('folio: ' + folio);
	
	if(graphenedbURL == undefined){
		
			session
			.run('MATCH (n:VENDEDOR) WHERE n.NOMBRE = {nombre} SET n.FOLIO = {folio} ', {nombre: vendedor, folio: folio })
			.then(function(res){
				console.log('res: \n' + res);
				res.records.forEach(function(record){
					console.log('folio grabado: ' + record);
			});
			})
			.catch(function(err){
				console.log(err);
			});
		
	}else{
				  
		session1
			.run('MATCH (n:VENDEDOR) WHERE n.NOMBRE = {nombre} SET n.FOLIO = {folio} ', {nombre: vendedor, folio: folio })
			.then(function(res){
				console.log('res: ' + res);
				res.records.forEach(function(record){
					console.log('folio grabado: ' + record);
			});
				
			})	
			.catch(function(err){
				console.log(err);
			});		  
		
	};
	
	
	res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            hide1: hide1,
            content:content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
	
});

app.post("/tiempo/entrega", function(req, res){
        tiempo_entrega = req.body.tiempo_entrega;
	
		productoArray2.forEach(function(producto2, i){
				console.log("i: " + i );
				console.log("tiempo_c: " + tiempo_entrega);
				producto2.tiempo_entrega = tiempo_entrega;
				content = "Cambiaste en " + tiempo_entrega + " días el tiempo de entrega de " + (producto2.nombre).substring(0, 15) + "..."; 
		});
    
        ajuste_busqueda = "";
        ajuste_carrito = "";
        ajusteVendedor = "show";
        ajusteCliente = "";
		ajuste_publicidad = ""
    
        content = "Tiempo de entrega de " + tiempo_entrega + " días";    
         
         res.render('pages/3m', {
			desplegar: total_nodos,
			nombre: nombre,
			empresa: empresa,
			telefono: telefono,
			mail: mail,
			productos: productoArray,
			prod_agregados: productoArray2,
			vendedor: vendedor,
			num_vendedor: num_vendedor,
			num_cot: num_cot,
			extension: extension,
			email_vendedor: email_vendedor,
			tiempo_entrega: tiempo_entrega,
			tipo_cambio: tipo_cambio,
			fecha: fecha, 
			precio: precio,
			stock_num: stock_num,
			desc: desc,
			modelo: modelo,
			vendedorArray: vendedorArray,
			dir: dir,
            indexref: indexref,
			indexref2: indexref2,
			folio: folio,
            alerta_cambio: alerta_cambio,
            alerta_datos: alerta_datos,
            alerta_busqueda: alerta_busqueda,
            alerta_carrito: alerta_carrito,
            alerta_datos2: alerta_datos2,
            alerta_cantidad: alerta_cantidad, 
            alerta_descuento: alerta_descuento,
            cambio_nombre: cambio_nombre, 
            cambio_stock: cambio_stock, 
            cambio_modelo: cambio_modelo, 
            cambio_tiempo: cambio_tiempo, 
            cambio_color: cambio_color, 
            cambio_precio: cambio_precio,
            cambio_medida: cambio_medida, 
            cambio_unidad: cambio_unidad, 
            cambio_api: cambio_api,
            cambio_folio: cambio_folio,
            alerta_eliminacion: alerta_eliminacion,
            ajuste_busqueda: ajuste_busqueda,
            ajuste_carrito: ajuste_carrito,
            ajusteVendedor: ajusteVendedor,
            ajusteCliente: ajusteCliente,
            alerta_tipo: alerta_tipo,
            hide1: hide1,
            content:content,
			color_grano: color_grano,
			medida: medida,
			area: area,
			division: division,
			familia: familia,
			marca: marca,
			banner: banner,
			ajuste_publicidad: ajuste_publicidad
	});
});

//Otras cotizadores


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
