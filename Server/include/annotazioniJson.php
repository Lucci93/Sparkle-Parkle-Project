<?php
//file scritto da Gabriele Casanova
require_once "SparkleScraper.php";
require_once "Classi.php";

function set_body_lable($body){
	$label=$body->label;
	if (strcmp($label,"")!=0){
		return "\"label\": \"$label\",";
	}
	else return "";
}
function set_body_object($body,$type){
	$out="";
	$etiquette=find_body_etiquette($type);
	if(isset($body->resources)){
		$res=$body->resources;
		$out="\"resource\": {
                            \"id\":\"$res->id\",
                            \"label\": \"$res->label\"
                        }";
	}
	else{
	$out="\"$etiquette\": \"$body->literal\"";
	}
	return $out;
}

//questa funzione crea solo la parte multipla di una annotazione, solo con i dati senza target e provenance
function create_ann_multipart($annotazione){
	$out="";
	foreach($annotazione as $key=>$value){
	
	$body=$value->body;
	$label=set_body_lable($body);
	$obj=set_body_object($body,$value->type);
	$out.="{
						\"type\": \"$value->type\",
						\"label\": \"$value->label\",
						\"body\": {
							$label
							\"subject\": \"$body->subject\",
							\"predicate\": \"$body->predicate\",
							$obj
						}
					},";
	}
	$out=substr($out,0,-1);//toglie la virgola finale
	return $out;
		


}

//questa funzione crea l'annotazione multipla, compresa di target e provenance
function create_ann_json($param){
	$target=$param->target;
	$provenance=$param->provenance;
	$author=$provenance->author;	
	
	$out="{
				\"annotations\": [
					";
	$out.=create_ann_multipart($param->annotation);			
	$out.="],
				\"target\": {
					\"source\": \"$target->source\",
					\"id\": \"$target->id\",
					\"start\": \"$target->start\",
					\"end\": \"$target->end\"
				},
				\"provenance\": {
					\"author\": {
						\"name\": \"$author->name\",
						\"email\": \"$author->email\"
					},
					\"time\": \"$provenance->time\"
				}
			}";
	return $out;
}

//questa funzione crea il json finale, con l array di tutte le annotazioni fatte
function create_all_json($ins_ann){
	$out="{
    \"annotazioni\": [
            ";
	foreach($ins_ann as $key=>$val){
	$out.=create_ann_json($val).",";
	}
	$out=substr($out, 0, -1);
	$out.="]
}";

return $out;
}



?>
