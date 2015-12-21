//FILE SCRITTO DA DAVIDE
var info_su_citazioni=[];
var citazioni=[];
//partendo dal JSON ottenuto da Fuseki, scrivo il JSON standard delle slide che utilizzerò per mostrare e caricare le annotazioni
function JSONtoAnnotations(json){
    //tipo: Autore, DOI, ecc.
    var type,tipo,utente;
    //svuoto la le variabili che conterrano le citazioni e i loro valori
    info_su_citazioni=[];
    citazioni=[];
    $.each(json,function (i,item){
        var bkp_span=$('.testo').html();
        var bkp_note=$('.doc-right').html();
        try{
            type=item['label']['value'];
            type=type.toLowerCase();
            if(type=="citazione"){
                //salvo la citazione incontrata e mi fermo
                citazioni.push(item);
                return true;
            }
            //controllo se si tratta di un'annotazione all'interno di una citazione
            var insideCito=item['sub']['value'].indexOf('_cited')>0;
            //se sono dentro ad una citazione posso fermarmi. verrà gestita dalla citazione. memorizzo solo di averla incontrata
            if(insideCito){
                var subj=item['sub']['value'];
                //memorizzo di aver incontrato questa annotazione e quale documento riguarda
                if(!info_su_citazioni[subj]) info_su_citazioni[subj]=[];
                info_su_citazioni[subj].push(item);
                return true;
            }
            //recupero le informazioni dell'annotazione dai pezzi di annotazione recuperate sopra
            var values=getAnnotationValues(item);
            //se l'annotazione è sul documento, la bypasso
            if(values['id']=="document") return true;
            var tipo=switchKindOfType(type);
            if(!tipo){
                //gestione per le annotazioni di alcuni gruppi
                type=item['pred']['value'];
                type=type.replace(/<|>/g,"");
                tipo=switchKindOfType(type);
                type=tipo['type'];
                tipo=tipo['tipo'];
            }
            var valore=getValueByType(type,item);
            //controllo di non aver avuto errori con l'Xpath
            if(!values['elemento']) return true;
            //mostro annotazione graficamente
            var elemento=showAnnotation(tipo,values['elemento'],values['start'],values['end'],undefined,true,group_property);
            //memorizzo l'annotazione
            setAnnotationValues(valore,tipo,elemento,values['mail'],values['nome'],values['data'],values['id'],values['start'],values['end'],insideCito);
            //controllo che non ci siano stati problemi
            checkIntegritySystem(bkp_span,bkp_note);
        }catch(exc){
            $('.testo').html(bkp_span);
            $('.doc-right').html(bkp_note);
        }
    });
    //ora ho mostrato tutte le annotazioni, tranne le citazioni. ora penso ad esse
    porcaMerdaCita();
    //come ultima cosa, ridisabilito i link
    linkDisabler();
    //e riabilito il click nelle annotazioni perchè tende a buggarsi senza apparente motivo
    $('.elenco h3').unbind("click").on("click",Elenco);
    // i più non devono essere visibili se chiamo le annotazioni quando sono in modalità reader
    if(!blindL) {
        $('.fa-plus-square-o').show();
    }
    else {
        $('.fa-plus-square-o').hide();
    }
    //rimuovo qualsiasi range in memoria
    range="";
}

function getAnnotationValues(item){
    var toret=[];
    toret['nome']=item['nome']['value'];
    toret['mail']=item['mail']['value'];
    toret['data']=item['quando']['value'];
    toret['id']=item['id']['value'];
    toret['elemento']=getElementByTargetId(toret['id']);
    //se ci sono start ed end li leggo, altrimenti li genero
    if(item['start'] && item['end'] && item['start']['value']!="" && item['end']['value']!=""){
        toret['start']=item['start']['value'];
        toret['end']=item['end']['value'];
    }else{
        toret['start']=0;
        toret['end']=$(toret['elemento']).text().length;
    }
    return toret;
}

//funzione che recupera il valore dell'annotazione in base al tipo
function getValueByType(type,item){
    var valore;
    switch(type){
        case "autore":
        //if perchè alcuni gruppi non salvano il nome dell'autore da solo
        if(item['autore']){
            valore=item['autore']['value'];
        }else{
            valore=item['b_label']['value'];
        }
            break;
        case "retorica":
            //recupero valore
            var tmp=item['obj']['value'];
            //trasformo l'URI semplice in nome dell'annotazione
            valore=tmp.split("http://salt.semanticauthoring.org/ontologies/sro#")[1]?tmp.split("http://salt.semanticauthoring.org/ontologies/sro#")[1]:tmp.split("sro:")[1];
            if(!valore)
                valore=tmp.split('http://purl.org/spar/deo/')[1]?tmp.split('http://purl.org/spar/deo/')[1]:tmp.split('deo:')[1];
            break;
        case "citazione":
            valore=item['autore']['value'];
            break;
        default: //anno di pubblicazione,titolo,doi,url,commento
            valore=item['obj']['value'];
            break;
    }
    return valore;
}
//funzione che si occupa di restituire la label del json dato la label locale dell'annotazione
function switchKindOfType(old_type){
    switch (old_type.toLowerCase()){
        case "autore":
            return "hasAuthor";
        case "retorica":
            return "denotesRhetoric";
        case "anno di pubblicazione":
            return "hasPublicationYear";
        case "url":
            return "hasURL";
        case "doi":
            return "hasDOI";
        case "commento":
            return "hasComment";
        case "titolo":
            return "hasTitle";
        case "citazione":
            return "cites";
        //aggiungo i predicati per una maggiore precisione (serve solo con gli altri gruppi)
        case "http://purl.org/dc/terms/creator":            //autore
            return {"type":"autore","tipo":"hasAuthor"};
        case "http://purl.org/dc/terms/title":              //titolo
            return {"type":"titolo","tipo":"hasTitle"};
        case "http://prismstandard.org/namespaces/basic/2.0/doi"://doi
            return {"type":"doi","tipo":"hasDOI"};
        case "http://purl.org/spar/fabio/haspublicationyear":    //anno di pubblicazione
            return {"type":"anno di pubblicazione","tipo":"hasPublicationYear"};
        case "http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#denotes":      //retorica
            return {"type":"retorica","tipo":"denotesRhetoric"};
        case "http://purl.org/spar/cito/cites":             //citazione
            return {"type":"citazione","tipo":"cites"};
        case "http://schema.org/comment":             //commento
            return {"type":"commento","tipo":"hasComment"};
        case "http://purl.org/spar/fabio/hasurl":             //url
            return {"type":"url","tipo":"hasURL"};
        default:
            return undefined;
    }
}

//funzione che ottiene tutti i valori che servono alla funzione Mod_JSON per salvare le annotazioni dal json
function setAnnotationValues(valore,tipo,spanner,sEmail,sUser,sDate,ide,start,end,citazione){
    var ValIns=valore,descript;
    var tmp=getTypeForDani(tipo);
    type=tmp['type'];
    descript=tmp['desc'];
    var maxdim=maxEnd(end,$(spanner).attr('id'));
    Memo_JSON(ValIns,descript,spanner,sEmail,sUser,sDate,ide,start,end,maxdim,citazione,type);
}

//funzione per convertire il tipo di annotazioni del JSON con i tipi utilizzati da dani nella visualizzazione delle annotazioni
function getTypeForDani(type){
    switch(type){
        case "hasTitle":
            return {
            	type:"titolo",
            	desc:"Aggiunto titolo: "
            };
        case "hasPublicationYear":
            return {
            	type:"data",
            	desc:"Aggiunta data: "
            };
        case "hasAuthor":
            return {
            	type:"autore",
            	desc:"Aggiunto autore: "
            };
        case "hasDOI":
            return {
            	type:"doi",
            	desc:"Aggiunto doi: "
            };
        case "hasURL":
            return {
            	type:"url",
            	desc:"Aggiunto url: "
            };
        case "hasComment":
            return {
            	type:"commento",
            	desc:"Aggiunto commento: "
            };
        case "denotesRhetoric":
            return {
            	type:"denotazione",
            	desc:"Aggiunta denotazione: "
            };
        case "cites":
            return {
            	type:"citazione",
            	desc:"Aggiunta citazione: "
            };
    }
}

//funzione che, aiutata da qualchè divinità sconosciuta, riconosce tutte le annotazioni del grafo CHE si trovano all'interno della citazione trovata
function porcaMerdaCita(){
    //per ogni citazione del documento
    $.each(citazioni, function (key,node){
        var bkp_span=$('.testo').html();
        var bkp_note=$('.doc-right').html();
        try{
            var insideCito=false;
            var cited=node['obj']['value'];
            var cited_notes=info_su_citazioni[cited];
            //ora ho tutto quello che mi serve. recupero le info della citazione
            var values=getAnnotationValues(node);
            var tipo=switchKindOfType('citazione');
            var valore=getValueByType('citazione',node);
            //info recuperate. la mostro e la salvo
            var elemento=showAnnotation('cites',values['elemento'],values['start'],values['end'],undefined,true,group_property);
            setAnnotationValues(valore,tipo,elemento,values['mail'],values['nome'],values['data'],values['id'],values['start'],values['end'],insideCito);
            checkIntegritySystem(bkp_span,bkp_note);
            //se arrivo qui,vuol dire che va tutto bene finora. ora comincio con le annotazioni più interne
            insideCito=true;
            if(cited_notes){
                $.each(cited_notes,function (key,node){
                    var bkp_span=$('.testo').html();
                    var bkp_note=$('.doc-right').html();
                    try{
                        //recupero i valori
                        var type=node['label']['value'].toLowerCase();
                        var tipo=switchKindOfType(type);
                        if(!tipo){
                            //gestione per le annotazioni interne di alcuni gruppi
                            type=node['pred']['value'];
                            type=type.replace(/<|>/g,"");
                            tipo=switchKindOfType(type);
                            type=tipo['type'];
                            tipo=tipo['tipo'];
                        }
                        var valore=getValueByType(type,node);
                        var values=getAnnotationValues(node);
                        //salvo l'annotazione
                        setAnnotationValues(valore,tipo,elemento,values['mail'],values['nome'],values['data'],values['id'],values['start'],values['end'],insideCito);
                    }catch(exc){
                        $('.testo').html(bkp_span);
                        $('.doc-right').html(bkp_note);
                    }
                });
            }
        }catch(exc){
            $('.testo').html(bkp_span);
            $('.doc-right').html(bkp_note);
        }
    });
}

//funzione uguale a Memo di Daniele, ma con parametri modificati per mostrare le annotazioni direttamente dal JSON.
//cambiano solo i parametri e le variabili locali rispetto alla funzione originale
function Memo_JSON(ValIns, descript, spanner,sEmail,sUser,sDate,ide,start,end,maxdim,citazione,type) {
    //a differenza della MEMO normale, la reference la prendo dallo spanner
    //e non eseguo alcun settaggio grafico se non l'append dell'annotazione
    var reference=$(spanner).attr('id');
    if(!reference){
        var d=new Date();
        reference='doc'+d.getTime();
    }
    // la differenza tra una citazione e le latre annotazioni è che questa ha bisogno del suo outerHTML
    // in quanto senza non riesce a riempire il campo label del tipo citazione
    // continuo a non capire bene dove hai trovato sUser e sDate, comunque la modidifica sta a riga 212 di salvatutto se ho capito qualcosa
    if (type == "citazione") {
        var outer = $(spanner).text();
        var insert = '<div class="cita" reference="'+reference+'"><p>' +descript + ValIns + " - " + sUser + " - " + sEmail + " - " + sDate + ' .</p>';
        if(group_property=="ltw1521") insert+='<p>Aggiungi nuova citazione <i class="fa fa-plus-square-o fa-lg"></i></p>';
        insert+= " " + '<p class="nascosto">' + outer + '</p>' + " " + '<p class="nascosto">' + ide + '</p>' + " " + '<p class="nascosto">'+ start + '</p>' + " " + '<p class="nascosto">' + end + '</p>' + " " + '<p class="nascosto">' + maxdim + '</p></div>';
        var index = $('#lista_' + type)[0];
        $('#lista_tutti').append(insert);
        $(index).append(insert);
    }
    else {
        var insert = '<div class="annota" reference="'+reference+'"><p>' + descript + ValIns + " - " + sUser + " - " + sEmail + " - " + sDate + " ." + '</p>' + " " + '<p class="nascosto">' + ide + '</p>' + " " + '<p class="nascosto">'+ start + '</p>' + " " + '<p class="nascosto">' + end + '</p>' + " " + '<p class="nascosto">' + maxdim + '</p></div>';
        // Nel caso sia il .add della citazione mostro di nuovo la citazione nella lista delle annotazioni da aggiungere
        // e salvo anche l'identificatore univoco per le chiamate di funzioni
        if (citazione) {
            $('.cita[reference="'+reference+'"]').append(insert);
        }
        else {
            var index = $('#lista_' + type)[0];
                $('#lista_tutti').append(insert);
                $(index).append(insert);
        }
    }
    NotifyMe();
}

//funzione per dare un ordine alle annotazioni delle citazioni perchè Casa ed io preferiamo
function orderNotesByCommonSense(notes){
    /*ordino le citazioni per senso, quindi in questo ordine:
    Titolo,Anno,Autore,Doi,URL
    */
    var to_ret,titoli,anni,autori,doi,url;
    titoli=new Array();anni=new Array();autori=new Array();doi=new Array();url=new Array();
    $.each(notes,function (key,node){
       switch(node['label']['value']){
            case 'Titolo':
                titoli.push(node);
                break;
            case 'Anno di pubblicazione':
                anni.push(node);
                break;
            case 'Autore':
                autori.push(node);
                break;
            case 'DOI':
                doi.push(node);
                break;
            default: //url
                url.push(node);
        }
    });
    //metto in ordine le annotazioni in to_ret
    to_ret=titoli;
    to_ret=to_ret.concat(anni);
    to_ret=to_ret.concat(autori);
    to_ret=to_ret.concat(doi);
    to_ret=to_ret.concat(url);
    //restituisco le annotazioni ordinate
    return to_ret;
}

//funzione che si occupa di controllare l'integrità delle annotazioni in memoria.
function checkIntegritySystem(bkp_span,bkp_note){
    //per ora eseguo un check alquanto stupido
    var tmp_span=document.createElement('div');
    var txt=$('.testo');
    $(tmp_span).html(bkp_span);
    /*var l_old=$(tmp_span).contents().length;
    var x=$('.testo');
    var l=$(x).contents().length;
    if(l!=l_old+1) throw "n_child_error";*/
    if($(tmp_span).text()!=$(txt).text()) throw "n_child_error";
}
