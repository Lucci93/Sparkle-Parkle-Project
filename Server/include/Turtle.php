<?php
//scritta da Michele D'Onza
require_once"SparqleParkle_lib.php";
require_once"Delete.php";

function jsonToTurtle ($annotazioni){
 	// JSON per aggiungere un articolo.
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
	$annotazioni = json_decode($annotazioni,true);
	foreach ($annotazioni as $annotazione){//insieme di tutte le annotazioni ricevute
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
				$pre='
				<'.$b_subject[$k].'> a fabio:Expression;
				fabio:hasRepresentation <'.$t_source.'>.
				<'.$t_source.'> a fabio:Item .
				
				<'.$urlsenzapunto.'> a fabio:Work ;
				fabio:hasPortrayal <'.$t_source.'>.
				<'.$urlsenzapunto.'> frbr:realization <'.$b_subject[$k].'>.
				';
				}

				$invia[$k]=create_turtle($type[$k],$label[$k],$body[$k],$b_subject[$k],$b_predicate[$k],$b_label[$k],$b_r_id[$k],$b_r_label[$k],$b_r_resource[$k],$b_object[$k],$b_literal[$k],$t_source,$t_id,$t_start,$t_end,$a_name,$a_email,$a_time);
				$text.=$b_pre?"\n${pre}":"";
				$b_pre=false;
				$text.="\n${invia[$k]}";
			}				
		}
 	}
 	
	$query=$prefix.'
	INSERT DATA {
	GRAPH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521>
	{'.$text.'}}';

	//inserisco le annotazioni
	sparql_insert_delete($query,"ltw1521",'kaA$e32P');
	//echo ($query);
	return $query;
}
	
function create_turtle($type,$label,$body,$b_subject,$b_predicate,$b_label,$b_r_id,$b_r_label,$b_r_resource,$b_object,$b_literal,$t_source,$t_id,$t_start,$t_end,$a_name,$a_email,$a_time){
	$target='oa:hasTarget  [ 
					a oa:SpecificResource;
					oa:hasSource  <'.$t_source.'>;
					oa:hasSelector [ 
						a oa:FragmentSelector ;
						rdf:value "'.$t_id.'";
						';
	$star_end_lines='';
	if(!($t_start==0&&$t_end==0)){
		$star_end_lines='oa:start "'.$t_start.'"^^xsd:nonNegativeInteger ;
						oa:end "'.$t_end.'"^^xsd:nonNegativeInteger';
	}
	$target.=$star_end_lines.'] 
			];';
	
	$provenance='oa:annotatedBy <mailto:'.$a_email.'> ;
		oa:annotatedAt "'.$a_time.'" .

	<mailto:'.$a_email.'> foaf:name "'.$a_name.'"  ;
		 schema:email "'.$a_email.'" .';
					


		 
	if($type=="hasTitle"){
		$inv='[] a oa:Annotation ; 
			rdfs:label "'.$label.'";
			'.$target.'
			oa:hasBody [
				a rdf:Statement;
				rdf:subject <'.$b_subject.'>;
				rdf:predicate '.$b_predicate.'; 
				rdf:object "'.$b_object.'" 
			];
			'.$provenance;
	return $inv;
	}
		
		
		
	else if($type=="hasPublicationYear"){
	$inv='[] a oa:Annotation ;
			rdfs:label "'.$label.'";
			'.$target.' 
			oa:hasBody [
				a rdf:Statement ;
				rdf:subject <'.$b_subject.'>; 
				rdf:predicate '.$b_predicate.' ;
				rdf:object "'.$b_literal.'"^^xsd:date  
			];
			'.$provenance;
	return $inv;
	}
		
		
		
	else if($type=="hasAuthor"){
			$inv='[] a oa:Annotation ;
			rdfs:label "'.$label.'" ;
			'.$target.'
			oa:hasBody [
				a rdf:Statement ; 
				rdf:subject <'.$b_subject.'>  ;
				rdf:predicate '.$b_predicate.';
				rdf:object <'.$b_r_id.'>;
				rdfs:label "'.$b_label.'" 
			];
				'.$provenance.'<'.$b_r_id.'> rdfs:label "'.$b_r_label.'" .';
	return $inv;
	}
		
		
		
	else if($type=="hasDOI"){
			$inv='[] a oa:Annotation ;
			rdfs:label "'.$label.'";
			'.$target.' 
				oa:hasBody [
					a rdf:Statement ;
					rdf:subject <'.$b_subject.'>; 
					rdf:predicate '.$b_predicate.' ;
					rdf:object "'.$b_literal.'"^^xsd:string  
				];
				'.$provenance;	 
	return $inv;
	}
		
		
		
	else if($type=="denotesRhetoric"){
	$inv='[] a oa:Annotation ; 
				rdfs:label "'.$label.'";
				'.$target.'
				oa:hasBody [
					a rdf:Statement ; 
					rdf:subject <'.$b_subject.'>;
					rdf:predicate '.$b_predicate.'; 
					rdf:object '.$b_r_resource.' ;
					rdfs:label "'.$b_label.'" 
				];
				'.$provenance;
	return $inv;
	}
		
		
		
	else if($type=="cites"){
			$inv='[] a oa:Annotation ; 
				rdfs:label "'.$label.'";
				'.$target.'
				oa:hasBody [
					a rdf:Statement ; 
					rdf:subject <'.$b_subject.'>;
					rdf:predicate '.$b_predicate.'; 
					rdf:object <'.$b_r_id.'> ;
					rdfs:label "'.$b_label.'" 
				];
				'.$provenance.'

			<'.$b_r_id.'> rdfs:label "'.$b_label.'".';
	return $inv;
	}
		
		
		
	else if($type=="hasComment"){
	$inv='[] a oa:Annotation ;
		rdfs:label "'.$label.'";
		'.$target.'
		oa:hasBody [
			a rdf:Statement ;
			rdf:subject <'.$b_subject.'>; 
			rdf:predicate '.$b_predicate.' ;
			rdf:object "'.$b_literal.'"^^xsd:string  
		];
		'.$provenance;
	return $inv;
	}
		
		
		
	else if($type=="hasURL"){
			$inv='[] a oa:Annotation ;
		rdfs:label "'.$label.'";
		'.$target.' 
		oa:hasBody [
			a rdf:Statement ;
			rdf:subject <'.$b_subject.'>; 
			rdf:predicate '.$b_predicate.' ;
			rdf:object "'.$b_literal.'"^^xsd:string  
		];
		'.$provenance;
	return $inv;
	}			
}
