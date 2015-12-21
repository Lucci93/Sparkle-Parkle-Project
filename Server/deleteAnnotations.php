<?php
//scritto da Michele D'onza
require_once "include/Delete.php";

if(isset($_GET['url'])){
	deleteFunction($_GET['url'],'TT',null,null,null);
}
echo("ok");
