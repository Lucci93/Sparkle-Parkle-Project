 <?php
 require_once "include/Turtle.php";
 //http://tweb2015.cs.unibo.it:8080/data/query?query=SELECT%20?s%20?p%20?o%20FROM%20%3Chttp://vitali.web.cs.unibo.it/raschietto/graph/ltw1521%3E%20WHERE%20{?s%20?p%20?o.}&format=json

if(isset($_POST['json'])){
	try{
		echo(jsonToTurtle($_POST['json']));
	}catch(Exception $e){
		echo("error");
	}
}
else echo("error");