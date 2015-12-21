<?php
//file scritto da Gabriele Casanova
class coppia{
	public $data,$number;
	function __construct($data,$number){
		$this->data=$data;
		$this->number=$number;
	}
}

/*
restituisce una coppia: se è h3 o h4 e il numero della sua occorrenza, o null se non c'è alcuna occorrenza
*/
function get_next_h3or4_number_couple(&$SparkleScraper,$rhetoric_type){
	$SparkleScraper->XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]//h3 | //body/form/table[3]//table[5]//td[@valign=\"top\"]//h4"); 
	//$set=$SparkleScraper->nodes->each(function ($node){
	//	echo "<br>nodo:<br>";
		//var_dump($node);
		$set=array();
		foreach ($SparkleScraper->nodes as $k=>$domElement) {
		    $set[$k]=$domElement->ownerDocument->saveHTML($domElement);
			
		}
		//return $node->html();
		//return $node->ownerDocument->saveHTML($node);
	//});
	//echo "<br>set:<br>";
	//print_r($set);
	if(empty($set)) return null; //throw new Exception('Sto contando gli h3 e h4 per le retoriche e non dovrebbe mai capitare qua dentro(nessun h3 o h4 trovato nel documento)');
	$n_h3=0;
	$n_h4=0;
	$trovato=false;
	$quello_dopo=false;
	foreach ($set as $key=>$val){
		if($trovato==true){
			//sono nel giro dopo quello trovato
			//se finisce il foreach prima di entrare qua restituisce null
			if(strpos($val,"<h3")!== false)return new coppia("h3",$n_h3+1);
			else if(strpos($val,"<h4")!== false) return  new coppia("h4",$n_h4+1);
		}
		else if(stripos($val,$rhetoric_type) !== false) {
			/*
			l'if serve a non prendere un h3 che contenga per caso il tipo di retorica cercato. Ad esempio se sto cercando le introduction
			e c'è un h3 che contiene quella parola per altri motivi, e quindi non identifica le introduction, non dovrà essere preso.
			il 15 prevede i caratteri del tag <h3></h3>(9 char) e il possibilissimo 1. (3 caratteri) più altri 3 caratteri per sicurezza.
			se effettivamente sono in un h3 che contiene quella parola per caso, mi pare ragionevole pensare che i caratteri extra siano ben più di 15
			*/
			if(mb_strlen($val,"UTF-8")>(mb_strlen($rhetoric_type)+15))return null;
			$trovato=true;
			
		}
		if(strpos($val,"<h3")!== false)	$n_h3++;
		else if(strpos($val,"<h4")!== false) $n_h4++;
		else throw new Exception('Sto contando gli h3 e h4 per le retoriche e non dovrebbe mai capitare qua dentro(elemento corrente non h3 ne h4)');
			
	}
	
	return null;
}



/*
La funzione jet_set_society($alphaville) restituisce tutti i p successivi o precendeti a un h3 o h4
viene usata successivamente per trovare in modo generico tutte le retoriche a parte l'abstract
*/
function get_set(&$SparkleScraper,$rhetoric_type){
	$rhetoric_type2=substr($rhetoric_type, 1);
	//prendo tutti i p successivi all'h3 o h4 contenente il tipo di retorica al quale sono interessato
	$SparkleScraper->XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h3[contains(text(),'$rhetoric_type2')]/following-sibling::p"); 
	$set1=$SparkleScraper->nodes->each(function ($node){
		return $node->text();
	});
	if(empty($set1)){
		$SparkleScraper->XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h4[contains(text(),'$rhetoric_type2')]/following-sibling::p"); 
		$set1=$SparkleScraper->nodes->each(function ($node){
		return $node->text();
	});
	}
	//prendo tutti i p precendenti all'h3 o h4 successivo a quello contenente il tipo di retorica al quale sono interessato
	$coppia=get_next_h3or4_number_couple($SparkleScraper,$rhetoric_type);
	//echo "<br>coppia:<br>";
	//print_r($coppia);
	if($coppia==null) return null;
	$stringa=$coppia->data."[".$coppia->number."]";
	$SparkleScraper->XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/$stringa/preceding-sibling::p"); 
	$set2=$SparkleScraper->nodes->each(function ($node){
		return $node->text();
	});
	if(empty($set2)) throw new Exception("se capito qua non c'è l'h3 con scritto about the author");
	//interseci i 2 insiemi per ottenere solo i p che veramente mi interessano
	$set=array_intersect($set1,$set2);
	/*$s1=count($set1);
	$s2=count($set2);
	$s=count($set);*/
	/*echo"<br> set1:<br>";
	var_dump($set1);
	echo"<br><br>";
	
	echo"<br> set2:<br>";
	var_dump($set2);
	echo"<br><br>";
	echo"<br> set:<br>";
	var_dump($set);
	echo"<br><br>";
	*/
	/*echo "<br>stringa: $stringa<br>";
	echo "<br>set1: $s1<br>";
	echo "<br>set2: $s2<br>";
	echo "<br>set: $s<br>";*/
	$ultimo_p=count($set2);
	$n=count($set);
	$primo_p=$ultimo_p-$n;
	//echo "<br>primo p: $primo_p<br>";
	return new coppia($set,$primo_p);	
}
	
	
function get_associative_arr_key($rhetoric_type){
	if (strcasecmp($rhetoric_type,"introduction")==0) return "intros";
	if (strcasecmp($rhetoric_type,"motivation")==0) return "intros";
	else if (strcasecmp($rhetoric_type,"material")==0)return "maters";
	else if (strcasecmp($rhetoric_type,"method")==0)return "methods";
	else if (strcasecmp($rhetoric_type,"results")==0)return "results";
	else if (strcasecmp($rhetoric_type,"discussion")==0)return "discs";
	else if (strcasecmp($rhetoric_type,"conclusion")==0)return "concs";
	else return null;
}
	
	
	
function set_rhetoric_data(&$SparkleScraper,&$locations,&$start_array,&$end_array,$rhetoric_type){
	//echo "<br>$rhetoric_type<br><br>";
	
	$coppia= get_set($SparkleScraper,$rhetoric_type);
	if($coppia==null){
		//echo "<br>null a sto giro<br>";
		return null;
	}
	$set=$coppia->data;
	$primo_p=$coppia->number;
	$arr_key=get_associative_arr_key($rhetoric_type);
	foreach($set as $i=>$val){
		$pos=$i+$primo_p+1;//+1 dato che $i parte da 0
		$locations[$arr_key][$i]="_p$pos";
		$start_array[$arr_key][$i]=0;
		$end_array[$arr_key][$i]=$start_array[$arr_key][$i]+mb_strlen(trim($val),"UTF-8");
	}
}

?>