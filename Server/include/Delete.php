<?php
//scritto da Michele D'onza con aiuto Davide Quadrelli
require_once"SparqleParkle_lib.php";

//funzione che elimina le vecchie annotazioni dal grafo aprtendo dal JSON inviato dal client
function deleteOldTurtleFromJson($json){
	//codice copiato dalla jsonToTurtle
	$prefix='prefix schema: <http://schema.org/> 
	prefix fabio: <http://purl.org/spar/fabio/> 
	prefix xsd:   <http://www.w3.org/2001/XMLSchema#> 
	prefix skos:  <http://www.w3.org/2009/08/skos-reference/skos.html> 
	prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> 
	prefix frbr:  <http://purl.org/vocab/frbr/core#> 
	prefix dlib:  <http://www.dlib.org/dlib/> 
	prefix deo:   <http://purl.org/spar/deo/> 
	prefix cito:  <http://purl.org/spar/cito/> 
	prefix sro:   <http://salt.semanticauthoring.org/ontologies/sro#> 
	prefix oa:    <http://www.w3.org/ns/oa#> 
	prefix rsch:  <http://vitali.web.cs.unibo.it/raschietto/> 
	prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
	prefix dcterms: <http://purl.org/dc/terms/> 
	prefix sem:   <http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#> 
	prefix foaf:  <http://xmlns.com/foaf/0.1/> 
	prefix prism: <http://prismstandard.org/namespaces/basic/2.0/> ';
 	$text='';
 	$b_pre=true;
	$json = json_decode($json,true);
	foreach ($json as $annotazione){//insieme di tutte le annotazioni ricevute
  		foreach ($annotazione as $key=>$ann){//annotazione completa
			/*	Tutti i addcslashes() servono a inserire un \ se nella stringa è presente un "
				Questo serve a rimettere a posto tutti \" che erano diventati " per colpa del
				json_decode
			*/
			//target
			$t_source= addcslashes($ann['target']['source'],'"');
			$t_id=addcslashes($ann['target']['id'],'"');
			$t_start= addcslashes($ann['target']['start'],'"');
			$t_end=addcslashes($ann['target']['end'],'"');
		
			//provenance
			$a_name=addcslashes($ann['provenance']['author']['name'],'"');
			$a_email=addcslashes($ann['provenance']['author']['email'],'"');
			$a_time=addcslashes($ann['provenance']['time'],'"');
		
			$multipart=$ann['annotations'];
			foreach ($multipart as $k=>$val){
			// parte multipla di ogni annotazione(il target e provenance sono al livello superiore) (se annotazione singola, viene eseguito una volta sola)
				
				$type[$k]=addcslashes($val['type'],'"');
				$label[$k]=addcslashes($val['label'],'"');
				$body[$k]=$val['body'];
				$b_subject[$k]=addcslashes($body[$k]['subject'],'"');
				$b_predicate[$k]=addcslashes($body[$k]['predicate'],'"');
				$b_label[$k]=null;
				
				if(isset($body[$k]['label']))$b_label[$k]=addcslashes($body[$k]['label'],'"');
				
				$b_r_id[$k]=null;
				$b_r_label[$k]=null;
				$b_r_resource[$k]=null;
				$b_object[$k]=null;
				$b_literal[$k]=null;
				
				if(isset($body[$k]['resource'])){
					if(strcmp($type[$k],'denotesRhetoric')==0){
						$b_r_resource[$k]=$body[$k]['resource'];
					}
					else {
						$b_r_id[$k]=addcslashes($body[$k]['resource']['id'],'"');
						$b_r_label[$k]=addcslashes($body[$k]['resource']['label'],'"');
					}
				}
				else if(isset($body[$k]['object'])){
					$b_object[$k]=addcslashes($body[$k]['object'],'"');
				}
				else {
					$b_literal[$k]=addcslashes($body[$k]['literal'],'"');
				}
				if($b_pre==true){
				$arr=explode(".",$t_source);
							//da classi.php, ma con opportuni riadattamenti 
							$ultimo=$arr[count($arr)-1];
							$tmp='';
							if(strcmp($ultimo,"php")==0||strcmp($ultimo,"html")==0){
								for($i=0;$i<count($arr)-1;$i++){
									//l'if è per non far aggiungere il . anche alla fine
									if($i<count($arr)-2) $tmp.=$arr[$i].".";
									else $tmp.=$arr[$i];
								}
							}
							else $tmp=$url.'/index';
								
							$urlsenzapunto=$tmp;
				$delete=$prefix.createDelete($type[$k],$label[$k],$body[$k],$b_subject[$k],$b_predicate[$k],$b_label[$k],$b_r_id[$k],$b_r_label[$k],$b_r_resource[$k],$b_object[$k],$b_literal[$k],$t_source,$t_id,$t_start,$t_end,$a_name,$a_email,$a_time);
				sparql_insert_delete($delete,"ltw1521",'kaA$e32P');
				//echo($delete);
				}
			}
		}
	}
}

function createDelete($type,$label,$body,$b_subject,$b_predicate,$b_label,$b_r_id,$b_r_label,$b_r_resource,$b_object,$b_literal,$t_source,$t_id,$t_start,$t_end,$a_name,$a_email,$a_time){
	$prefix='prefix schema: <http://schema.org/> 
	prefix fabio: <http://purl.org/spar/fabio/> 
	prefix xsd:   <http://www.w3.org/2001/XMLSchema#> 
	prefix skos:  <http://www.w3.org/2009/08/skos-reference/skos.html> 
	prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> 
	prefix frbr:  <http://purl.org/vocab/frbr/core#> 
	prefix dlib:  <http://www.dlib.org/dlib/> 
	prefix deo:   <http://purl.org/spar/deo/> 
	prefix cito:  <http://purl.org/spar/cito/> 
	prefix sro:   <http://salt.semanticauthoring.org/ontologies/sro#> 
	prefix oa:    <http://www.w3.org/ns/oa#> 
	prefix rsch:  <http://vitali.web.cs.unibo.it/raschietto/> 
	prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
	prefix dcterms: <http://purl.org/dc/terms/> 
	prefix sem:   <http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#> 
	prefix foaf:  <http://xmlns.com/foaf/0.1/> 
	prefix prism: <http://prismstandard.org/namespaces/basic/2.0/> ';
	$tipo=$label;
	$source=$t_source;
	$start=$t_start;
	$end=$t_end;
	$id=$t_id;
	$mail=$a_email;
	$time=$a_time;
	$predicato=$b_predicate;
	$extra=false;
	switch($type){
		case "hasTitle":
			$oggetto="\"$b_object\"";
			break;
		case "hasPublicationYear":
			$oggetto="\"$b_literal\"^^xsd:date";
			break;
		case "hasAuthor":
			$oggetto="<$b_r_id>";
			$r_label="\"$b_r_label\"";
			$extra=true;
			break;
		case "hasDOI":
			$oggetto="\"$b_literal\"^^xsd:string";
			break;
		case "denotesRhetoric":
			$oggetto=$b_r_resource;
			break;
		case "cites":
			$oggetto="<$b_r_id>";
			$r_label="\"$b_label\"";
			$extra=true;
			break;
		case "hasComment":
			$oggetto="\"$b_literal\"^^xsd:string";
			break;
		case "hasURL":
			$oggetto="\"$b_literal\"^^xsd:string";
			break;
	}
	$query=$prefix."WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
							DELETE {
				                ?annotation ?p1 ?o1.
								?target ?p2 ?o2.
								?body ?p3 ?o3.
								?selector ?p4 ?o4.
								";
	if($extra){
		$query.="?obj ?p5 ?o5.
		";
	}
	$query.="}
								WHERE {
								?annotation a oa:Annotation;
									rdfs:label \"$tipo\";
									oa:hasTarget ?target;
									oa:hasBody ?body;
									oa:annotatedAt \"$time\";
									oa:annotatedBy <mailto:$mail>.
								?target a oa:SpecificResource;
									oa:hasSource <$source>;
									oa:hasSelector ?selector.
								?selector a oa:FragmentSelector;
									rdf:value \"$id\";
									oa:start \"$start\"^^xsd:nonNegativeInteger;
									oa:end \"$end\"^^xsd:nonNegativeInteger.
								?body a rdf:Statement;
									rdf:predicate $predicato;
									rdf:object $oggetto.
								?annotation ?p1 ?o1.
								?target ?p2 ?o2.
								?body ?p3 ?o3.
								?selector ?p4 ?o4.
			  					";
	if($extra){
		$query.="				$oggetto rdfs:label $r_label.
								?obj ?p5 ?o5.
		";
	}
	$query.="}";
	return $query;
}

function deleteFunction($url,$tipo,$id,$start,$end){
	$prefix='prefix schema: <http://schema.org/> 
	prefix fabio: <http://purl.org/spar/fabio/> 
	prefix xsd:   <http://www.w3.org/2001/XMLSchema#> 
	prefix skos:  <http://www.w3.org/2009/08/skos-reference/skos.html> 
	prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> 
	prefix frbr:  <http://purl.org/vocab/frbr/core#> 
	prefix dlib:  <http://www.dlib.org/dlib/> 
	prefix deo:   <http://purl.org/spar/deo/> 
	prefix cito:  <http://purl.org/spar/cito/> 
	prefix sro:   <http://salt.semanticauthoring.org/ontologies/sro#> 
	prefix oa:    <http://www.w3.org/ns/oa#> 
	prefix rsch:  <http://vitali.web.cs.unibo.it/raschietto/> 
	prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
	prefix dcterms: <http://purl.org/dc/terms/> 
	prefix sem:   <http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#> 
	prefix foaf:  <http://xmlns.com/foaf/0.1/> 
	prefix prism: <http://prismstandard.org/namespaces/basic/2.0/> ';
	switch ($tipo) {
	    case 'TT':
			$query='
			WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
							DELETE {
				                ?annotation ?p1 ?o1.
								?target ?p2 ?o2.
								?body ?p3 ?o3.
								?selector ?p4 ?o4.
			  					?obj ?p5 ?o5.
							}WHERE {
					        	?annotation a oa:Annotation;
									oa:hasTarget ?target;
									oa:hasBody ?body.
								?body rdf:object ?obj.
								?target	oa:hasSource ?src;
									oa:hasSelector ?selector.
								?annotation ?p1 ?o1.
								?target ?p2 ?o2.
								?body ?p3 ?o3.
								?selector ?p4 ?o4.
			   					OPTIONAL {
									?annotation rdfs:label "Citazione".
			    					?obj ?p5 ?o5
								}
								FILTER regex(str(?src),"'.$url.'")
				}';
			break;
		case "T":
			$query='
				WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation rdf:label "Titolo".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';
			break;
	    case "U":
			$query='WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation redf:label "URL".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';
			break;
	    case "R":
			$query='WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation redf:label "Retorica".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';
			break;
	    case "D":
			$query='WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation redf:label "DOI".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';
			break;
	    case "A":
					 $query='WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation redf:label "Autore".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';

		break;
	    case "CIT":
				$query='WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation redf:label "Citazione".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';
		break;
	    case "ANN":
					 $query=' WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation redf:label "Anno di pubblicazione".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';

		break;
	    case "C":
					 $query='WITH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
				DELETE {
	                ?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
				}WHERE {
					?annotation redf:label "Commento".
		        	?annotation a oa:Annotation;
						oa:hasTarget ?target;
						oa:hasBody ?body.
						?target	oa:hasSource ?src;
						oa:hasSelector ?selector.
						?annotation ?p1 ?o1.
					?target ?p2 ?o2.
						?body ?p3 ?o3.
						?selector ?p4 ?o4.
						FILTER regex(str(?src),"'.$url.'")
				}';
		break;
	}
	$query=$prefix.$query;
	sparql_insert_delete($query,'ltw1521','kaA$e32P');
	return $query;
}
