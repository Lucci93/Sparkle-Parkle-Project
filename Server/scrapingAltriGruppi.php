<?php
//file fatto da Gabriele Casanova
require_once "include/Scraper.php";


class scrapingGruppi extends Scraper{
	public $nomi,$siti;
	function __construct($url){
		parent::__construct();
		parent::loadPage($url);
		
		$this->nomi=array();
		$this->siti=array();
	}

	/*questa funzione è commentata, non perchè è contenga errori, ma perchè faceva lo scraping dei gruppi da gestire seguendo la struttura della pagina del wiki sbagliata, ovvero 
		la pagina che si trova all'indirizzo http://vitali.web.cs.unibo.it/TechWeb15/GrafiGruppi*/	
	/*function scrape(){
	
		/*dato che nel wiki al posto di avere un <p> che continene il nome del gruppo e il link al suo sito, abbiamo un <p/> prima del nome e i dati sono tutti dentro il div padre,
			mi tocca fare cose a caso per riuscire a recuperare i dati che mi servono. Dati che ripeto sono tutti nello stesso tag e con in mezzo cose che non centrano niente*/
		
		/* dato che questo script è stato scritto quando nella pagina del wiki era presente un gruppo solo, posso solo assumere la struttura della pagina che ci sarà quando ci sarà più di un gruppo
			e la forma assunta è la seguente:
			dentro al div di classe twikiTopic ci sarà scritto qualcosa del tipo:
			
			-- FrancescoSovrano - 22 Jul 2015 Set ALLOWTOPICVIEW = Set ALLOWTOPICCHANGE = 

				1. The Scrapers - http://ltw1525.web.cs.unibo.it/ //(fine parte reale presente nel div del wiky e inizio parte assunta)
				2. nome2 nome2 - http://ltw1525.web.cs.unibo.it/
				3. nome3 nome3 nome3 - http://ltw1525.web.cs.unibo.it/
				4. N.o.m.e.4 - http://ltw1525.web.cs.unibo.it/ to top	//(assumo che rimanga un solo "to top" scritto dento al <div> in questione)
			*/	
				
		/*$cose_a_caso=array();
		
		parent::XPathFilter("//div[@class=\"twikiTopic\"][1]");
		$tmp=parent::toString('txt');
		
		/*
		$file=fopen("prova wiki.txt","r");
		$tmp=fread($file,filesize("prova wiki.txt"));
		*/
		
		/*$cose_a_caso=explode("1. ",$tmp);
		if(isset($cose_a_caso[1])) $cose_a_caso=explode("-",$cose_a_caso[1]);
		$this->nomi[0]=trim($cose_a_caso[0]);
		$i=1;//contatore dei nomi
		$j=0;//contatore dei siti
		$ultimo =count($cose_a_caso)-1;
		foreach($cose_a_caso as $key=>$val){
			if($key==0) continue;
			if($key == $ultimo){
				$this->siti[$j]=trim($val);
				continue;
			}
			
			$val=trim($val);
			$index=$i+1;
			$tmparr=null;
			$tmparr=explode($index.". ",$val);
			$this->siti[$j]=trim($tmparr[0]); $j++;
			$this->nomi[$i]=trim($tmparr[1]); $i++;
		}
		
		//ora maca solo da cancellare il to top dall' ultimo sito
		//riutilizzo gli stessi nomi usati in precedenza per altro, dato che adesso non servono più
		$ultimo=$this->siti[$j];
		$cose_a_caso=explode(".",$ultimo);
		$tmp="";
		$ultimo=count($cose_a_caso)-1;
		foreach($cose_a_caso as $key=>$val){
			if($key==$ultimo) continue;
			$tmp.=$val.".";
		
		}
		$tmp.="it/";
		$this->siti[$j]=$tmp;
		
		//questo foreach trasforma i http://ltwXXXX.web.cs.unibo.it/ recuperati in ltwXXXX
		foreach($this->siti as $k=>$v){
			$tmp=explode("://",$v)[1];
			$tmp=explode(".",$tmp)[0];
			$this->siti[$k]=$tmp;	
		}
		
		$out="";
		foreach($this->nomi as $k=>$v){
			$a=$this->nomi[$k];
			$b=$this->siti[$k];
			$out.="{\"nome\" : \"$a\",\"sito\" : \"$b\"},";			
		}
		$out=substr($out,0,-1);
		
		return "[".$out."]";
		
	}*/
	
	/* Questa funzione fa lo scraping dei gruppi che partecipano al progetto seguendo la struttura della pagina corrispondente all'URL http://vitali.web.cs.unibo.it/TechWeb15/ProgettoDelCorso
		Restituisce un gson della forma [{"nome" : "<nome>","sito" : "<ltwXXXX>"},...,{"nome" : "<nome2>","sito" : "<ltwXXXX>"}]*/
	function scrape(){
	$riga=2;
	$i=0;
	do{//scorre le righe
			
		$filter="//table[2]/tr[$riga]/th[1]";
		parent::XPathFilter($filter);
		$tmp=parent::toString('txt');
		if($tmp=="") continue;
		$this->siti[$i]=$tmp;
		$filter="//table[2]/tr[$riga]/th[2]";
		parent::XPathFilter($filter);
		$tmp=parent::toString('txt');	
		$this->nomi[$i]=$tmp;
		$riga++;
		$i++;
	}while($tmp!="");
	
	$out="";
	foreach($this->nomi as $k=>$v){
		$a=trim($this->nomi[$k]);
		$b=trim($this->siti[$k]);
		$out.="{\"nome\" : \"$a\",\"sito\" : \"$b\"},";			
	}
	$out=substr($out,0,-1);
		
	return "[".$out."]";
	}
	
	function stampaNomeESito(){
	foreach($this->nomi as $k=>$v){
			
			echo "nome$k= ".$this->nomi[$k]."<br>";
			echo "sito$k= ".$this->siti[$k]."<br><br>";
			
	}
}
	
}


$s=new scrapingGruppi("http://vitali.web.cs.unibo.it/TechWeb15/ProgettoDelCorso");
echo	$s->scrape();	


?>
