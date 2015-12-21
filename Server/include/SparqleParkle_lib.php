<?php
/*libreria scritta da Davide Quadrelli per consentire la connessione con il server di Fuseki.
Si è optato per una libreria scritta direttamente da noi piuttosto che EasyRDF o altre perchè
chiedendo direttamente richieste HTTP a Fuseki siamo riusciti sempre ad avere risposte. Utilizzando altre librerie 
siamo riusciti ad avere sempre problemi su problemi. Forse l'errore era elementare, ma così il progetto è ugualmente funzionante,
senza alcuna perdita di prestazioni*/

//funzione per eseguire le INSERT e le DELETE
function sparql_insert_delete($query,$user,$pass){
	$url='http://tweb2015.cs.unibo.it:8080/data/update?user='.$user.'&pass='.$pass;
	//array contenete i parametri della richiesta
	$data = array('update' => $query);
	//array contente le intestazioni della richiesta
	$options = array(
	    'http' => array(
	        'header'  => "Content-type: application/x-www-form-urlencoded",
	        'method'  => 'POST',
	        'content' => http_build_query($data),
	    ),
	);
	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);
	
	return $result;
	//var_dump($result);
}

//funzione per eseguire le SELECT e DESCRIBE
function sparql_query($query){
	$url='http://tweb2015.cs.unibo.it:8080/data/query?query=';
	$query=urlencode($query);
	$opts = array(
  	'http'=>array(
    	'method'=>"GET",
    	'header'=>"Accept-language: en\r\n" .
              "Cookie: foo=bar\r\n"
  		)
	);
	$context = stream_context_create($opts);
	//imposto l'URL delle chiamate con i propri parametri in GET
	$url.=$query."&format=json";
	$result=file_get_contents($url,false,$context);
	return $result;
	//var_dump($result);
}