<?php
//file scritto da Davide Quadrelli
require_once 'goutte.phar';
use Goutte\Client;

class Scraper{
	protected $client,$crawler;
	public $nodes;
	// toglie la parte file.html dall'url preso come parametro
	protected function getInitialURL($url){
		$arr=explode("/",$url);
		$tmp="";
		for($i=0;$i<count($arr)-1;$i++){
			$tmp.=$arr[$i]."/";
		}
		return $tmp;
	}
	/*trasforma il path del src delle immagini da relativo ad assoluto
	  sistema gli url dei link della pagina
	  rimuove la class footer da tutti gli elementi della pagina
	  rimuove tutti i cazzo di br in mezzo al cazzo
	  */
	private function makeAllPretty($url){
		foreach($this->crawler as $elemento){
			$imgs=$elemento->getElementsByTagName("img");
			$links=$elemento->getElementsByTagName("a");
			$paragraphs=$elemento->getElementsByTagName("p");
			$divs=$elemento->getElementsByTagName("div");
			$hs=$elemento->getElementsByTagName("h3");
			/*foreach($imgs as $nodo){
				$temp=$nodo->getAttribute("src");
				$nodo->setAttribute("src",$url.$temp);
			}*/
			foreach($links as $nodo){
				$temp=$nodo->getAttribute("href");
				if(strpos($temp,'#')!=false) $nodo->setAttribute("href",$url.$temp);
			}
			foreach($paragraphs as $nodo){
				$temp=$nodo->getAttribute("class");
				if($temp=="footer") $nodo->removeAttribute("class");
				//$nodo->nodeValue=str_replace("<br>","",$nodo->nodeValue);
			}
			/*foreach($divs as $nodo){
				if($nodo->getAttribute("class")!="center") $nodo->nodeValue="";
				else $nodo->setAttribute("class","sonoilcopyrightmamifaccioicazzimiei");
			}*/
			foreach ($hs as $nodo) {
				$nodo->nodeValue=str_replace("<br>","",$nodo->nodeValue);
			}
		}
	}

	//metodo che carica la pagina web
	function loadPage($url,$yep=false){
	 	$this->crawler = $this->client->request('GET',$url);
	 	$page_url=$this->getInitialURL($url);
	 	if($yep)$this->makeAllPretty($page_url);
	}
	//filtra la pagina utilizzando un XPATH
	function XPathFilter($filter){
	 	$this->nodes=$this->crawler->filterXPath($filter);
	 	return $this->nodes;
	}
	//filtra la pagina utilizzando un CSS SELECTOR
	function CSSFilter($filter){
	 	$this->nodes=$this->crawler->filter($filter);
	}
	//metodo per stampare le parti "scrapate" della pagina
	function toString($type="html"){
		/*con html restituisco codice html, con txt restituisco il testo
		dei nodi salvati*/
		$tr="";
		if($type=="html"){
			
			foreach ($this->nodes as $domElement) {
		    	$tr.=($domElement->ownerDocument->saveHTML($domElement));
			}
		}else if($type=="txt"){
			$arr=$this->nodes->each(function($node){
				return $node->text();
			});
			foreach($arr as $tmp){
				$tr.=$tmp."";
			}
		/*}else{
			$html=new DomDocument();
			foreach($this->nodes as $node){
				$html->importNode($node);
			}
			$tr=$html->saveHTML();*/
		}
		$tr=rtrim($tr);
		return $tr;
	}
	//costruttore della classe
	function __construct(){
		$this->client=new Client();
	}
}