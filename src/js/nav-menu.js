/* FUNZIONI SCRITTE DA DANIELE */

// definisco le variabili
var blindS = true; // la barra di ricerca non è ancora visualizzata
var blindLog = true; // la barra del logIn non è anocra visualizzata
var blindD = true; // la barra documenti non è ancora visibilie
var blindI = true; // la info non è ancora visualizzata
var info = false; // variabile per accedere a un caso particolare di allarme
blindE = true; // le annotazioni non sono ancora visibili
blindF = true; // i filtri non sono ancora visibili
blindAdvance = true; // serve per decidere se il caricamento è nella ricerca avanzata o sul testo
sparql_point= "http://vitali.web.cs.unibo.it/raschietto/graph/"; //indirizzo comune di tutti i grafi
deprecated_tags="acronym,applet,b,basefont,big,center,dir,font,frame,frameset,isindex,noframes,s,strike,sup,tt,u";
locate="http://ltw1521.web.cs.unibo.it/";  //variabile che tiene in memoria l'attuale url della pagina (debug)
//locate="http://localhost/";            //variabile che tiene in memoria l'attuale url della pagina (debug)
ESC_KEY_NUM=27; //numero che mappa il pulsante ESC della tastiera
ENTER_KEY_NUM=13; //numero che mappa il pulsante ENTER della tastiera

// Permette di nascondere e mostrare il plus nelle citazioni solo per le nostre citazioni
function OpenClosePlusCita(state){
    if(state=="show") $('.fa-plus-square-o').show();
    else $('.fa-plus-square-o').hide();
}

// Funzione che gestisce tutti i pulsanti nella parte alta a destra della main page
function Hiding () {
    $("#p-info, #p-search, #p-login, #p-doc, #f-search, #f-search_plus, #f-ok_ricerca, #f-remove_ricerca, #p-eye, #p-filter, #f-filter, #p-gruppi, #f-ok_gruppi" ).on("keypress click", function () {
        // Accedo a le informazioni
        if ($(this).attr("id") == "p-info") {
            // se la barra non è ancora visibile, visualizzala
            if (blindI) {
                info = true;
                Allarme();
            }
            else {
                $('.err').hide("drop", {direction:'down'}, 1000);
                blindI = true;
                info = false;
                $('.errore').empty();
            }
        }

        //clicco sul bottone cerca
        else if ($(this).attr("id") == "p-search") {
            // se la barra non è ancora visibile, visualizzala
            if (blindS) {
                $('#login').hide('slow');
                $('#cerca').show('slow');
                $('#search-form').focus();
                blindS = false;
            }
            // altrimenti nascondila
            else {
                $('#cerca').hide('slow');
                blindS = true;
            }
        }
        // clicco sul bottone per mostrare i gruppi
        else if ($(this).attr("id") == "p-gruppi") {
            // se i gruppi non sono già visibili e se le annotazioni sono ancora da salvare
            $('.gruppi').show("drop", {direction:'up'}, 1000);
        }
        // esce dalla modalità di ricerca annotazioni di un gruppo
        else if ($(this).attr("id") == "f-ok_gruppi") {
            $('.gruppi').hide("drop", {direction:'down'}, 1000);
        }
        // permette di accedere alla modalità per loggarsi
        else if ($(this).attr("id") == "p-login") {
            // se la barra non è già visibile o si deve prima salvare le annotazioni
            if (blindLog && !visible) {
                $('#cerca').hide('slow');
                $('#login').show('slow');
                $('#user-form').focus();
                blindLog = false;
            }
            else {
                // se sono visibili invia un allarme altrimenti si può uscire dal login
                if(visible){
                    Allarme("Salvare prima di uscire!");
                }
                else {
                    $('#login').hide('slow');
                    blindLog = true;
                }
            }
        }
        // modalità di visualizzazione delle annotazioni
        else if ($(this).attr("id") == "p-eye") {
            // se le annotazioni non sono ancora visibili e non sono da salvare
            if (blindE && !visible) {
                getAnnotations();
                $('.gruppi_check input').unbind('change').on('change',showOrHide);
                        //è stato dechecked l'input
                        /*var frags=$('.fragment[by='+group_property+']');
                        $.each(frags, function (key,node){
                            var divs=$('div[reference='+$(node).attr('id')+']');
                            $.each(divs,function (key,div){
                                var counter=$(div).parent().find('.notifica')[0];
                                $(counter).text($(counter).text()-1);
                                $(div).remove();
                            });
                        });
                        //elimino tutte le annotazioni salvate
                        $('.elenco ul li ul').each(function (key,node){
                            $(node).empty();
                        });
                        $('.notifica').text("0");*/

                $('#p-gruppi').show();
                $('#p-filter').show();
                $('#f-plus').show();
                $('#f-fuseki').show();
                $('#f-eraser').show();
                $('#f-pencil').show();
                $('#fa-eye').removeClass("fa-eye");
                $('#fa-eye').addClass("fa-eye-slash");
                blindE = false;
            }
            else {
                if(visible){
                    Allarme("Salvare prima di uscire!");
                }
                    else {
                    // Qui la  chiamata della funzione di rimozione
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
            }
        }
        // permette di filtrare le annotazioni
        else if ($(this).attr("id") == "p-filter") {
            // se non sono già visibili i filtri, visualizzali
            if (blindF) {
                $('.filter').show("drop", {direction:'up'}, 1000);
                blindF = false;
            }
        }
        // abbiamo scelto il filtro che vogliamo e usciamo dalla modalità filtro
        else if ($(this).attr("id") == "f-filter") {
            $('.filter').hide("drop", {direction:'down'}, 1000);
            blindF = true;
        }
        // clicco sul pulsante di ricerca o premo enter e chiamo la funzione ajax per la richiesta dell'HTML
        else if ($(this).attr("id") == "f-search") {
            if(Visibility()){
                var search = $('#search-form').val();
                hideAnnotations();
                RequestHTML(search);
                $('#cerca').hide('slow');
                blindS = true;
                $('#p-gruppi').hide();
                $('#p-filter').hide();
                $('#f-plus').hide();
                $('#f-fuseki').hide();
                $('#f-eraser').hide();
                $('#f-pencil').hide();
                $('#fa-eye').addClass("fa-eye");
                $('#fa-eye').removeClass("fa-eye-slash");
                blindE = true;
                $('#cerca').hide('slow');
            }
            else{
                Allarme("Salvare prima di uscire!");
            }
        }
        // clicco su la ricerca avanzata
        else if ($(this).attr("id") == "f-search_plus") {
            $('.ricerca_avanzata').show("drop", {direction:'up'}, 1000);
            $('#cerca').hide('slow');
            blindS = true;
            var contenuto = '<p>Inserisci autore :</p><input name="Author" type="text" placeholder="Autore"><br><p>Inserisci data :</p><select id="date" name="dataPub"><option></option>';
            var myDate = new Date();
            var year = myDate.getFullYear();
            for(var i = year; i > 1950; i--){
                contenuto += '<option value="' + i + '">' + i + '</option>';
            }
            contenuto += '</select><br><p>Inserisci titolo :</p><input name="Title" type="text" placeholder="Titolo">';
            contenuto+='<hr>';
            $('.ricercare').append(contenuto);
            //metto il cursore direttamente nel primo campo di ricerca
            $('.ricercare input[name=Author]').focus();
        }
        // se clicco nel pulsante per avviare la ricerca avanzata
        else if ($(this).attr("id") == "f-ok_ricerca") {
            // funzione dado
            //recupero valori
            var autore=$('.ricerca_avanzata input[name=Author]').val();
            var anno=$('.ricerca_avanzata select option:selected').val();
            var titolo=$('.ricerca_avanzata input[name=Title]').val();
            if(autore || anno || titolo){
                blindAdvance = false;
                advancedSearch(autore,anno,titolo);
                /*$('.ricerca_avanzata').hide("drop", {direction:'down'}, 1000);
                $('.ricercare').empty();*/
            }
            else Allarme("Riempire almeno uno dei campi prima di cercare");
        }
        else if ($(this).attr("id") == "f-remove_ricerca") {
            $('.ricerca_avanzata').hide("drop", {direction:'down'}, 1000);
            $('.ricercare').empty();
        }
            //clicco sul bottone documenti
        else {
            // vogliamo visualizzare i documenti e le annotazioni ancora da salvare
            if (blindD) {
                $('#cerca').hide('slow');
                $('#login').hide('slow');
                $('.document').hide();
                $('.doc').show("slow");
                blindD = false;
            }
            // vogliamo tornare nella pagina iniziale
            else {
                $('.document').show("slow");
                $('.doc').hide();
                blindD = true;
            }
        }
    });
}




/* FUNZIONI SCRITTE DA DAVIDE */

elemento=""; //variabile che contiene l'ultimo span generato
id_usato="";  //id attualmente in utilizzo tra quello generale, di dlib o alma
id_alma="div1_div3_div2_"; //id iniziale degli articoli alma journals
backup_testo="";  //variabile di backup utilizzata per nascondere tutte le annotazioni


//metodo ricursivo che esegue il bind di un evento ad un nodo e a tutti i suoi figli
function recursiveBinder(node,evento,whatToDo){
    //se non ho figli, posso mettere l'handler
    if($(node).children().size()==0){
        $(node).attr(evento,whatToDo);
    }
    //altrimenti metto l'handler solo se il nodo contiene effettivamente del testo
    else{
        var arr=Array();
        var i=0;
        $.each($(node).children(),function (key,son){
            arr[i]=$(son).text();
            i++;
        });
        var text_sons=arr.join("/");
        var text=$(node).text();
        //rimuovo gli a capo. spesso si differenziano solo per quelli, ma in realtà la differenza è solo apparente
        text=text.replace(/\r?\n|\r/g,'');
        text_sons=text_sons.replace(/\r?\n|\r/g,'');
        if(text!=text_sons){
            //esiste del testo in questo nodo. metto handler
            $(node).attr(evento,whatToDo);
        }
        //richiamo ricorsivamente il metodo sui figli
        $.each($(node).children(),function (key,son){
            recursiveBinder(son,evento,whatToDo);
        });
    }
}

//funzione che disabilita l'apertura dei link ma rende disponibile il click sulle annotazioni
function linkDisabler(){
    //disabilito i link
    $('.testo').find('a').off('click');
    $('.testo').find('a').on('click',function (evt){
        evt.preventDefault();
    });
}

//Richiede l'html del documento da mostrare
function RequestHTML(ricerca) {
    //se fuseki è vuoto, la prima richiesta può avere parametro stringa vuota. bypasso tale problema
    if(ricerca!=""){
        ricerca=ricerca.split('?')[0];
        //svuoto le annotazioni vecchie in memoria, se ce ne sono
        old_notes=[];
        URI = ricerca;
        $.ajax ({
            url: locate+'Server/getText.php?url=' + ricerca,
            method: 'GET',
            dataType: "json",
            success: function(data){
                //svuoto il div che contiene il testo e creo un nodo temporaneo per sistemare la visualizzazione dell'html ottenuto
                id_usato=data[0];
                $(".testo").empty();
                //svuoto l'array contenente tutte le annotazioni modificate in locale ma non servono più se cambio documento
                old_notes=[];
                var tmp=document.createElement('span');
                $(tmp).append(data[1]);
                //sistemo i link e tutti i tag deprecati(facendoli sparire,ma mantenendone il testo)
                $.each($(tmp).find(deprecated_tags),function (key,node){
                    $(node).contents().unwrap();
                });
                //rimuovo tutti i br semplicemente per riunire tutto il testo dei nodi
                //ed elimino tutti gli script presenti nella pagina perchè potrebbero dare errori di visualizzazione (es. pagina totalmente bianca, tutto sparisce)
                $.each($(tmp).find('script,link'),function (key,node){
                    $(node).remove();
                });
                //riunisco tutti i nodi di testo all'interno dello stesso nodo
                $.each($(tmp).find('p'),function (key,node){
                    node.normalize();
                });
                //elimino tutti gli stili che so già creano casini alla visualizzazione
                $.each($(tmp).find(),function (key,node){
                    if($(node).attr('style')) $(node).attr("style","");
                    if($(node).attr('class')) $(node).attr("class","");
                });
                //sistemo i valori di src delle immagini
                var url_page=URI.split("/");
                if(url_page.length>3) url_page.splice(-1,1);
                url_page=url_page.join('/');
                url_page+="/";
                $.each($(tmp).find('img'),function (key,node){
                    var iri=$(node).attr('src');
                    if(iri && iri.indexOf('http')<0){
                        $(node).attr('src',url_page+iri);
                    }
                });
                //rimozione cookie e footer per unibo
                //rimozione contenuto navbar
                if($(tmp).find('#cookiesAlert')){
                    $(tmp).find('#cookiesAlert').remove();
                }
                if($(tmp).find('.footer')){
                    $(tmp).find('.footer').remove();
                }
                if($(tmp).find('#navbar')){
                    $(tmp).find('#navbar').empty();
                }
                //appendo i dati ottenuti modificato al div .testo e rimuovo lo span tmp che avevo creato
                backup_testo=$(tmp).html();
                $('.testo').append(tmp);
                $(tmp).contents().unwrap();
                //disabilito i link
                linkDisabler();
            },
            error: function(jqXHR, textStatus, textError) {
                alert( "Opss! " + textStatus + " " + textError );
            }

        });
    }
}

//metodo che restituisce true se si è su IE, false altrimenti. utilizzato per il range, che altrimenti non va (ctrl+c ctrl+v)
function isIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
        //sto usando IE
        return true;
    else
        //uso un qualsiasi altro browser
    return false;
}

//metodo che permette di recuperare l'elemento html da modificare tramite Xpath (ctrl+c ctrl+v)
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

//rimuovo tutti gli span e i div delle annotazioni, in modo da ripristinare il documento originale
function hideAnnotations(){
    //uso il backup per ripristinare il testo
    $('.testo').html(backup_testo);
    //azzero i contatori delle annotazioni
    $('.notifica').text("0");
    //cancello le annotazioni all'interno delle drop-down list
    $('.elenco ul ul').empty();
    //svuoto elenco dei gruppi
    $('.gruppi_check').html("");
}

//metodo per recuperare l'elemento identificato dal target del JSON
function getElementByTargetId(id){
    //uso l'xpath per recuperare l'elemento
    if(id=="document" || id==undefined){
        elemento=undefined;
        return elemento;
    }
    //codice compatibilità gruppi stupidi
    id=idCleaner(id);
    elemento=id.split(id_usato)[1];
    var nodi=elemento.split("_");
    xpath="//div[@class='testo']";
    xpath=performXpath(xpath,nodi);
    elemento=getElementByXpath(xpath);
    return elemento;
}

//funzione che standardizza gli xpath strani degli altri gruppi
function idCleaner(id){
    if(id.charAt(0)=='_') id=id.substring(1,id.length);
    id=id.replace(/html_/g,"");
    id=id.replace(/body_/g,"");
    id=id.replace(/_tbody[0-9]*/g,"");
    id=id.replace(/_b[0-9]+/g,"");
    var arr=id.split('_');
    $.each(arr,function (x){
        if(isNaN(arr[x].charAt(arr[x].length-1)))arr[x]+="1";
    });
    id=arr.join("_");
    return id;
}

//metodo che restituisce true se il tipo ottenuto è valido (tipo del JSON o classe css)
function isValidType(an_type){
    if (an_type=="cites" || an_type=="hasDOI" || an_type=="hasAuthor" || an_type=="denotesRhetoric" || an_type=="hasTitle" || an_type=="hasComment" || an_type=="hasURL" || an_type=="hasPublicationYear" || an_type=="an_cite" || an_type=="an_doi" || an_type=="an_author" || an_type=="an_rethoric" || an_type=="an_title" || an_type=="an_comment" || an_type=="an_url" || an_type=="an_year")
        return true;
    else return false;
}

//mostra visivamente l'annotazione che si è appena creata
function showAnnotation(an_type,nodo,start,end,id,isMod,group){
    //controllo che il tipo passato sia valido: controllo necessario solo in lettura dal JSON
    var okToShow=isValidType(an_type);
    if (okToShow){
        //se sono in un cambia tipo, prima elimino il vecchio span
        if(Changing) $('#'+id.slice(0,-1)).contents().unwrap();
        elemento=setFragment(nodo,start,end,isMod);
        if(id==undefined){
            //salvo come id il tempo attuale, in modo da dare una reference univoca a questo id al div che contiene le info di questa annotazione
            var d=new Date();
            id=d.getTime();
        }
        $(elemento).attr('id',id);
        $(elemento).attr('by',group);
        //aggiungo la classe che colora lo span
        switch(an_type){
            case "hasDOI":
                $(elemento).addClass("an_doi");
                break;
            case "hasAuthor":
                $(elemento).addClass("an_author");
                break;
            case "hasTitle":
                $(elemento).addClass("an_title");
                break;
            case "hasURL":
                $(elemento).addClass("an_url");
                break;
            case "hasComment":
                $(elemento).addClass("an_comment");
                break;
            case "hasPublicationYear":
                $(elemento).addClass("an_year");
                break;
            case "cites":
                $(elemento).addClass("an_cite");
                break;
            case "denotesRhetoric":
                $(elemento).addClass("an_rethoric");
                break;
            default:
                $(elemento).addClass(an_type);
        }
        //a questo punto, tutto dovrebbe essere apposto. Ma so che a volte non succede. Quindi con la prossima riga tento il miracolo
        if($(elemento).text().length!=end-start){
            //le cose non vanno bene. Chiamo un metodo magico
            elemento=switchNodes(elemento,start,end);
        }
    }
    return elemento;
}

//funzione che risolve i possibili errori di scambio di tag di chiusura degli span
function switchNodes(nodo,start,end){
    var stop=-1;
    //recupero tutti i nodi interni fino allo span scambiato
    var allNodes=$(nodo).find('span.fragment,span.frag');
    var nodes=$(allNodes).filter(function (key,node){
        var l=$(node).text().length;
        if(l==end-start) stop=key;
       return l>=end-start && stop==-1; 
    });
    //inserisco anche lo span scambiato
    nodes.push(allNodes[stop]);
    //dal nodo più interno, scambio i suoi dati con tutti i fratelli/padri fino al 1°span
    var figlio=$(nodes).last()[0];
    var i=nodes.length-1;
    while(i>=0){
        switchNode(figlio,nodes[i]);
        i--;
    }
    //eseguo anche l'ultimo scambio
    switchNode(figlio,nodo);
    //restituisco lo span corretto
    return figlio;
}

//funzione che scambia tutti gli attributi di 2 span
function switchNode(parent,nodo){
    var p_id=$(parent).attr('id');
    var p_by=$(parent).attr('by');
    var p_class=$(parent).attr('class');
    //ora prendo quelli del figlio
    var f_id=$(nodo).attr('id');
    var f_by=$(nodo).attr('by');
    var f_class=$(nodo).attr('class');
    //li scambio
    $(parent).attr('id',f_id);
    $(parent).attr('by',f_by);
    $(parent).attr('class',f_class);
    $(nodo).attr('id',p_id);
    $(nodo).attr('by',p_by);
    $(nodo).attr('class',p_class);
}

//funzione che si occupa di ottenere tutti e solo i nodi di testo interni a un nodo dato e li salva nel parametro arr
function getRecursiveTextNode(arr,nodo){
    $.each($(nodo).contents(), function (key,node){
        if(node.nodeType==3){
            arr.push(node);
        }else{
            return getRecursiveTextNode(arr,node);
        }
    });
    return arr;
}


//funzione che era sparita e ora la rimetto per controllare se l'annotazione si può fare o viola il DOM
function okToGoIfYouAreModifying(nodo,start,end){
    if($(nodo).hasClass('fragment')){
        nodo=$(nodo).parents().filter(':not(span.fragment)').filter(':not(span.frag)')[0];
    }
    var nodi=getRecursiveTextNode([],nodo);
    //nel dubbio, forzo start ed end ad essere numeri
    start=parseInt(start);
    end=parseInt(end);
    //per ogni nodo di testo, vado a cercare dove si trova lo start e l'end, modificando i loro valori
    var again=true;
    $.each(nodi,function (key,node){
        var length=$(node).text().length;
        if(start<length && again){
            starter=node;
            again=false;
        }if(end<=length){
            ender=node;
            return false;
        }
        if(again)start-=length;
        end-=length;
    });
    range=document.createRange();
    range.setStart(starter,start);
    range.setEnd(ender,end);
    //ora controllo che il range costruito sia corretto esattamente come se fosse stato creato da una selezione
    return isValidRange(range);
} 

//metodo che si occupa di selezionare il frammento del nodo corretto e di generare l'annotazione visiva (lo span)
function setFragment(nodo,start,end,isMod){
    /*//nel dubbio, forzo start ed end ad essere numeri
    start=parseInt(start);
    end=parseInt(end);
    //prendo l'html del nodo, e il testo
    var text=$(nodo).text();
    var html=$(nodo).html();
    //variabili per controllare l'annidamento
    //scorro il testo per cercare dei '<' e '>' che potrebbero dare problemi nel parsing della stringa html
    var arr_char=text.split("");
    var pos_stronze=[];
    for(var i=0;i<arr_char.length;i++){
        var c=arr_char[i];
        //se contiene uno dei caratteri cercati, salvo la posizione
        if(c=='<' || c=='>') pos_stronze.push(i);
    }
    //ora faccio il parsing dell'html
    var extra=0,standard=0;
    var outside=!(arr_char[0]=="<");
    arr_char=html.split("");
    //if(arr_char[0]=="<")outside=false;
    var newStart=-1,newEnd;
    var flag=true;
    for(var i=0;i<arr_char.length;i++){
        var c=arr_char[i];
        //se incontro una &, significa che è un carattere scritto nell'HTTP-encoding. Quindi questo carattere è scritto con altri 4 caratteri oltre all'attuale.
        //incremento lo start e l'end  a cui fermarmi di 4 (tanto se li ho già trovati non vengono modificati newStart e newEnd)
        if(c=="&") {
            start+=4;
            end+=4;
        }

       
        
        //se ho raggiunto lo start
        if(standard==start && flag && outside){
                flag=false;
                newStart=standard+extra;
        }
        if(c=="<" || c=='>'){
            //se questo carattere era dentro al testo, vado tranquillo
            if(pos_stronze.indexOf(extra)!=-1){
                standard++;
            }else{
                //se sono in un tag html, vuol dire che il char è > ed è l'ultimo da mettere in extra
                //se sono fuori, vuol dire che il char è < ed è il primo da mettere in extra
                //incremento extra indipendentemente da dove mi trovo e switcho il flag
                extra++;
                outside=!outside;
            }
        }
        //tutto normale, quindi incremento la variabile giusta
        else if(outside){
            standard++;
            }else{
                extra++;
            }
        //se ho raggiunto l'end, mi fermo(solo dopo aver preso tutti i tag di chiusura che mi riportano all'annidamento giusto)
        if(standard==end){
            newEnd=standard+extra;
            break;
        }
    }
    //nel caso sia l'ultimo carattere e il ciclo non l'ha catturato
    if(!newEnd) newEnd=standard+extra;
    if(newStart==-1)return false;//se entra in questo caso, lo start era maggiore della lunghezza totale del testo
    //genero il nuovo html
    var bef=$(nodo).html().substring(0,newStart);
    var mid='<span id="tmp">'+$(nodo).html().substring(newStart,newEnd)+'</span>';
    var aft=$(nodo).html().substring(newEnd,$(nodo).html().length);
    //inserisco il nuovo html nel nodo
    $(nodo).html(bef+mid+aft);
    //restituisco il nuovo span creato
    var toret=$(nodo).find('#tmp')[0];
    //rimuovo l'id temporaneo con cui ho generato lo span e ci aggiungo la classe fragment(per binding delle annotazioni) prima di restituirlo
    $(toret).attr("id","").addClass("fragment mouse");
    return toret;*/
    
    start=parseInt(start);
    end=parseInt(end);
    //controllo di non essere in una situazione illegale
    if(!modifica)
        if(!okToGoIfYouAreModifying(nodo,start,end))
            throw "non posso farla!!";
    //prendo l'html del nodo, e il testo
    var text=$(nodo).text();
    var html=$(nodo).html();
    //scorro il testo per cercare dei '<' e '>' che potrebbero dare problemi nel parsing della stringa html
    var arr_char=text.split("");
    var pos_stronze=[];
    for(var i=0;i<arr_char.length;i++){
        var c=arr_char[i];
        //se contiene uno dei caratteri cercati, salvo la posizione
        if(c=='<' || c=='>') pos_stronze.push(i);
    }
    //ora faccio il parsing dell'html
    var extra=0,standard=0;
    arr_char=html.split("");
    var outside=true;
    var newStart,newEnd;
    var flag=true;
    for(var i=0;i<arr_char.length;i++){
        var c=arr_char[i];
        //se incontro una &, significa che è un carattere scritto nell'HTTP-encoding. Quindi questo carattere è scritto con altri 4 caratteri oltre all'attuale.
        //incremento lo start e l'end  a cui fermarmi di 4 (tanto se li ho già trovati non vengono modificati newStart e newEnd)
        if(c=="&" && outside) {
            start+=4;
            end+=4;
        }
        if(standard==start && flag){
            flag=false;
            //avanzo fino alla chiusura di tutti i tag già aperti in questo start
            while(arr_char[i]=='<' && arr_char[i+1]=='/'){
                while(arr_char[i]!='>'){
                    i++;
                    extra++;
                }
                extra++;
                i++;
                outside=true;
                c=arr_char[i];
            }
            newStart=standard+extra;
        }
        if(standard==end){
            //ho finito la mia ricerca
            newEnd=standard+extra;
            break;
        }
        //se sono fuori da un tag html
        if(outside){
            if(c=='<'){
                //controllo se è un tag o un < nel testo da sottolineare
                if(pos_stronze.indexOf(standard)==-1){
                    //non è nel testo
                    extra++;
                    outside=!outside;
                }else{
                    //vado tranquillo, è un < nel testo
                    standard++;
                }
            }else{
                //caso normale. incremento standard
                standard++;
            }
        }else{
            //sono dentro a un tag html
            if(c==">"){
                outside=!outside;
            }
            extra++;
        }
    }
    //nel caso sia l'ultimo carattere e il ciclo non l'ha catturato, salvo il newEnd a mano
    if(!newEnd) newEnd=standard+extra;
    if(newStart==undefined) return false;
    //genero il nuovo html
    var bef=$(nodo).html().substring(0,newStart);
    var mid='<span id="tmp">'+$(nodo).html().substring(newStart,newEnd)+'</span>';
    var aft=$(nodo).html().substring(newEnd,$(nodo).html().length);
    //inserisco il nuovo html nel nodo
    $(nodo).html(bef+mid+aft);
    //restituisco il nuovo span creato
    var toret=$(nodo).find('#tmp')[0];
    //rimuovo l'id temporaneo con cui ho generato lo span e ci aggiungo la classe fragment(per binding delle annotazioni) prima di restituirlo
    $(toret).attr("id","").addClass("fragment mouse");
    return toret;
}


//funzione che restituisce tutti i nodi di testo contenuti a qualsiasi livello all'interno di un nodo
function getTextNodesUnder(node){
  var all = [];
  for (node=node.firstChild;node;node=node.nextSibling){
    if (node.nodeType==3) all.push(node);
    else all = all.concat(getTextNodesUnder(node));
  }
  return all;
}

//metodo che restituisce il textNode interno al nodo che contiene il testo che si trova nell'offset dato
function searchTextNodeByOffset(parent,start,end){
    var count=0,toret1,toret2;
    var f_start=true,f_end=true;
    var x;
    var nodes=getTextNodesUnder(nodo);
    $.each(nodes,function (key,node){
        var l=$(node).text().length;
        if(f_start){
            if(l+count>start){
                f_start=false;
                start-=count;
                end-=count;
                toret1=node;
                if(l+count>=end){
                    toret2=node;
                    return false;
                }
            }count+=l;
        }else if(f_end){
            if(l+count>=end){
                end-=count;
               toret2=node;
               return false;
            }count+=l;
        }
    });
    return {
        "start":start,
        "end":end,
        "n_start":toret1,
        "n_end":toret2
    };
}

//funzione che parametrizza un ciclo for per unire stringhe in un array da/fino un elemento fissato, collegandoli tramite collante
function stringify(start,end,array,collante){
    var txt="";
    for(var i=start;i<=end;i++){
        txt+=array[i];
        if(i+1<=end) txt+=collante;
    }
    return txt;
}

//metodo che unisce i singoli pezzi di xpath (nodo e numero) per ottenere l'elemento con l'annotazione
function performXpath(xpath,nodi){
    for(var j=0;j<nodi.length;j++){
        var tmp=makeXpath(nodi[j]);
        //per problemi di visualizzazione, su alma journal non utilizzo la doppia barra. Il DOI non lo mostrerebbe
        if(id_usato==id_alma){
            xpath+="/"+tmp[0]+"["+tmp[1]+"]";
        }else {
            xpath+="//"+tmp[0]+"["+tmp[1]+"]";
        }
    }
    return xpath;
}

//metodo che genera il nome del nodo e la sua posizione per l'xpath di un elemento, dato un frammento del suo id del JSON
function makeXpath(id){
    //divido lettere dai numeri
    var arr=new Array();
    var i=0;
    while(isNaN(id.charAt(i)) && i<id.length)i++;
    //controllo e gestione per i coglioni che non hanno messo il numero in fondo
    if(isNaN(id.charAt(i))){
        id+="1";
    }
    arr[0]=id.substr(0,i);
    if(arr[0]=="h"){
        //se il tag è un 'h', aggiungo anche il 1° numero dopo nel nome
        arr[0]=id.substr(0,i+1);
        i++;
    }
    arr[1]=id.substr(i,id.length-i);
    return arr;
}

//funzione che restituisce la classe CSS corrispondente al tipo di annotazione
function getClassByType(type){
    switch(type){
        case "hasDOI":
            return ("an_doi");
        case "hasAuthor":
            return ("an_author");
        case "hasTitle":
            return ("an_title");
        case "hasURL":
            return ("an_url");
        case "hasComment":
            return ("an_comment");
        case "hasPublicationYear":
            return ("an_year");
        case "cites":
            return ("an_cite");
        case "denotesRhetoric":
            return ("an_rethoric");
        default:
            return type;
    }
}

//funzione che nasconde le annotazioni
function addFilter(attr,type){
    switch(attr){
        case "class":
            $('.fragment.'+type).addClass('fade_t frag').removeClass('fragment');
            break;
        case "by":
            $(".fragment[by='"+type+"']").addClass('fade_b frag').removeClass('fragment');
            break;
    }
}

//funzione che mostra le annotazioni nascoste
function removeFilter(attr,type){
        switch(attr){
        case "class":
            $('.frag.'+type).removeClass('fade_t frag').addClass('fragment');
            break;
        case "by":
            $(".frag[by='"+type+"']").removeClass('fade_b frag').addClass('fragment');
            break;
    }
}

//funzione che si occupa di capire se mostrare o nascondere le annotazioni di un dato gruppo
function showOrHide(){
//se è stato checked, carico le annotazioni
    group_property=$(this).val();
    if(!this.checked){
        //nascondo le annotazioni
        addFilter("by",group_property);
    }else{
        //rimostro le annotazioni
        removeFilter("by",group_property);
    }
}

//funzione che si occupa di restituire true se si utilizza un device con schermo touch
function isTouchDevice(){
    try {
        document.createEvent("TouchEvent");
        return true;
    }catch (e) {
        return false;
    }
}

//funzione che si occupa di aggiornare la selezione del testo fatta usando la tastiera
function checkSelectionByKeyboard(evt){
    if(evt.shiftKey && evt.which>=37 && evt.which <=40){
        okToAnnote(evt);
    }
}

//funzione che controlla se mi trovo nella situazione di chiudere un annotazione
function checkExitCondition(evt){
    //switch su quale pulsante ho premuto
    switch(evt.which){
        case ESC_KEY_NUM:
            if($('.ann').is(':visible')){
                $('#f-stop').trigger('click');
            }
            if($('.add').is(':visible')){
                $('#f-cancel').trigger('click');
            }
            if($('.mod').is(':visible')){
                $('#f-no').trigger('click');
            }
            if($('.ricerca_avanzata').is(':visible')){
                $('#f-remove_ricerca').trigger('click');
            }
            if($('.err').is(':visible')){
                $('.fa-info-circle').trigger('click');
            }
            if($('.gruppi').is(':visible')){
                $('#f-ok_gruppi').trigger('click');
            }
            if($('.filter').is(':visible')){
                $('#f-filter').trigger('click');
            }
            break;
        case ENTER_KEY_NUM:
            if($('#search-form').is(':focus')){
                $('#f-search').trigger('click');
            }
            if($('#email-form').is(':focus')){
                $('#f-user').trigger('click');
            }
            if($('.ricerca_avanzata input').is(':focus')){
                $('#f-ok_ricerca').trigger('click');
            }

    }
}

/* MAIN SCRITTO DA DANIELE E DAVIDE */
$(document).ready(function(){

    //xpath su ie
    if( isIE() )wgxpath.install();

    // All'avvio di una chiamata ajax si mostra la barra con lo spinner di caricamento
    $(document).ajaxStart(function(){
        if (blindAdvance) {
            $('#document').append('<div class="wait"></div>');
            $('.testo').css({ opacity: 0.3});
        }
        else {
            $('.ricercare').css({ opacity: 0.3});
        }
    });

    //Al termine della chiamata ajax nascondo il caricamento
    $(document).ajaxStop(function(){
        if (blindAdvance) {
        $(".wait").remove();
        $('.testo').css({opacity: 1});
        }
        else {
            $('.ricercare').css({opacity: 1});
            blindAdvance = true;
        }
    });

    //Aggiunge e rimuove i filtri per la visualizzazione delle annotazioni
    $('.filtri').find('input:checkbox').on('change', function (nodo) {
        if(!nodo.target.checked)
            //nascondo classe
            addFilter("class",$(this).attr('value'));
        else
            //mostro classe
            removeFilter("class",$(this).attr('value'));
        });

    $('#cerca').hide(); // la barra di ricerca è nascosta all'inizio
    $('#login').hide(); // anche la barra di login
    $('.doc').hide(); // anche i documenti e le annotazioni
    $('#p-filter').hide(); //anche i filtri
    $('#p-gruppi').hide(); //anche i gruppi

    //gestisco eventi per la selezione del testo
    if(isTouchDevice()){
        $('.testo').on('touchend',okToAnnote);
        //per safari merda
        $('.testo').on("touchcancel",okToAnnote);
        $('.testo').on('tap',okToAnnote);
    }
        $(".testo").on("mouseup",okToAnnote);

    //handler scritto da Davide per la gestione della tastiera
    $(document).keyup(function(evt){
        checkSelectionByKeyboard(evt);
        checkExitCondition(evt);
    });

    Hiding();
});
