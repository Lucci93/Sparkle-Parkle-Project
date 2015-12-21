<?php
//scritto da Davide Quadrelli, non piu' utilizzato, ma non si sa mai
require_once "include/SparqleParkle_lib.php";
if (isset($_GET['query'])){
	$answer=sparql_query($_GET['query']);
	echo isset($_GET['callback'])?"{$_GET['callback']}($answer)":$answer;
}