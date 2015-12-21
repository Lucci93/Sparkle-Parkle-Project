<?php
//file scritto da Gabriele Casanova
require_once "SparkleScraper.php";
require_once "Classi.php";

/*($dati,$annotazioni,$n_annotazione,$label,$arr_key,$resource)
funzione generica che fa tutte le retoriche a parte l'abstract (la uso solo per questi tipi di annotazioni perchè sono le uniche dove ci sono solo 2 cambiamenti effettivi e non di più)
*/
function add_rhetoric(&$dati,&$annotazioni,&$n_annotazione,&$provenance,$label,$arr_key,$resource){
	if(isset($dati->start_array[$arr_key])){
		$type="denotesRhetoric";
		foreach($dati->start_array[$arr_key] as $key=>$val){
			$target_id=$dati->location.$dati->locations[$arr_key][$key];
			
			$body_subject=find_body_subject($type,$dati->url)."#".$target_id."-".$dati->start_array[$arr_key][$key]."-".$dati->end_array[$arr_key][$key];
			$body= new body($label,$body_subject,find_predicate($type),null,$resource);
			$ann_introd= new annotation($type,"Retorica",$body);
			$target=new target($dati->url,$target_id,$dati->start_array[$arr_key][$key],$dati->end_array[$arr_key][$key]);
			$introduzione= new annotations (array(0 => $ann_introd),$target,$provenance);
			$annotazioni[$n_annotazione]=$introduzione;
			$n_annotazione++;
	
		}
	}
}


//partendo dai dati ottenuti dalo scraper crea un vettore di annotazioni
function create_anniotations($dati){
	$annotazioni=array();
	$n_annotazione=0;
	
	/*se, come in almajournal il sito non finisce con .php o .html ci saranno successivamente dei problemi per costruire il work e l expression dell'IRI come richiesto dalle slide, quindi se l'IRI non finisce con .html o .php
		lo trasformiamo in modo che finisca con /index.html (tanto anche con questa trasformazione il nuovo IRI identifica comunque la stessa risorsa, o almeno mi piace crederlo)*/
	$arr=explode(".",$dati->url);
		$ultimo=$arr[count($arr)-1];
		if(strcmp($ultimo,"php")!=0&&strcmp($ultimo,"html")!=0) $dati->url.="/index.html";
	//target di default:(per sito sconosciuto)
	$target=new target($dati->url,"",0,0);

	//parte provenance
	$author = new author_of_annotation("Sparkle Parkle","sparkle.parkle@studio.unibo.it");
	$date=explode(":",date(DATE_ATOM,mktime()));
	$provenance = new provenance($author,$date[0].":".$date[1]);

	//annotazione titolo:
	if(strcmp($dati->title, "")!=0){
		$type="hasTitle";
		$arr_key="title";
		$body= new body("",find_body_subject($type,$dati->url),find_predicate($type),null,$dati->title);
		$ann_titolo= new annotation($type,"Titolo",$body);

		if(isset($dati->locations[$arr_key])){//per un sito sconosciuto non posso ricavare le info del target
			$target_id=$dati->location.$dati->locations[$arr_key];
			$target=new target($dati->url,$target_id,$dati->start_array[$arr_key],$dati->end_array[$arr_key]);
		}
		$titolo= new annotations (array(0 => $ann_titolo),$target,$provenance);
		$annotazioni[$n_annotazione]=$titolo;
		$n_annotazione++;

	}
	//annotazione anno:
	if(strcmp($dati->year, "")!=0){
		$type="hasPublicationYear";
		$arr_key="year";
		$target_id=$dati->location.$dati->locations[$arr_key];
		$body= new body("",find_body_subject($type,$dati->url),find_predicate($type),null,$dati->year);
		$ann_anno= new annotation($type,"Anno di pubblicazione",$body);
		$target=new target($dati->url,$target_id,$dati->start_array[$arr_key],$dati->end_array[$arr_key]);
		$anno= new annotations (array(0 => $ann_anno),$target,$provenance);
		$annotazioni[$n_annotazione]=$anno;
		$n_annotazione++;
	}
	//autori:
	if(isset($dati->authors)){
		$type="hasAuthor";
		$arr_key="authors";
		$i=0;
		foreach($dati->authors as $key=>$val){
			if(strcmp($dati->locations["firstauthors"],"")!=0){//il sito era dlib
				$target_id=$dati->location.$dati->locations[$arr_key].($dati->locations["firstauthors"]+$i).$dati->locations["continuation_of_authors"][$key];
				$i++;
			}
			else $target_id=$dati->location.$dati->locations[$arr_key];
			$resource=new resources(find_resource_id($val),$val);
			$body= new body("Un autore del documento è $val",find_body_subject($type,$dati->url),find_predicate($type),$resource,"");
			$ann_autore= new annotation($type,"Autore",$body);
			$target=new target($dati->url,$target_id,$dati->start_array[$key],$dati->end_array[$key]);
			$autore= new annotations (array(0 => $ann_autore),$target,$provenance);
			$annotazioni[$n_annotazione]=$autore;
			$n_annotazione++;
	
		}
	
	}
	//annotazione doi:
	if(strcmp($dati->doi, "")!=0){
		$type="hasDOI";
		$arr_key="doi";
		$target_id=$dati->location.$dati->locations[$arr_key];
		$body= new body("",find_body_subject($type,$dati->url),find_predicate($type),null,$dati->doi);
		$ann_doi= new annotation($type,"DOI",$body);
		$target=new target($dati->url,$target_id,$dati->start_array[$arr_key],$dati->end_array[$arr_key]);
		$doi= new annotations (array(0 => $ann_doi),$target,$provenance);
		$annotazioni[$n_annotazione]=$doi;
		$n_annotazione++;	
	}
	//annotazione abstract
	if(strcmp($dati->abstract, "")!=0){
		$type="denotesRhetoric";
		$arr_key="abstract";
		$resource="sro:Abstract";
		$target_id=$dati->location.$dati->locations[$arr_key];
		$body_subject=find_body_subject($type,$dati->url);
		$body_subject.="#".$target_id."-".$dati->start_array[$arr_key]."-".$dati->end_array[$arr_key];
		$body= new body("Abstract",$body_subject,find_predicate($type),null,$resource);
		$ann_abstract= new annotation($type,"Retorica",$body);
		$target=new target($dati->url,$target_id,$dati->start_array[$arr_key],$dati->end_array[$arr_key]);
		$abstract= new annotations (array(0 => $ann_abstract),$target,$provenance);
		$annotazioni[$n_annotazione]=$abstract;
		$n_annotazione++;
	}
	
	//annotazioni introduction:
	add_rhetoric($dati,$annotazioni,$n_annotazione,$provenance,"Introduction","intros","deo:Introduction");
	//annotazioni materials:
	add_rhetoric($dati,$annotazioni,$n_annotazione,$provenance,"Materials","maters","deo:Materials");
	//annotazioni methods:
	add_rhetoric($dati,$annotazioni,$n_annotazione,$provenance,"Methods","methods","deo:Methods");
	//annotazioni results:
	add_rhetoric($dati,$annotazioni,$n_annotazione,$provenance,"Results","results","deo:Results");
	//annotazioni discussion:
	add_rhetoric($dati,$annotazioni,$n_annotazione,$provenance,"Discussion","discs","sro:Discussion");
	//annotazioni conclusion:
	add_rhetoric($dati,$annotazioni,$n_annotazione,$provenance,"Conclusion","concs","sro:Conclusion");
	
	//annotazione url:
	if(strcmp($dati->url, "")!=0){
	$type="hasURL";
	$arr_key="Url";
	$body= new body("",find_body_subject($type,$dati->url),find_predicate($type),null,$dati->url);
	$ann_url= new annotation($type,"URL",$body);
	if(strcmp($dati->location, "")!=0){
		$target_id="document";
		$target=new target($dati->url,$target_id,0,0);
	}
	$url= new annotations (array(0 => $ann_url),$target,$provenance);
	$annotazioni[$n_annotazione]=$url;
	$n_annotazione++;
	}
	
	
	
	
	
	
	//annotazioni citazioni:
	if(isset($dati->citations)){	
		foreach($dati->citations as $key=>$val){
			$type="cites";
			$arr_key="citos";
			$label="";
			if(isset($val->title)){ 
			$title=$val->title;
			$label="Questo articolo cita '$title'";
			}
			else continue;
			$target_id=$dati->location.$dati->locations[$arr_key][$key];
			$body_subject=find_body_subject($type,$dati->url);
			$n=$key+1;//per partire da _cited1 al posto di _cited0
			$resource_id=$body_subject."_cited$n";
			$resource=new resources($resource_id,$val->content);
			$body= new body($label,$body_subject,find_predicate($type),$resource,"");
			$ann_cit= new annotation($type,"Citazione",$body);
			$target=new target($dati->url,$target_id,$dati->start_array[$arr_key][$key],$dati->end_array[$arr_key][$key]);
			
			
			$body_subject=$resource_id;//per le annotazioni interne il subject del body coincide con l'id della risorsa della annotazione citazione
			$ann_interne=array();
			$i=0;
			//parte titolo	
			$type="hasTitle";
			$arr_key="title";
			$body= new body("",$body_subject,find_predicate($type),null,$val->title);
			$ann_interne[$i]= new annotation($type,"Titolo",$body);
			$i++;
			//parte anno
			if(!is_null($val->year)){
				$type="hasPublicationYear";
				$arr_key="year";
				$body= new body("",$body_subject,find_predicate($type),null,$val->year);
				$ann_interne[$i]= new annotation($type,"Anno di pubblicazione",$body);
				$i++;
			}
			//parte doi
			if(!is_null($val->doi)){
				$type="hasDOI";
				$arr_key="doi";
				$body= new body("",$body_subject,find_predicate($type),null,$val->doi);
				$ann_interne[$i]= new annotation($type,"DOI",$body);
				$i++;
			}
			//parte url
			if(!is_null($val->url)){
				$type="hasURL";
				$arr_key="Url";
				$body= new body("",$body_subject,find_predicate($type),null,$val->url);
				$ann_interne[$i]= new annotation($type,"URL",$body);
				$i++;
			}
			//parte autori
			if(isset($val->authors)){
				$type="hasAuthor";
				$arr_key="authors";
				foreach($val->authors as $nautore=>$nomeutore){
					$resource=new resources(find_resource_id($nomeutore),$nomeutore);
					$body= new body("Un autore del documento citato è $nomeutore",$body_subject,find_predicate($type),$resource,"");
					$ann_interne[$i]= new annotation($type,"Autore",$body);
					$i++;
				}	
			}
			
			$citazione_e_interne=array(0 => $ann_cit);
			foreach ($ann_interne as $nann=>$contenuto){
			$citazione_e_interne[$nann+1]=$contenuto;//+1 dato che si parte da 0 ma in posizione 0 ci sono le informazioni della citazione stessa
			}
			
			$citazione= new annotations ($citazione_e_interne,$target,$provenance);
			$annotazioni[$n_annotazione]=$citazione;
			$n_annotazione++;
	
		}
	
	}

	
	
	//cambio eventuali caratteri " con \" dato che altrimenti questi caratteri renderebbero invalidi il json
	foreach ($annotazioni as $k=>$v){$annotazioni[$k]=changeDoubleQuotationMarkFromAnnotation($v);}
	return $annotazioni;

}


function print_annotations($annotazioni){
	foreach ($annotazioni as $key => $value) {
		print_annotation($value);
		echo "<br><br>";
	}
}

	
	/*if(isset($dati->start_array["intros"])){
		$type="denotesRhetoric";
		$arr_key="intros";
		$resource="deo:Introduction";
		$i=0;
		foreach($dati->start_array["intros"] as $key=>$val){
			$target_id=$dati->location.$dati->locations[$arr_key][$key];
			
			$body_subject=find_body_subject($type,$dati->url)."#".$target_id."-".$dati->start_array[$arr_key][$key]."-".$dati->end_array[$arr_key][$key];
			$body= new body("Introduction",$body_subject,find_predicate($type),null,$resource);
			$ann_introd= new annotation($type,"Retorica",$body);
			$target=new target($dati->url,$target_id,$dati->start_array[$arr_key][$key],$dati->end_array[$arr_key][$key]);
			$introduzione= new annotations (array(0 => $ann_introd),$target,$provenance);
			$annotazioni[$n_annotazione]=$introduzione;
			$n_annotazione++;
	
		}
	
	}*/