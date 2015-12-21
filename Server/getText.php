<?php
//scritto da Davide Quadrelli
header("Content-Type:html;charset=UTF-8");
require_once 'include/Scraper.php';
$toret=Array();
if(isset($_GET['url'])){
	$scraper=new Scraper();
	$scraper->loadPage($_GET["url"],true);
	if(strpos($_GET['url'],"dlib")){
		//pagina di d-lib
		$scraper->XPathFilter("html/body[1]/form/table[3]/tr[1]/td[1]/table[5]/tr[1]/td[1]/table[1]/tr[1]/td[2]/node()");
		$toret[0]="form1_table3_tr1_td1_table5_tr1_td1_table1_tr1_td2_";
	}else if(strpos($_GET['url'],"unibo")){
		//articolo di almajournal
		$toret[0]="div1_div3_div2_";
		/*$scraper->XPathFilter("//div[@id=\"articleTitle\"] | //div[@id=\"authorString\"] | //div[@id=\"articleAbstract\"] | //div[@id=\"articleSubject\"]
			 | //div[@id=\"articleFullText\"] | //div[@id=\"authorString\"] | //div[@id=\"articleCitations\"] | //a[@id=\"pub-id::doi\"]");*/
		$scraper->XPathFilter("//div[@id=\"main\"]/node()");
		if($scraper->toString()==""){
			//è un sito unibo ma non un articolo
			$toret[0]="body1_";
			$scraper->XPathFilter("//body");
		}
	}
	else{
		$toret[0]="body1_";
		$scraper->XPathFilter("//body");
	}
	$toret[1]=$scraper->toString();	
	echo(json_encode($toret));
}