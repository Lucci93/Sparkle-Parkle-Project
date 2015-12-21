<?php
//file fatto da gabriele Casanova
class resources{
	public $id, $label;

	function __construct($id, $label){
		$this->id=$id;//nome risorsa visto dalla macchina
		$this->label=$label;// nome in lingua umana della risorsa
	}
}

class body{
    public $subject, $predicate, $label, $resources,$literal;
	//loggetto è o una stringa (literal) o una risorsa
	function  __construct($label,$subject,$predicate,$resources=null,$literal=""){
		$this->label=$label; 
		$this->subject=$subject;
		$this->predicate=$predicate;
		$this->resources=$resources;
		$this->literal=$literal;
	}
	

}

class annotation{
	public $type, $label, $body;

	function __construct($type,$label,$body){
		$this->type=$type;//tipo (es hasDOI hasAuthor hasPublicationYear hasTitle hasURL)
		$this->label=$label;// stringa del tipo Lautore è nomeautore
		$this->body=$body;
	}
}

class target{
	public $source, $id , $start, $end;

	function __construct($source,$id,$start=0,$end=0){
		$this->source=$source;//provenienza articolo (url completo della pagina)
		$this->id=$id;//percorso_tra_underscore_per_raggiunger_il_nodo_partendo_da_dentro_il_body
		$this->start=$start;//inizio parte da colorare partedo dal nodo che ne contiene il testo
		$this->end=$end;//fine parte da colorare
	}
}

class author_of_annotation{
	public $name, $email;
	function __construct($name,$email){
		$this->name=$name;
		$this->email=$email;
		
		
	}
}

class provenance{
	public $author, $time;
	function __construct($author,$time){
		$this->author=$author;//autore dell annotazione
		$this->time=$time;//data dell annotazione in formato: YYYY-MM-DDTHH:MM
	}		

}

class annotations{//contenitore delle annotazioni multiple
	public $annotation=array() ,$target, $provenance;
	
	
	function __construct($annotation,$target,$provenance){
		$this->target=$target;
		$this->provenance=$provenance;
		foreach($annotation as $singleann)
		$this->annotation[]=$singleann;
	}
}

	//restituisce l'etichetta dell oggetto del body partendo dal tipo di annotazione
	function find_body_etiquette($annotationtype){
		switch ($annotationtype){
			case 'hasTitle': return "object";
			case 'hasPublicationYear': return "literal";
			case 'hasAuthor': return "resource";
			case 'hasDOI': return "literal";
			case 'denotesRhetoric': return "resource";
			case 'hasURL': return "literal";
			case 'cities': return "resource";
			case 'hasComment': return "resource";
			default: return "unknown etiquette";
		}
	}
	//prende il nome di un autore e ne restituisce l'id della risorsa come chiesto dalle specifiche
	function find_resource_id($nomeautore){
		$out=array();
		if(strcmp($nomeautore,"")==0) return "";
				
		//questa perte converte le elttere accentate, con umlaut o altre cose in lettere normali (copia e incolla da internet)(considerava ascii esteso, utile solo a metà quindi)
		//$pattern = array("'é'", "'è'", "'ë'", "'ê'", "'É'", "'È'", "'Ë'", "'Ê'", "'á'", "'à'", "'ä'", "'â'", "'å'", "'Á'", "'À'", "'Ä'", "'Â'", "'Å'", "'ó'", "'ò'", "'ö'", "'ô'", "'Ó'", "'Ò'", "'Ö'", "'Ô'", "'í'", "'ì'", "'ï'", "'î'", "'Í'", "'Ì'", "'Ï'", "'Î'", "'ú'", "'ù'", "'ü'", "'û'", "'Ú'", "'Ù'", "'Ü'", "'Û'", "'ý'", "'ÿ'", "'Ý'", "'ø'", "'Ø'", "'œ'", "'Œ'", "'Æ'", "'ç'", "'Ç'", "'ß'");
		//$replace = array('e', 'e', 'e', 'e', 'E', 'E', 'E', 'E', 'a', 'a', 'a', 'a', 'a', 'A', 'A', 'A', 'A', 'A', 'o', 'o', 'o', 'o', 'O', 'O', 'O', 'O', 'i', 'i', 'i', 'I', 'I', 'I', 'I', 'I', 'u', 'u', 'u', 'u', 'U', 'U', 'U', 'U', 'y', 'y', 'Y', 'o', 'O', 'a', 'A', 'A', 'c', 'C', 'b'); 
		//$out= preg_replace($pattern, $replace, $nomeautore);
		$temp=replaceEverything($nomeautore);
		
		//questa perte converte le maiuscole in minuscole
		$temp=strtolower($temp);
		
		//fine utilizzo cose prese da internet, inizio cose al 100% di testa mia
		
		//questa parte trasforma il nome completo come richiesto dalle specifiche: se il nome completo ha 3 parti o più di prendono la prima come nome e le ultime 2 come cognome e poi si prende l'iniziale del nome - cognome
		$temp=explode(" ",$temp);
		//dato che sostituisco la punteggiatura con spazio(se la sostituissi con niente N.Cognome diventerebbe un'unica parte) devo ignorare le celle dell'array che contengono stringa vuota (nel caso avessi invece N. Cognome)
		foreach($temp as $val){
			if($val!=""){
				$out[]=$val;
			}
		}
		
		$tmp="";
		$nparti=count($out);
		$tmp.=substr($out[0] ,0,1)."-";
		if($nparti==2) $tmp.=$out[1];
		else $tmp.=$out[$nparti-2].$out[$nparti-1];
		
		
		return "http://vitali.web.cs.unibo.it/raschietto/person/".$tmp;
		//return "rsch:".$tmp;
	}
	
	
	//restituisce il predicato partendo dal tipo di annotazione
	function find_predicate($annotationtype){
	if($annotationtype=="hasAuthor") return "dcterms:creator";
	else if($annotationtype=="hasPublicationYear") return "fabio:hasPublicationYear";
	else if($annotationtype=="hasTitle") return "dcterms:title";
	else if($annotationtype=="hasDOI") return "prism:doi";
	else if($annotationtype=="hasURL") return "fabio:hasURL";
	else if($annotationtype=="hasComment") return "schema:comment";
	else if($annotationtype=="denotesRhetoric") return "sem:denotes";
	else if($annotationtype=="cites") return "cito:cites";
	else return "";
	}

	
	
	//partendo dal tipo di annotazione e dall url, ne restituisce il soggetto del body
	function find_body_subject($ann_type,$url){
		$arr=explode(".",$url);
		$ultimo=$arr[count($arr)-1];
		$tmp="";
		if(strcmp($ultimo,"php")==0||strcmp($ultimo,"html")==0){//tecnicamente controllo inutile in quanto si sono trasformati tutti gli IRI che non finivano in .html facendoli finire con /index.html
			for($i=0;$i<count($arr)-1;$i++){
				//l'if è per non far aggiungere il . anche alla fine
				if($i<count($arr)-2) $tmp.=$arr[$i].".";
				else $tmp.=$arr[$i];
			}
		}
		else $tmp=$url."/index";
		
		if(strcmp($ann_type,"hasAuthor")==0){
				return $tmp;
			}
			else return $tmp."_ver1";
	}
	
	/*Partendo da una  annotazione multipla, cambia in tutti i suoi campi il carattere " nel carattere \" se purge è false
		altrimenti rimuove il carattere "
	*/
	function changeDoubleQuotationMarkFromAnnotation($multiann,$purge=false){

		foreach ($multiann->annotation as $key =>$val){
			//type
			$val->type=changeDoubleQuotationMark($val->type,$purge);
			//label
			$vallabel=changeDoubleQuotationMark($val->label,$purge);
			//body
			$val->body->label=changeDoubleQuotationMark($val->body->label,$purge);
			$val->body->subject=changeDoubleQuotationMark($val->body->subject,$purge);
			$val->body->predicate=changeDoubleQuotationMark($val->body->predicate,$purge);
			$val->body->literal=changeDoubleQuotationMark($val->body->literal,$purge);
			
				//body resource
				if(isset($val->body->resources)){
				$val->body->resources->id=changeDoubleQuotationMark($val->body->resources->id,$purge);
				$val->body->resources->label=changeDoubleQuotationMark($val->body->resources->label,$purge);
				}
			
		}
		
		
		//target
		$multiann->target->source=changeDoubleQuotationMark($multiann->target->source,$purge);
		$multiann->target->id=changeDoubleQuotationMark($multiann->target->id,$purge);
		$multiann->target->start=changeDoubleQuotationMark($multiann->target->start,$purge);
		$multiann->target->end=changeDoubleQuotationMark($multiann->target->end,$purge);
		
		//provenance
		$multiann->provenance->time=changeDoubleQuotationMark($multiann->provenance->time,$purge);
		$multiann->provenance->author->name=changeDoubleQuotationMark($multiann->provenance->author->name,$purge);
		$multiann->provenance->author->email=changeDoubleQuotationMark($multiann->provenance->author->email,$purge);

		return $multiann;
	}
	
	/*cambia il carattere " in \" se purge=false, altrimenti lo elimina*/
	function changeDoubleQuotationMark($str,$purge=false){
		if($purge==false){$str=str_replace('"','\"',$str);}
		else $str=str_replace('"','',$str);
		return $str;
	}

	
	//stampa una annotazione multipla
	function print_annotation($multiannotation){
	
		foreach ($multiannotation->annotation as $key =>$val){
		echo "<br>annotazione $key: <br>";
		echo "Tipo: $val->type <br>";
		echo "Label: $val->label <br>";
		echo "body:<br>";
		$body=$val->body;
		if(strcmp($body->label,"")!=0) echo "&nbsp&nbsp Label: $body->label <br>";	
		echo "&nbsp&nbsp Soggetto: $body->subject <br>";	
		echo "&nbsp&nbsp Predicato: $body->predicate <br>";
		$etiquette=find_body_etiquette($val->type);
		if(strcmp($body->literal,"")!=0)	echo "&nbsp&nbsp $etiquette: $body->literal <br>";
			//	else if(strcmp($body->resources,"")!=0){
		else if(isset($body->resources)){
			//if(strcmp())
			$res=$body->resources;
			echo "&nbsp&nbsp $etiquette:<br>&nbsp&nbsp&nbsp&nbsp&nbsp Id: $res->id <br>";
			echo "&nbsp&nbsp&nbsp&nbsp&nbsp Label: $res->label <br>";
		}
		else exit;		
		}
		echo "Target: <br>";
		$target=$multiannotation->target;
		echo "&nbsp Source: $target->source <br>";
		echo "&nbsp Id: $target->id <br>";
		echo "&nbsp Start: $target->start <br>";
		echo "&nbsp End: $target->end <br>";
		echo "Provenance: <br>";
		$provenance=$multiannotation->provenance;
		$author=$provenance->author;
		echo "&nbsp Nome: $author->name <br>";
		echo "&nbsp Mail: $author->email <br>";
		echo "&nbsp Time: $provenance->time <br>";
	}
	
	//funzioni copiate e incollate da internet(anche se alla fine ho dovuto applicare opportune modifiche, funzione di partenza in fondo come commento):
	
	
	function expandStrangeCombinations($in){
	$text=$in;
	// Exciting combinations    
    $text = str_replace("ыЫ", "bl", $text);
    $text = str_replace("℅", "c/o", $text);
    $text = str_replace("₧", "Pts", $text);
    $text = str_replace("™", "tm", $text);
    $text = str_replace("№", "No", $text);        
    $text = str_replace("Ч", "4", $text);                
    $text = str_replace("‰", "%", $text);
    $text = preg_replace("/[∙•]/u", "*", $text);
    $text = str_replace("‹", "<", $text);
    $text = str_replace("›", ">", $text);
    $text = str_replace("‼", "!!", $text);
    $text = str_replace("⁄", "/", $text);
    $text = str_replace("∕", "/", $text);
    $text = str_replace("⅞", "7/8", $text);
    $text = str_replace("⅝", "5/8", $text);
    $text = str_replace("⅜", "3/8", $text);
    $text = str_replace("⅛", "1/8", $text);        
    $text = preg_replace("/[‰]/u", "%", $text);
    $text = preg_replace("/[Љљ]/u", "Ab", $text);
    $text = preg_replace("/[Юю]/u", "IO", $text);
    $text = preg_replace("/[ﬁﬂ]/u", "fi", $text);
    $text = preg_replace("/[зЗ]/u", "3", $text); 
    $text = preg_replace("/[‰]/u", "%", $text);
    $text = preg_replace("/[↨↕↓↑│]/u", "|", $text);
    $text = preg_replace("/[∞∩∫⌂⌠⌡]/u", "", $text);	
		
	return $text;
	}
	
	function replacePunctuationWithSpaces($in){
		$out = preg_replace("/[‚‚`‛\"′’‘″“”«»„—–―−–‾⌐─↔→←…≠≤≥««‗≈≡]/u"," ", $in);        
		$out=preg_replace("#[[:punct:]]#", " ", $out);//nel dubbio, non fidandomi troppo di avere usato tutti i caratteri di punteggiatura esistenti e non fidandomi che anche questa riga lo faccia,  le ho usate entrambe
		return $out;
	}
	
	function cleanNonAsciiCharactersInString($orig_text) {

    $text = $orig_text;

    // Single letters
	//dato che alla fine dovrà essere tutto minuscolo non faccio distinzione tra maiuscole e minuscole
    $text = preg_replace("/[∂άαăáàâãªäå∆лДΛдАÁÀÂÃÄ]/u",	"a", $text);
    $text = preg_replace("/[ЂЪЬБъьβвВß]/u",					"b", $text);
    $text = preg_replace("/[çς©сÇС¢]/u",					"c", $text);    
    $text = preg_replace("/[δ]/u",							"d", $text);
    $text = preg_replace("/[éèêëέëèεе℮ёєэЭÉÈÊË€ξЄ€Е∑]/u",	"e", $text);
    $text = preg_replace("/[₣]/u",							"f", $text);
    $text = preg_replace("/[ђћЋНнЊњ]/u",					"h", $text);
    $text = preg_replace("/[íìîïιίϊіÍÌÎÏ]/u",				"i", $text);
    $text = preg_replace("/[Јј]/u",							"j", $text);
    $text = preg_replace("/[ќкΚЌК]/u",						'k', $text);
    $text = preg_replace("/[ℓ∟Ł£]/u",						'l', $text);
    $text = preg_replace("/[Мм]/u",							"m", $text);
    $text = preg_replace("/[ñηήηπⁿÑ∏пПИЙийΝЛ]/u",			"n", $text);
    $text = preg_replace("/[óòôõºöοФσόо¤ÓÒÔÕÖθΩθОΩ]/u",	"o", $text);
    $text = preg_replace("/[ρφрРф]/u",						"p", $text); 
    $text = preg_replace("/[ГЃгѓ®яЯ]/u",					"r", $text); 
    $text = preg_replace("/[ѕ§Ѕ]/u",						"s", $text);
    $text = preg_replace("/[τ†‡Тт]/u",						"t", $text);
    $text = preg_replace("/[úùûüџμΰµυϋύÚÙÛÜЏЦц]/u",			"u", $text);
    $text = preg_replace("/[√]/u",							"v", $text);
    $text = preg_replace("/[ΨψωώẅẃẁщшẀẄẂШЩ]/u",			"w", $text);
    $text = preg_replace("/[ΧχЖХж]/u",						"x", $text);
    $text = preg_replace("/[ỳγўЎУучỲΫ¥]/u",					"y", $text);
    $text = preg_replace("/[ζ]/u",							"Z", $text);
	return $text;
	}
	
	function replaceEverything($in){
		//per prima cosa espando i caratteri strani (tipo quelli che accorpano più caratteri in un solo carattere)
		$out=expandStrangeCombinations($in);
		//poi assumo che qualsiasi eventuale carattere di punteggiatura serva a dividere l'ennesimo nome dall'ennesimo +1 nome,avendo così la stessa funzione di uno spazio.
		//Quindi sostituisco la punteggiatoura con spazi
		$out=replacePunctuationWithSpaces($out);
		//infine sostituisco i caratteri non ascii con i corrispondenti caratteri ascii
		$out=cleanNonAsciiCharactersInString($out);
		return $out;
	}
	
	/* funzione originale
	function cleanNonAsciiCharactersInString($orig_text) {

    $text = $orig_text;

    // Single letters
    $text = preg_replace("/[∂άαáàâãªäå]/u",      "a", $text);
    $text = preg_replace("/[∆лДΛдАÁÀÂÃÄ]/u",     "A", $text);
    $text = preg_replace("/[ЂЪЬБъь]/u",           "b", $text);
    $text = preg_replace("/[βвВ]/u",            "B", $text);
    $text = preg_replace("/[çς©с]/u",            "c", $text);
    $text = preg_replace("/[ÇС]/u",              "C", $text);        
    $text = preg_replace("/[δ]/u",             "d", $text);
    $text = preg_replace("/[éèêëέëèεе℮ёєэЭ]/u", "e", $text);
    $text = preg_replace("/[ÉÈÊË€ξЄ€Е∑]/u",     "E", $text);
    $text = preg_replace("/[₣]/u",               "F", $text);
    $text = preg_replace("/[НнЊњ]/u",           "H", $text);
    $text = preg_replace("/[ђћЋ]/u",            "h", $text);
    $text = preg_replace("/[ÍÌÎÏ]/u",           "I", $text);
    $text = preg_replace("/[íìîïιίϊі]/u",       "i", $text);
    $text = preg_replace("/[Јј]/u",             "j", $text);
    $text = preg_replace("/[ΚЌК]/u",            'K', $text);
    $text = preg_replace("/[ќк]/u",             'k', $text);
    $text = preg_replace("/[ℓ∟Ł]/u",             'l', $text);
    $text = preg_replace("/[Мм]/u",             "M", $text);
    $text = preg_replace("/[ñηήηπⁿ]/u",            "n", $text);
    $text = preg_replace("/[Ñ∏пПИЙийΝЛ]/u",       "N", $text);
    $text = preg_replace("/[óòôõºöοФσόо]/u", "o", $text);
    $text = preg_replace("/[ÓÒÔÕÖθΩθОΩ]/u",     "O", $text);
    $text = preg_replace("/[ρφрРф]/u",          "p", $text);
    $text = preg_replace("/[®яЯ]/u",              "R", $text); 
    $text = preg_replace("/[ГЃгѓ]/u",              "r", $text); 
    $text = preg_replace("/[Ѕ]/u",              "S", $text);
    $text = preg_replace("/[ѕ]/u",              "s", $text);
    $text = preg_replace("/[Тт]/u",              "T", $text);
    $text = preg_replace("/[τ†‡]/u",              "t", $text);
    $text = preg_replace("/[úùûüџμΰµυϋύ]/u",     "u", $text);
    $text = preg_replace("/[√]/u",               "v", $text);
    $text = preg_replace("/[ÚÙÛÜЏЦц]/u",         "U", $text);
    $text = preg_replace("/[Ψψωώẅẃẁщш]/u",      "w", $text);
    $text = preg_replace("/[ẀẄẂШЩ]/u",          "W", $text);
    $text = preg_replace("/[ΧχЖХж]/u",          "x", $text);
    $text = preg_replace("/[ỲΫ¥]/u",           "Y", $text);
    $text = preg_replace("/[ỳγўЎУуч]/u",       "y", $text);
    $text = preg_replace("/[ζ]/u",              "Z", $text);

    // Punctuation
    $text = preg_replace("/[‚‚]/u", ",", $text);        
    $text = preg_replace("/[`‛′’‘]/u", "'", $text);
    $text = preg_replace("/[″“”«»„]/u", '"', $text);
    $text = preg_replace("/[—–―−–‾⌐─↔→←]/u", '-', $text);
    $text = preg_replace("/[  ]/u", ' ', $text);

    $text = str_replace("…", "...", $text);
    $text = str_replace("≠", "!=", $text);
    $text = str_replace("≤", "<=", $text);
    $text = str_replace("≥", ">=", $text);
    $text = preg_replace("/[‗≈≡]/u", "=", $text);


    // Exciting combinations    
    $text = str_replace("ыЫ", "bl", $text);
    $text = str_replace("℅", "c/o", $text);
    $text = str_replace("₧", "Pts", $text);
    $text = str_replace("™", "tm", $text);
    $text = str_replace("№", "No", $text);        
    $text = str_replace("Ч", "4", $text);                
    $text = str_replace("‰", "%", $text);
    $text = preg_replace("/[∙•]/u", "*", $text);
    $text = str_replace("‹", "<", $text);
    $text = str_replace("›", ">", $text);
    $text = str_replace("‼", "!!", $text);
    $text = str_replace("⁄", "/", $text);
    $text = str_replace("∕", "/", $text);
    $text = str_replace("⅞", "7/8", $text);
    $text = str_replace("⅝", "5/8", $text);
    $text = str_replace("⅜", "3/8", $text);
    $text = str_replace("⅛", "1/8", $text);        
    $text = preg_replace("/[‰]/u", "%", $text);
    $text = preg_replace("/[Љљ]/u", "Ab", $text);
    $text = preg_replace("/[Юю]/u", "IO", $text);
    $text = preg_replace("/[ﬁﬂ]/u", "fi", $text);
    $text = preg_replace("/[зЗ]/u", "3", $text); 
    $text = str_replace("£", "(pounds)", $text);
    $text = str_replace("₤", "(lira)", $text);
    $text = preg_replace("/[‰]/u", "%", $text);
    $text = preg_replace("/[↨↕↓↑│]/u", "|", $text);
    $text = preg_replace("/[∞∩∫⌂⌠⌡]/u", "", $text);
	
	return $text;

	}
	*/

?>