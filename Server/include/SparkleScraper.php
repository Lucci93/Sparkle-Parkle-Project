<?php
//file scritto da Gabriele Casanova
require_once "Scraper.php";
require_once "ReferenceRegEx.php";
require_once "Rhetorics.php";

//classe che fa da contenitore delle informazoni ottenute, per poterle restituire agli altri script
class citationcontainer{
	public $content,$title,$year,$authors,$doi,$url;
	
	function __construct($content,$title,$year,$authors,$doi,$url){			
			$this->content=$content;
			$this->title=$title;
			$this->year=$year;
			$this->doi=$doi;
			$this->url=$url;
			$this->authors=$authors;
			
		}
		function print_content(){
		echo "<br>
		
		contenuto: $this->content<br>
		titolo: $this->title<br>
		anno: $this->year<br>";
		if(isset($this->authors)){
		foreach ($this->authors as $k=>$v){
			echo "autore$k: $v<br>";
		}
		}
		echo "doi: $this->doi<br>
		url: $this->url<br>";
		
	}
}

class tempcontainer{
	public $title,$year,$doi,$abstract,$url,$location;
	public $authors=array(),$locations=array(),$start_array=array(),$end_array=array(),$citations=array();

	function __construct($title,$year,$authors,$doi,$abstract,$url,$location,$locations,$start_array,$end_array,$citations){			
		$this->title=$title;	
		$this->year=$year;
		$this->doi=$doi;
		$this->abstract=$abstract;
		$this->url=$url;
		$this->authors=$authors;
		$this->location=$location;
		$this->locations=$locations;
		$this->start_array=$start_array;
		$this->end_array=$end_array;	
		$this->citations = unserialize(serialize($citations));//per l'assegnamento di oggetti non basta il semplice =
	}
	
	function print_tf_out(){
		if(strcmp($this->title,"")!=0&&isset($this->location["title"])) echo sprintf("Il titolo è: $this->title con percorso %s%s, inizio  e %s fine %s <br><br>",$this->location,$this->locations["title"],$this->start_array["title"],$this->end_array["title"]);
		if(strcmp($this->year,"")!=0) echo sprintf("L'anno è: $this->year con percorso %s%s, inizio  e %s fine %s  <br><br>",$this->location,$this->locations["year"],$this->start_array["year"],$this->end_array["year"]);
		foreach($this->authors as $key=>$val){
			//tutti lo stesso, bisognerà cambiare poi l ultimo pezzo
			echo sprintf("L'autore è: $val con percorso %s%s, inizio  e %s fine %s <br><br>",$this->location,$this->locations["authors"],0,mb_strlen($val),"UTF-8");
		}
		if(strcmp($this->doi,"")!=0) echo sprintf("Il DOI è: $this->doi con percorso %s%s, inizio  e %s fine %s <br><br>",$this->location,$this->locations["doi"],$this->start_array["doi"],$this->end_array["doi"]);
		if(strcmp($this->abstract,"")!=0) echo sprintf("L'Abstract è:<br>$this->abstract con percorso %s%s, inizio  e %s fine %s <br><br>",$this->location,$this->locations["abstract"],$this->start_array["abstract"],$this->end_array["abstract"]);
	}
	
}
//classe che si occupa di gestire la classe col framework di scraping e di ottenere le annotazione automatiche
class SparkleScraper extends Scraper{
	//variabili e costruttore
	private $title,$year,$authors,$doi,$abstract,$url,$again;
	//attributo per gestione errori
	private $to_clean;
	//array associativo che si tiene in memoria la posizione del tag dal quale ha preso l'informazione
	private $location="";//parte del percorso comune a tutti gli elementi
	private $locations=array();
	private $start_array=array();
	private $end_array=array();
	private $citations=array();
	
	
	function __construct($url){
		parent::__construct();
		parent::loadPage($url);
		$this->url=$url;
		$this->title=$this->year=$this->doi=$this->abstract=$this->to_clean="";
		$this->authors=array();
		$this->again=true;
	}
	//conta quante tabelle "sorelle" ci sono in un frammento html passato come parametro
	//usato per scoprire il numero della tabella del primo autore partendo da 1
	/* function conta_tabelle($html,$nautori){
		$pattern="<table";//stringa del quale trovare l occorrenza
		$ntocheck=6;//numero caratteri del pattern
		$count=0;
		while($html!=""){
			$tocheck=substr($html,0,$ntocheck);
			if(strcmp($tocheck,$pattern)==0){
				if(strcmp($pattern,"<table")==0){// trovata nuova tabella
					$count++;
					$pattern="</table"; 
					$ntocheck=7;
					$html=substr($html,$ntocheck);// non crea problemi buttare via un carattere di troppo
				}
				else{//trovata chiusura tabella
				$pattern="<table"; //torno a controllare se si aprono nuove tabelle
				$ntocheck=6;
				$html=substr($html,$ntocheck+2);
				}
			}
			else $html=substr($html,1);
		}
		$primo=$count-$nautori+1;
		return $primo;
	} */
	function conta_tabelle($html,$nautori){
		$pattern1="<table";
		$pattern2="</tabl";
		$ntocheck=6;//numero caratteri dei pattern
		$count=0;
		$level=0;
		while($html!=""){
			$tocheck=substr($html,0,$ntocheck);
			if(strcmp($tocheck,$pattern1)==0){
				if($level==0)$count++;
				$html=substr($html,$ntocheck);
				$level++;
			}
			else if(strcmp($tocheck,$pattern2)==0){
				$html=substr($html,$ntocheck);
				if($level>0)$level--;//per evitare che un tag di chiusura messo senza alcun tag di apertura invalidi l'algoritmo (si in una issue obbligatoria c'è sta cosa)
			}
			else $html=substr($html,1);
		}
		$primo=$count-$nautori+1;
		return $primo;
	}
	
	/*metodo che da il via allo scraping
	  si occupa di controllare se conosce la struttura precisa del sito
	  del quale è stato passato gli URI*/
	function scrape(){
		$base=$this->getInitialURL($this->url);
	//	try{
			$this->bestemmie_are_coming();
			if(strpos($base,"dlib")){
				//guardo se è un articolo effettivo di dlib o un'altra pagina dello stesso sito, ma non un articolo
				if(preg_match('/[0-9]{2}\/[^0-9]+\/[0-9]{2}[^0-9]+/',$this->url)) {$this->locations["site"]="dlib";$this->dlib();}
				else {$this->locations["site"]="document"; $this->nonSoCheSitoSia();}
			}
			else if(strpos($base,"unibo")){$this->locations["site"]="unibo";$this->unibo();}
			else{$this->locations["site"]="document"; $this->nonSoCheSitoSia();}
			$this->clean();
		/*}catch(Exception $e){
			if($this->again){
				
				$this->again=false;
				//echo("Exception avvenuta: tento la gestione!<br>");
				$this->bestemmie_are_coming();
				$this->scrape();
				$this->clean();
			}
			else{
				echo("Errore nella lettura del file non leggibile<br>");
			}
		}*/
	}
	//metodo per lo scraping degli articoli su dlib
	function dlib(){
		$this->location="form1_table3_tr1_td1_table5_tr1_td1_table1_tr1_td2";
		//titolo
		parent::XPathFilter("html/body[1]/form/table[3]/tr[1]/td[1]/table[5]/tr[1]/td[1]/table[1]/tr[1]/td[2]/h3[@class=\"blue-space\"][2]");
		$this->title=parent::toString("txt");
		$this->title=trim($this->title);//non si sa mai per star sicuri si tolgono sempre i whitespace
		$this->start_array["title"]=0; 
		$this->end_array["title"]=mb_strlen($this->title,"UTF-8");
		$this->locations["title"]="_h32";
		//anno pubblicazione
		parent::XPathFilter("//body/form/table[3]/tr/td/table[5]//td[@valign=\"top\"]/p[1]");
		$tmp=parent::toString("txt");
		$tmp=explode(" ",$tmp);
		if(isset($tmp[0]))$start=mb_strlen($tmp[0],"UTF-8")+1;
		else throw new Exception("Errore anno dlib, al posto dell'anno ho ottenuto una stringa contenetnte solo uno spazio");//ovviamente sta riga non dovrebbe mai essere eseguita
		if(isset($tmp[1])){
			$tmp=$tmp[1];
			//se è una pagina di dlib, ma non un articolo nel nodo corrispondente a questo xpath ci può essere qualsiasi cosa, quindi controllo di aver preso un numero di 4 cifre
			if(preg_match('/[0-9]{4}/',$tmp)){
				$this->start_array["year"]=$start;
				$this->year=substr($tmp,0,4);
				$this->locations["year"]="_p1";
				$this->end_array["year"]=$start+mb_strlen($this->year,"UTF-8"); 
			}
		}
		//autori
		$n_authors_table=0;//magai fallirà a prendere i dati di qualche autore(in realtà non capitara, ma la prudenza non è mai troppa), ma almeno il numero di autori effettivi sarà questo, e non farà fallire anche conta_tabelle 
		$td_level=0;//grazie al fatto che a volte non mettono l'immagine degli autori l'ultimo _td2 deve diventare _td1
		$td_locations=array();//l'effettivo td_level di ogni autore
		/*parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]//h3[last()]/following-sibling::table//b"); 
		$this->authors=$this->nodes->each(function ($node){
			return $node->text();
		});
		if(empty($this->authors)){
			parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/div[@class=\"blue\"]//b");
			$this->authors=$this->nodes->each(function ($node){
				return $node->text();
			});
		}*/
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]//h3[last()]/following-sibling::table"); 
		$authors_html=$this->nodes->each(function ($node){
				return $node->html();
		});
		$n_authors_table=count($authors_html);
				
		foreach ($authors_html as $n=>$html){
			if (strpos($html,"<b>") !== false) {//il caso più probabile, il nome dell' autore è in un <b>
				$td_level=substr_count($html, '<td');
				$m=$n+1;
				parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]//h3[last()]//following-sibling::table[$m]//b[1]");
				
				$autore=$this->nodes->each(function ($node){
					return $node->text();
				});
				if(count($autore)>1) throw new Exception('Assurdo (più autori dove dovrebbe essercene uno solo)');
				$this->authors[$n]=$autore[0];
				
				
			}
			/*
			Caso l'autore non è in un <b>,faccio un controllo molto empirico sulla prima parola che segue il nome dell' autore
			e la uso per separarlo dal resto (se il nome è composto da più di 5 parole assumo che ho preso un dato sbagliato
			dato che mi sembra ragionevole non avere più di 4 nomi e un cognome)
			*/
			else if(strpos($html," is ") !== false||strpos($html,"has") !== false||strpos($html,"completed") !== false||strpos($html,"was") !== false||strpos($html,"received") !== false||strpos($html,"studied") !== false){
				if(strpos($html," is ") !== false) $pattern=" is ";
				else if(strpos($html,"has") !== false) $pattern="has";
				else if(strpos($html,"completed") !== false) $pattern="completed";
				else if(strpos($html,"was") !== false) $pattern="was";
				else if(strpos($html,"received") !== false) $pattern="received";
				else if(strpos($html,"studied") !== false) $pattern="studied";
				else throw new Exception('Non riesco a prendere questo autore');

				$td_level=substr_count($html, '<td');
				$html=strip_tags($html);
				$esploso= explode($pattern,$html,3);
				if(isset($esploso[0])){
					$esploso=$esploso[0];
					if(substr_count($esploso,' ')>5) throw new Exception('Credevo fosse un autore, ma  a sto punto non so più che fare');
					$this->authors[$n]=$esploso;
				}
			}
			else throw new Exception('Ho letteralmente finito le idee sul come potrei prendere un autore scritto in maniera diversa da tutti i casi precedenti');
			
			$td_locations[$n]=$td_level;
		}
		
		
		/*ritorno al nodo parent dei nodi autore per poter contare quante tabelle "sorelle" agli autori
		ci sono nel documento, potendo così trovare il target id degli autori. Non si poteva
		fare prima in quanto serviva sapere il numero degli autori
		*/ 
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h3[1]/following-sibling::table");
		$tmp=parent::toString();
		$this->locations["authors"]="_table";
		$this->locations["firstauthors"]=$this->conta_tabelle($tmp,$n_authors_table);
		foreach ($td_locations as $n=>$val){
		$this->locations["continuation_of_authors"][$n]="_tr1_td{$val}_p1";
		}
		/*
		parte apparentemente inutile dato che in dlib lo start ed end degli autori sono sempre
		0 e la lunghezza del "nome cognome" autore,ma bisogna farla per rendere uniformi i dati restituiti
		sia nel caso dlib, sia nel caso unibo
		*/
		foreach($this->authors as $key=>$val){
		$this->authors[$key]=trim($val);
		$val=$this->authors[$key];
				$this->start_array[$key]=0;
				$this->end_array[$key]=mb_strlen($val,"UTF-8");
		}
		
		/*parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]//h3[text()=\"About the Authors\"]/following-sibling::table//b | 
			//body/form/table[3]//table[5]//td[@valign=\"top\"]//h3[text()=\"About the Author\"]/following-sibling::table//b");
		$this->authors=$this->nodes->each(function ($node){
			return $node->text();
		});
		if(empty($this->authors)){
			parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/div[@class=\"blue\"]//b");
			$this->authors=$this->nodes->each(function ($node){
				return $node->text();
			});
		}*/
		//doi
		/*metodo funzionante del doi ma non lo uso per motivi di grafica finale dell'app
						parent::XPathFilter("//meta[@name=\"DOI\"]/@content");
						$this->doi=parent::toString("txt");*/
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/p[@class=\"blue\"][2]");
		$tmp=parent::toString("txt");
		$tmp=explode("doi:",$tmp);
		if(!isset($tmp[1])){
			$tmp=explode("DOI:",$tmp[0]);
			if(!isset($tmp[1])){
				$tmp=explode("Doi:",$tmp[0]);
			}
		}
		if(isset($tmp[1])){
		$this->doi=$tmp[1];
		$this->doi=trim($this->doi);
		$this->locations["doi"]="_p2";
		$start=mb_strlen($tmp[0],"UTF-8")+4;//il 4 è la scritta doi: tolta con l explode
		$this->start_array["doi"]=$start;
		$this->end_array["doi"]=$start+mb_strlen($tmp[1],"UTF-8");
		}
		//abstract
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/p[@class=\"blue\"][4]");
		$this->abstract=parent::toString("txt");
		$this->abstract=trim($this->abstract);
		$this->locations["abstract"]="_p4";
		$this->start_array["abstract"]=0;
		$this->end_array["abstract"]=mb_strlen($this->abstract,"UTF-8");
		//intro
		/*parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h3[4]/following-sibling::p"); 
		$set1=$this->nodes->each(function ($node){
			return $node->text();
		});
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h3[5]/preceding-sibling::p"); 
		$set2=$this->nodes->each(function ($node){
			return $node->text();
		});
		
		
		$ultimo_p=count($set2);
		$set=array_intersect($set1,$set2);
		$n=count($set);
		$primo_p=$ultimo_p-$n;
		foreach($set as $i=>$val){
			$pos=$i+$primo_p+1;//+1 dato che $i parte da 0
			$this->locations["intros"][$i]="_p$pos";
			$this->start_array["intros"][$i]=0;
			$this->end_array["intros"][$i]=$this->start_array["intros"][$i]+mb_strlen(trim($val),"UTF-8");
		}*/
		
		set_rhetoric_data($this,$this->locations,$this->start_array,$this->end_array,"introduction");
		set_rhetoric_data($this,$this->locations,$this->start_array,$this->end_array,"motivation");
		//materials
		set_rhetoric_data($this,$this->locations,$this->start_array,$this->end_array,"materials");
		//methods
		set_rhetoric_data($this,$this->locations,$this->start_array,$this->end_array,"method");
		//results
		set_rhetoric_data($this,$this->locations,$this->start_array,$this->end_array,"results");
		//discussion
		set_rhetoric_data($this,$this->locations,$this->start_array,$this->end_array,"discussion");
		//conclusion
		set_rhetoric_data($this,$this->locations,$this->start_array,$this->end_array,"conclusion");
		
		
		
		//citazioni
		$set=null;
		$last_regex_used=0;//usata solo per gli autori, in casi molto particolari
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h3[contains(text(),'Reference') and last()]/following-sibling::p"); 
		$set=$this->nodes->each(function ($node){
			//return $node->text();
			return $node;
		});
		if(empty($set)){
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h3[contains(text(),'reference') and last()]/following-sibling::p"); 
		$set=$this->nodes->each(function ($node){
			//return $node->text();
			return $node;
		});
		}
		if(empty($set)){
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/h3[contains(text(),'REFERENCE') and last()]/following-sibling::p"); 
		$set=$this->nodes->each(function ($node){
			//return $node->text();
			return $node;
		});
		}
		/*In questa parte conto tutti i p fratelli e figli diretti della tabella dei contenuti, poi ci sottraggo il numero di citazioni trovate, così
		ricavo la posizione del p contenete la prima citazione e di conseguenza la posizione di tutte le citazioni*/
		parent::XPathFilter("//body/form/table[3]//table[5]//td[@valign=\"top\"]/child::p");		
		$tmp=count($this->nodes);
		$primo_p=$tmp-(count($set));
		
		/*ora analizzo il contenuto di ogni citazione per estrare le informazioni*/
		foreach ($set as $nann=>$v){
			$title=null;$year=null;$doi=null;$url=null;
			$authors=array();
			$tmp=0;
			/*dato che il titolo a volte è in un ancora e a volte no, mi devo posizionare su due nodi differenti
			per provare a prenderlo correttamente, questa parte si posiziona dentro l'ancora, ne estrae il contenuto
			e poi ritrasforma l'intero nodo in testo puro come dovrebbe essere.
			*/
			try {
			$probablytitle=$v->filterXPath("//a[2]");
			$probablytitle=$probablytitle->text();
			}
			catch(Exception $e){
				$probablytitle=null;
			}
			$v=$v->text();
			$v=preg_replace('~[\r\n]+~', '', $v);
			
			
			
			//target
			$pos=$primo_p+$nann+1;
			$this->locations["citos"][$nann]="_p$pos";
			$this->start_array["citos"][$nann]=0;
			$this->end_array["citos"][$nann]=$this->start_array["citos"][$nann]+mb_strlen(trim($v),"UTF-8");		
			//autori
			$authors=getAuthorsDLib($v,$last_regex_used);
			//titolo
			$title=getTitleDLib($v,$probablytitle,$authors);
			//anno della citazione
			$year=getYear($v,$this->year);
			
			//doi e url della citazione
			$coppia=getDoiAndURL($v);
			if(isset($coppia[0]))$url=$coppia[0];
			if(isset($coppia[1]))$doi=$coppia[1];

			$this->citations[$nann]= new citationcontainer($v,$title,$year,$authors,$doi,$url);
			/*echo "<br><br> Annotazione $nann:<br>";
			
			echo "Titolo trovato: $title<br>";
			echo "Anno trovato: $year<br>";
			echo "Url trovato: $url<br>";
			echo "Doi trovato: $doi<br>";
			echo "Lista autori:<br>";
			foreach ($authors as $k=>$val){
				echo "Autore $k: $val<br>";
			}
			echo "Target:<br>";
			echo "location: ".$this->location.$this->locations["citos"][$nann]."<br>";
			echo "start: ".$this->start_array["citos"][$nann]."<br>";
			echo "end: ".$this->end_array["citos"][$nann]."<br>";
			echo "<br>";
			*/
		
		}
		
		
		
		
	}
	//scraper per le pagine su unibo
	function unibo(){
		$this->location="div1_div3_div2";
		//titolo
		parent::XPathFilter("//div[@id=\"articleTitle\"]/h3");
		$this->title=parent::toString("txt");
		$this->title=trim($this->title);
		$this->locations["title"]="_div3_div2_h31";
		$this->start_array["title"]=0;
		$this->end_array["title"]=mb_strlen($this->title,"UTF-8");
		//anno pubblicazione
		parent::XPathFilter("//div[@id=\"breadcrumb\"]//a[@target=\"_parent\"][2]");
		$this->year=parent::toString("txt");
		$arr=explode(" ",$this->year);
		$arr2=explode("(",$this->year);
		$this->year=$arr[count($arr)-1];
		$this->year=substr($this->year,1,4);
		$this->locations["year"]="_div2_a2";
		$start=mb_strlen($arr2[0],"UTF-8")+1;
		$this->start_array["year"]=$start;
		$this->end_array["year"]=$start+mb_strlen($this->year,"UTF-8");
		//autori
		parent::XPathFilter("//div[@id=\"authorString\"]/em");
		$autore=parent::toString("txt");
		$this->authors=explode(", ",$autore);
		if(strcmp($this->authors[0],"")==0){//dato che l'explode di una stringa vuota da come risultato un array di un elemento con chiave 0 e valore stringa vuota è necessario questo controllo
			$this->authors=null;
		}
		else{
			$this->locations["authors"]="_div3_div3_em1";
			$start=0;
			$end=0;
			foreach($this->authors as $key=>$val){
			$this->authors[$key]=trim($val);
			$val=$this->authors[$key];
				if($key==0){
					$start=0;
					$end=mb_strlen($val,"UTF-8");
					$this->start_array[$key]=$start;
					$this->end_array[$key]=$end;
				}
				else{
					$start=$end+2;
					$end= $start+mb_strlen($val,"UTF-8");
					$this->start_array[$key]=$start;
					$this->end_array[$key]=$end;
				}
			}
			//inutili per unibo, ma servono per dare uniformità con dlib
			$this->locations["firstauthors"]="";
			$this->locations["continuation_of_authors"]="";
		}
		//doi
		parent::XPathFilter("//a[@id=\"pub-id::doi\"]");
		$this->doi=parent::toString("txt");
		$this->doi=trim($this->doi);
		$this->locations["doi"]="_div3_a1";
		$this->start_array["doi"]=0;
		$this->end_array["doi"]=mb_strlen($this->doi,"UTF-8");
		//abstract
		parent::XPathFilter("//div[@id=\"articleAbstract\"]//div");
		$this->abstract=parent::toString("txt");
		$this->abstract=trim($this->abstract);
		$tmp=parent::toString();//prendo il nodo con ancora i tag html per controllare se il contenuto dell' abstract direttamente nel div o in un p dentro al div
		$tmp=substr($tmp,5,3);
		$this->locations["abstract"]="_div3_div4_div1";
		if(strpos($tmp,"<p")!==FALSE)$this->locations["abstract"].="_p1";
		$this->start_array["abstract"]=0;
		$this->end_array["abstract"]=mb_strlen($this->abstract,"UTF-8");
		//su unibo le intro sono al più dentro i documenti pdf, quindi non è richiesto che lo scraper le sappia prendere
		//citazioni
		$set=null;
		parent::XPathFilter("//body//div[@id=\"articleCitations\"]/div[1]//p"); 
		$set=$this->nodes->each(function ($node){
			return $node->text();
		});
		
		$citazione=null;
		foreach ($set as $nann=>$v){
			$title=null;$year=null;$doi=null;$url=null;
			$authors=array();
			$tmp=0;
			//target
			$pos=$nann+1;
			$this->locations["citos"][$nann]="_div3_div7_div1_p$pos";
			$this->start_array["citos"][$nann]=0;
			$this->end_array["citos"][$nann]=$this->start_array["citos"][$nann]+mb_strlen(trim($v),"UTF-8");			
			//autori
			$authors=getAuthorsUnibo($v);

			//anno della citazione
			$year=getYear($v,$this->year);
			
			//titolo
			$title=getTitleUnibo($v,$year,$authors);
			
			//doi e url della citazione
			$coppia=getDoiAndURL($v);
			if(isset($coppia[0]))$url=$coppia[0];
			if(isset($coppia[1]))$doi=$coppia[1];
			
			$this->citations[$nann]= new citationcontainer($v,$title,$year,$authors,$doi,$url);
			/*echo "<br><br> Annotazione $nann:<br>";
			
			echo "Titolo trovato: $title<br>";
			echo "Anno trovato: $year<br>";
			echo "Url trovato: $url<br>";
			echo "Doi trovato: $doi<br>";
			echo "Lista autori:<br>";
			foreach ($authors as $k=>$val){
				echo "Autore $k: $val<br>";
			}
			echo "Target:<br>";
			echo "location: ".$this->location.$this->locations["citos"][$nann]."<br>";
			echo "start: ".$this->start_array["citos"][$nann]."<br>";
			echo "end: ".$this->end_array["citos"][$nann]."<br>";
			echo "<br>";
			*/
		
		 }
		 
				
		
		
		
	}
	//scraper per qualsiasi sito non riconosciuto
	function nonSoCheSitoSia(){
		//titolo e bona(alla fine dato che tanto neanche lo mostrerei, ho deciso di non prenderlo, il massimo che poteva fare era creare dei casini agli altri gruppi)
		/*
		parent::XPathFilter("//title");
		$this->title=parent::toString("txt");
		$this->title=trim($this->title);
		$locations["title"]="unknown";
		$this->start_array["title"]=0;
		$this->end_array["title"]=0;
		*/
	}
	//funzione che tenta il ripristino della situazione per tentare uno scraping. Non va in loop per struttura del metodo scrape()
	function bestemmie_are_coming(){
		//$pattern='/[^\x{0009}\x{000a}\x{000d}\x{0020}-\x{D7FF}\x{E000}-\x{FFFD}]+/u';
		$pattern='/[\x00-\x08\x0B\x0C\x0E-\x1F]/u';
		$content=file_get_contents($this->url);
		//elimino caratteri non utf-8
		$content=mb_convert_encoding($content,'UTF-8','UTF-8');
		//elimino caratteri non stampabili
        $new=preg_replace($pattern,'',$content);
        $this->to_clean=time().".tmp";
        $pagina=fopen($this->to_clean,"w");
        fwrite($pagina,$new);
        fclose($pagina);
        $base=$_SERVER['SERVER_NAME'];
        $last=$_SERVER['PHP_SELF'];
        $last=parent::getInitialURL($last);
        parent::loadPage("http://".$base.$last.$this->to_clean);
	}
	//funzione che elimina il file temporaneo generato in caso di problemi con la pagina originale
	function clean(){
		unlink($this->to_clean);
		$this->to_clean="";
	}
	//funzione per testing che serve a stampare tutto quello che sono riuscito ad ottenere
	//non cancellatela anche se incompleta, può essere utile per la spiegazione di come ci siamo divisi il lavoro
	function print_all(){
		if(strcmp($this->title,"")!=0)echo("Il titolo è: $this->title<br><br>");
		if(strcmp($this->year,"")!=0)echo("L'anno è: $this->year<br><br>");
		foreach($this->authors as $aut){
			echo("L'autore è: $aut<br><br>");
		}
		if(strcmp($this->doi,"")!=0)echo("Il DOI è: $this->doi<br><br>");
		if(strcmp($this->abstract,"")!=0)echo("L'Abstract è:<br>$this->abstract<br><br>");
	}
	
	//funzione che restituisce un tempcontainer con tutti i dati ottenuti
	function return_data(){
	$dati= new tempcontainer($this->title,$this->year,$this->authors,$this->doi,$this->abstract,$this->url,$this->location,$this->locations,$this->start_array,$this->end_array,$this->citations);
	return $dati;
	}
	
}