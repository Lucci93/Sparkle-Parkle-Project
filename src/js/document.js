//QUERY E FUNZIONI SCRITTE DA DAVIDE

//variabili
lista_autori = []; //array degli autori
var url_sparql="http://tweb2015.cs.unibo.it:8080/data/query?"; //url dove eseguire le query sparql
group_property=""; //variabile che indica a quale gruppo appartiene l'annotazione corrente
array_def=[]; //variabile che mantiene in memoria tutti i deferred per dare una sequenzialità alle richieste AJAX
iterator=0; //variabile che sa esattamente quante richieste ajax ho già sistemato
arr_group=[]; //dizionario contenente tutti i gruppi
arr_group_tmp=[]; //variabile con l'elenco degli ltw esistenti. Non è un dizionario (quindi diversa da quella sopra), serve in showAnnotations
ok_next_req=true; //variabile che mi sincronizza le chiamate allo scraper con la loro effettiva visualizzazione prima di andare a leggere altri grafi

//elenco dei prefissi per tutte le query
var prefix="PREFIX dcterms: <http://purl.org/dc/terms/>"+
	"PREFIX fabio: <http://purl.org/spar/fabio/>"+
	"PREFIX oa: <http://www.w3.org/ns/oa#>"+
	"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+
	"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"+
	"PREFIX frbr: <http://purl.org/vocab/frbr/core#>"+
	"PREFIX foaf: <http://xmlns.com/foaf/0.1/>"+
	"PREFIX schema: <http://schema.org/>";

//variabili contenenti le query
var q_list_document,q_list_author,q_annotations_start,q_advanced_start,q_advanced_year_start,q_advanced_author_start,q_advanced_title_start;
var q_annotations_end,q_advanced_end,q_advanced_year_end,q_advanced_author_end,q_advanced_title_end;

q_annotations_end="\")}";

//query che restituisce la lista di tutti i documenti in memoria nel grafo
q_list_document="SELECT DISTINCT ?item ?title WHERE{"+
"?expr a fabio:Expression;"+
"fabio:hasRepresentation ?item."+
"?work a fabio:Work;"+
"frbr:realization ?page."+
"?nota a oa:Annotation;"+
"rdfs:label \"Titolo\";"+
"oa:hasBody ?body;"+
"oa:hasTarget ?target."+
"?target oa:hasSource ?item."+
"?body rdf:subject ?page;"+
"rdf:object ?title."+
"}";

//query che restituisce la lista di tutti gli autori presenti nel grafo
q_list_author="SELECT DISTINCT ?item ?author FROM <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1521> WHERE{"+
"?note a oa:Annotation;"+
"rdfs:label \"Autore\";"+
"oa:hasBody ?body;"+
"oa:hasTarget ?target."+
"?body rdf:object ?item."+
"?item rdfs:label ?author }";

//la query per la ricerca avanzata la divido in pezzi di query da concatenare a seconda di come si vuole fare la ricerca avanzata
q_advanced_start=q_list_document.substring(0,q_list_document.length-1);
q_advanced_end="}";

q_advanced_year_start="?nota_year a oa:Annotation;"+
"rdfs:label ?label_year;"+
"oa:hasBody ?body_year;"+
"oa:hasTarget ?target_year."+
"?target_year oa:hasSource ?item."+
"?body_year rdf:subject ?page;"+
"rdf:object ?anno."+
"FILTER regex(str(?label_year),\"anno\",\"i\")"+
"FILTER regex(str(?anno),\"";
q_advanced_year_end="\",\"i\")";

q_advanced_author_start="?nota_auth a oa:Annotation;"+
"rdfs:label ?label_auth;"+
"oa:hasBody ?body_auth;"+
"oa:hasTarget ?target_auth."+
"?target_auth oa:hasSource ?item."+
"?body_auth rdf:subject ?page;"+
"rdf:object ?autore."+
"?autore rdfs:label ?nome_auth."+
"FILTER regex(str(?label_auth),\"aut\",\"i\")"+
"FILTER regex(str(?nome_auth),\"";
q_advanced_author_end=q_advanced_year_end;

q_advanced_title_start="FILTER regex(str(?title),\"";
q_advanced_title_end=q_advanced_year_end;

//funzione per aggiornare le query quando cambia il gruppo selezionato
function refreshQuery(ltw){
//query che restituisce tutte le annotazioni di un documento. url documento da inserire
	q_annotations_start="SELECT DISTINCT ?id ?label ?b_label ?start ?end ?sub ?pred ?obj ?mail ?nome ?quando ?autore FROM <"+sparql_point+ltw+"> WHERE {"+
	                "?annotation a oa:Annotation;"+
					"rdfs:label ?label;"+
  					"oa:hasTarget ?target;"+
    				"oa:hasBody ?body;"+
   					"oa:annotatedBy ?dachi;"+
					"oa:annotatedAt ?quando."+
					"?target a oa:SpecificResource;"+
					"oa:hasSource ?src;"+
					"oa:hasSelector ?selector."+
					"?selector a oa:FragmentSelector;"+
					"rdf:value ?id."+
					"?body rdf:subject ?sub;"+
					"rdf:predicate ?pred;"+
					"rdf:object ?obj."+
					"?dachi foaf:name ?nome;"+
					"schema:email ?mail."+
 					"OPTIONAL {?body rdfs:label ?b_label}"+
 					"OPTIONAL {?selector oa:start ?start;"+
								"oa:end ?end}"+
					"OPTIONAL {?obj rdfs:label ?autore}"+
					"FILTER regex(str(?src),\"";
}

//setto inizialmente le query col nostro grafo
refreshQuery('ltw1521');


//funzioni

//funzione che mi restituisce la query completa da mandare al server dati i prefissi e la query che si vuole utilizzare
function queryGenerator(prefix,query){
	var q=prefix+query;
	//gli # danno problemi con la URL-Encoding. Li sostituisco col loro corrispondente valore direttamente qui
	var regex=new RegExp('(#)','g');
	return q.replace(regex,"%23");
}

/*metodo che esegue la query per la richiesta delle annotazioni di un documento e le mostra
scrivendo "jsonp" non va un cazzo perchè jQuery, a quanto pare, pensa di ricevere uno script (e non va nulla).
Scrivendo "script", entra nella success ma non funziona nulla (perchè il valore del JSON non viene passato come parametro alla funzione).
Questa cosa mi uccide. Sono le 3 di notte e sta cosa è più inquietante di un horror. Sono totalmente allibito
EDIT: risolto con un proxy, dato che FUSEKI non gestisce le callback con le query DESCRIBE, ma solo nelle SELECT (non so il perchè di tale scelta)
quindi server-side aggiungo la gestione della callback alla risposta di Fuseki*/
function getAnnotations(){
	//essendo che carico tutte le annotazioni da capo, cancello le vecchie memorizzate, se ce ne sono
	old_notes=[];
	arr_def=new Array(Object.keys(arr_group).length);
	arr_group_tmp=[];
	var i=0;
	for (var x in arr_group){
		arr_group_tmp[i]=x;
		arr_def[i]=new $.Deferred();
		i++;
	}
	//per ogni gruppo
	for(i=0;i<arr_group_tmp.length;i++){
		//preparo la query
		var articolo=URI;
		//se sono su unibo, modifico l'uri, qualsiasi sia, per ritrovarmi solamente http://bla/bla/numero
		if(id_usato==id_alma){
			articolo=articolo.split('.html')[0];
			articolo=articolo.split('index')[0];
			if(articolo.slice(-1)=="/") articolo=articolo.substring(0,articolo.length-2);
		}
		//rimuovo anche evenutali http e www, in modo da essere sicuro di recuperare tutte le annotazioni dai vari grafi su questo documento
		var tmp=articolo.split("http://");
		articolo=tmp.length>1?tmp[1]:tmp[0];
		tmp=articolo.split("www.");
		articolo=tmp.length>1?tmp[1]:tmp[0];
		//ora l'articolo è pronto per la query
		group_property=arr_group_tmp[i];
		refreshQuery(group_property);
		var query=queryGenerator(prefix,q_annotations_start+articolo+q_annotations_end);
		//eseguo la richiesta ajax
		ajaxAnnotationReq(query,i);
	}
	$.when.apply($,arr_def).done(function (){
		//questo codice viene eseguito solo alla fine di tutte le chiamate ajax e il salvataggio locale di tutte le annotazioni valide
		var list=$('.gruppi_check').children('label');
		list=$(list).filter(function (key,node){
			if($('.fragment[by='+$(node).children().val()+']').length>0) return true;
			else return false;
		});
		list.sort(function (a,b){
			var ta=$(a).text();
			var tb=$(b).text();
			return ta<tb?-1:(ta>tb?1:0);
		});
		$('.gruppi_check').empty();

		$(list).attr('checked','checked');
		$.each(list, function (key,node){
			$('.gruppi_check').append(node).append('<br>')
		});
		$('.gruppi_check input').attr('checked','checked').unbind('change').on('change',showOrHide);
		//nascondo il plus delle citazioni se non sono loggato
		if(blindL) OpenClosePlusCita("hide");
	});
}

//funzione che esegue la richiesta ajax per un singolo gruppo per ottenere le annotazioni
function ajaxAnnotationReq(query,i){
	//console.log(query);
	$.ajax({
			url: url_sparql+"query="+query+"&output=json",
			method: 'GET',
			dataType: 'jsonp',
			success: function(json){
				//recupero il gruppo a cui appartiene tale json
				var okToResolve=true;
				group_property=arr_group_tmp[i];
				//se il json non è valido
				if(!isGoodJSON(json)){
					//se ho interrogato il mio sparqle point
					if(group_property=="ltw1521"){
						okToResolve=false;
						callScraper(query,i);
					}
				}
				else{
					//inserisco il gruppo, perchè ha delle annotazioni
					$('.gruppi_check').append('<label><input type="checkbox" name="gruppi" value="'+group_property+'">'+arr_group[group_property]+'</input></label><br>');
					JSONtoAnnotations(json['results']['bindings']);
				}
				//risolvo il deferred per dire che ho finito di mostrare le annotazioni, ma solo se non è stato chiamato lo scraper
				//per capire se è stato chiamato o meno lo scraper, controllo okToResolve e se la var i esiste
				if(okToResolve && i!=undefined) arr_def[i].resolve();
			},
			error: function(jqXHR,statusText,errorText){
				alert("Oops!, "+statusText+" "+errorText);
				arr_def[i].resolve();
			}
		});
}

//funzione che controlla se nel json ottenuto da Fuseki c'è un grafo di risposta
function isGoodJSON(json){
	return json['results']['bindings'].length>0;
}

//metodo che esegue la query per la richiesta dell'elenco dei documenti e li mostra
function getDocumentList(atLeast){
	$('.doc-el').empty();
	var query=queryGenerator(prefix,q_list_document);
	$.ajax({
		url: url_sparql+"query="+query+"&output=json",
		method: 'GET',
		dataType: "jsonp",
		success: function(data){
			var docs=data.results.bindings;
			//filtro i titoli mostrandone uno solo per ogni uri
			docs=filterUselessTitle(docs);
			var doc_list=docs['title'];
			var doc_uri_list=docs['url'];
			//inserisco i titoli trovati nell'elenco documenti
			$.each(doc_list, function (key){
                var nodo='<div class="docum"><p>' +doc_list[key] + '</p>' + '<p class="nascosto">' + doc_uri_list[key] + '</p></div>';
				$('.doc-el').append(nodo);
			});
			if(atLeast)FirstRequest();
		},
		error: function(jqXHR,statusText,errorText){
			alert("Oops!, "+statusText+" "+errorText);
		}
	});
}

//funzione che esegue la ricerca avanzata
function advancedSearch(autore,anno,title){
    //inizio a preparare la query
    var query=q_advanced_start;
    //inserisco i pezzi aggiuntivi di query a seconda dei dati inseriti dall'utente
    if(title!="") query+=q_advanced_title_start+title+q_advanced_title_end;
    if(autore!="")query+=q_advanced_author_start+autore+q_advanced_author_end;
    if(anno!="")query+=q_advanced_year_start+anno+q_advanced_year_end;
    //chiudo la query
    query+=q_advanced_end;
    //rendo la query trasmissibile
    query=queryGenerator(prefix,query);
    //eseguo la richiesta
    $.ajax({
        url: url_sparql+"query="+query+"&output=json",
        method: 'GET',
        dataType: "jsonp",
        success: function(data){
            $('.ricercare hr').nextAll().remove();
            var docs=data.results.bindings;
            //filtro i titoli mostrandone uno solo per ogni uri
            docs=filterUselessTitle(docs);
            var doc_list=docs['title'];
            var doc_uri_list=docs['url'];
            //inserisco i titoli trovati nell'elenco documenti
            $.each(doc_list, function (key){
                var nodo='<div class="docum"><p>' +doc_list[key] + '</p>' + '<p class="nascosto">' + doc_uri_list[key] + '</p></div>';
                $('.ricercare').append(nodo);
            });
        },
        error: function(jqXHR,statusText,errorText){
            alert("Oops!, "+statusText+" "+errorText);
        }
    });
}

//funzione per restituire solo un titolo per ogni URL ottenuto da una query
function filterUselessTitle(docs){
	var doc_list=[],doc_uri_list=[];
	var pos;
	$.each(docs,function(key,value){
		var articolo=value.item.value;
		//cerco di disambiguare possibili uri diversi per la stessa risorsa
		if(articolo.indexOf("unibo")!=-1){
			articolo=articolo.split('.html')[0];
			articolo=articolo.split('/index')[0];
		}
		//se non ho a che fare con dei DEFICIENTI che non capiscono un cazzo
		if(value.title.value!="hasTitle"){
			//se l'url non è già in memoria, lo inserisco
			if((pos=doc_uri_list.indexOf(articolo))==-1){
				doc_uri_list.push(articolo);
				doc_list.push(value.title.value);
			}
			//altrimenti tengo in memoria il titolo più lungo per ignorare annotazioni fatte col culo
			else if(doc_list[pos].length<value.title.value.length) doc_list[pos]=value.title.value;
		}
	});
	return {
		"title":doc_list,
		"url":doc_uri_list
	}
}

//metodo che esegue la query per la richiesta dell'elenco degli autori e li salva. Verranno mostrati in fase di aggiunta.
//per salvare solo il nome esteso (se presente) di ogni autore sfrutto 2 array, uno per gli uri e uno per i nomi
function getAuthorList(){
	//elimino tutti gli autori in memoria, se presenti
	$(lista_autori).empty();
	var lista_uri_autori=new Array();
	//preparo la query e la eseguo
	var query=queryGenerator(prefix,q_list_author);
	$.ajax({
		url: url_sparql+"query="+query+"&output=json",
		method: 'GET',
		dataType: "jsonp",
		success: function(data){
			var docs=data.results.bindings;
			//per ogni risultato
			$.each(docs,function (key,value){
				//recupero nome ed uri dell'autore
				var name=value.author.value;
				var uri=value.item.value;
				var pos;
				//se il nome non finisce con un '.' in fondo alla stringa (succede che ci sia e va scartato)
				if(name.substr(name.length - 1)!='.'){
					//se non ho ancora in memoria quell'autore oppure se il nome che ho è più corto di quello trovato, lo salvo
					if((pos=lista_uri_autori.indexOf(uri))==-1){
						lista_autori.push(name);
						lista_uri_autori.push(uri);
					}
					else if(lista_autori[pos].length<name.length) lista_autori[pos]=name;
				}
			});
			lista_autori.sort();
		},
		error: function(jqXHR,statusText,errorText){
			alert("Oops!, "+statusText+" "+errorText);
	    }
	    });
}

//richiede l'elenco degli altri gruppi LTW da cui dover leggere i valori
function getGroupsList(){
	//per permettere debugging agli altri, blocco sto metodo e forzo a leggere solo il nostro grafo
	$.ajax ({
        url: locate+"../Server/scrapingAltriGruppi.php",
        method: 'GET',
        dataType: "json",
        success: function(data) {
            $.each(data, function (key,val){
            	arr_group[val['sito']]=val['nome'];
            });
        },
        error: function(jqXHR, textStatus, textError) {
            alert( "Opss! " + textStatus + " " + textError );
        }
    });

}

//funzione che richiama lo scraper, salvando le annotazioni automatiche su Fuseki
function callScraper(query,i){
	$.ajax({
		url:locate+"Server/inviaAnnotazioni.php?url="+URI,
		method:"GET",
		dataType:"text",
		success: function(data){
			if(data=="ok" && i!=undefined){
				ajaxAnnotationReq(query,i);
			}
		},
		error: function(jqXHR, textStatus, textError) {
            alert( "Opss! " + textStatus + " " + textError );
        }
	});
}

function forceScraper(){
	//prima elimino le annotazioni
	var sem=new $.Deferred();
	old_notes=[];
	//nascondo il salva tutto
	$('#f-save').hide();
	deleteAnnotations(sem);
	hideAnnotations();
	Visibility();
	//poi richiamo lo scraper
	group_property="ltw1521";
	refreshQuery(group_property);
	//il deferred serve per sincronizzare le chiamate ajax in modo che non si sovrappongano
	var query=queryGenerator(prefix,q_annotations_start+'<'+URI+'>'+q_annotations_end);
	$.when(sem).done(function (){
		getAnnotations();
		getDocumentList(false);
		getAuthorList();
	});
}

//funzione che elimina le annotazioni
function deleteAnnotations(sem){
	$.ajax({
		url:locate+"Server/deleteAnnotations.php?url="+URI,
		method:"GET",
		dataType:"text",
		success: function(data){
			Allarme("Annotazioni eliminate. Scraping in corso...");
			sem.resolve();
		},
		error: function(jqXHR, textStatus, textError) {
            alert( "Opss! " + textStatus + " " + textError );
        }
	});
}
// ESECUZIONE SCRITTO DA DANIELE

// Funzione che al caricamento della pagina mi restituisce il primo documento della lista dei documenti
// Effettua una richiesta del codice HTML che inserisce nel apposita schermata di testo
function FirstRequest(){
        var request = $(':first-child', $('.doc-el'));
        request = $(':nth-child(2)', request).text();
        blindE=true;
        RequestHTML(request);
    }

$(document).ready(function(){
	//recuper l'elenco dei documenti e degli autori nel grafo
	getDocumentList(true);
    getAuthorList();
    //recupero la lista dei grafi da dover gestire
    getGroupsList();

    // Le volte successive alla prima chiamata automatica si dovrà cliccare sul documento che si vuole visualizzare per generarlo
    $(document).on('click', '.docum', function() {
        request = $(':nth-child(2)', $(this)).text();
		// se un documento non è in modifica allora aprine un altro
		if (!visible) {
			// nascondo la grafica delle annotazioni
	        if(!blindE){
	        	hideAnnotations();
				$('#p-gruppi').hide();
		        $('#p-filter').hide();
		        $('#f-plus').hide();
		        $('#f-fuseki').hide();
		        $('#f-eraser').hide();
		        $('#f-pencil').hide();
		        $('#fa-eye').addClass("fa-eye");
		        $('#fa-eye').removeClass("fa-eye-slash");
		        OpenClosePlusCita("hide");
		        blindE = true;
	        }
	        URI=request;
	        $('.document').show("slow");
	        $('.doc').hide();
	        blindD = true;
			RequestHTML(request);
		}
		else {
			Allarme("Salvare prima di caricare un nuovo documento!");
		}
	});

});
