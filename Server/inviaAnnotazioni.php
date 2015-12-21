<?php
//scritto da Gabriele Casanova
require_once "include/SparkleScraper.php";
require_once "include/Classi.php";
require_once "include/annotazioni.php";
require_once "include/annotazioniJson.php";
require_once "include/Turtle.php";

if(isset($_GET['url'])){

$scraper=new SparkleScraper($_GET['url']);
$scraper->scrape();
//$scraper->print_all();
$data=$scraper->return_data();
//$data->print_tf_out();


$insieme_anotazioni=create_anniotations($data);
//print_annotations($insieme_anotazioni);

$json=create_all_json($insieme_anotazioni);


$json= preg_replace('~[\r\n]+~', '', $json);//toglie i caratteri di newline che a volte ci si presentano e farebbero crashare tutto
//echo "x=".$json;
//echo $json;

jsonToTurtle($json);


echo "ok";
}

?>
