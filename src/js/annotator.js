/* FUNZIONI UTILIZZATE SCRITTE DA DANIELE */

// All'inizio
blindL = true; // all'inizio il logIn è nascosto
blindP = true; // gestisce la modalità di aggiunta di un annotazione regolando la scomparsa e riapparsa delle icone
visible = false; // gestisce il bottone di salvataggio delle annotazioni
cancella = false; // gestisce l'entrata e uscita dalla modalità di cancella delle annotazioni
citazione = false; // gestisce il controllo su le citazioni e le annotazioni
mode = "aggiungi"; // gestice e stiamo aggiungwndo, eliminando o modificando qualcosa
modifica = false; // gestisce l'entrata e uscita dalla modalità di modifica delle annotazioni
annotazione = ""; // variabile globale che crea la nostra nuova annotazione a seconda del tipo
type = ""; // tipo annotazione
start = ""; // inizio selected
end = ""; //fine selected
range = ""; //range selected
maxdim = ""; // lungezza massima da non superare
ide = ""; // id da inviare al JSON
URI = ""; // URI del sito
elemento= ""; //Span appena creato, usato per salvare il nuovo id nel div
OkEsci = true; // Ci permette di uscire dalla modalità annotator nel caso non ci sia nulla da salvare
repeat = true; // permette di capire se un frammento viene premuto
canMod = false; // ci permette di controllare che la citazioni non stampi il suo contenuto alla modifica di una annotazione interna a una citazione
canDel = false; //permette di controllare che non si eliminino più annotazioni con un solo click (nel caso in cui siano una dentro l'altra)
time = ""; // ci permette di eludere la visualizzazione della citazione dentro l'annotazione
Changing = false; // se attivo mi permette di modificare il tipo dell'annotazione
referenceVar = ""; // utilizzata per salvare la reference nel cambio del tipo alla modifica
datoLista = ""; // utilizzata per nascondere o mostrare i parametri della lista delle annotazioni
AnnCita = ""; // permette di salvare il nodo che andremo a eliminare al cambio di tipo se questo sta in una citazione
magicNumb = 7; // definisce il numero di figli della classe citazione
dontDo = false; // permette di ritardare lo scatenarsi del messaggio di allarme nella modifica e eliminazioe frammento di un altro gruppo
old_notes=[];   //tiene in memoria le annotazioni già salvate che sono state modificate in locale per mandarle al server
TWIN="";    //tiene in memoria l'annotazione da cancellare in caso di cambio tipo

// Svuota il pulsante di selezione
function emptySelect() {
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            //OpenClosePlusCita("hide");
        }
        else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    }
    else if (document.selection) {  // IE
        document.selection.empty();
    }
}

function MaxNotify(id_elenco, id_notifica) {
    var len = $(id_elenco).children().length;
    if (len > 99) {
        len = "99+";
    }
    $(id_notifica).empty().append(len);
}

// Modifica la lista delle annotazioni aggiungendo l'annotazione
function NotifyMe() {
    MaxNotify("#lista_autore", '#not_autore');
    MaxNotify("#lista_data", '#not_data');
    MaxNotify("#lista_titolo", '#not_titolo');
    MaxNotify("#lista_doi", '#not_doi');
    MaxNotify("#lista_url", '#not_url');
    MaxNotify("#lista_commento", '#not_commento');
    MaxNotify("#lista_denotazione", '#not_denotazione');
    MaxNotify("#lista_citazione", '#not_citazione');
    MaxNotify("#lista_tutti", '#not_tutti');
}

// aggiunge l'elenco dei tipi di annotazioni che si possono aggiungere/modificare
function DocOrFrag() {
    var lista = '<li id="autore"><button>Autore</button></li><li id="data"><button>Anno di pubblicazione</button></li><li id="titolo"><button>Titolo</button></li><li id="doi"><button>DOI</button></li><li id="url"><button>URL</button></li><li id="commento"><button>Commento</button></li><li id="denotazione"><button>Denotazione Retorica</button></li><li id="citazione"><button>Citazione</button></li>';
    $('.lista').empty();
    $('.lista').append(lista);
}

// Utilizzata per accedere alla modalità annotator
function Access () {

    $("#f-user, #p-login").on('click', function() {
        // se premo su l'icona di logIn
        if ($(this).attr("id") == "f-user") {
            var sEmail = $('#email-form').val();
            var sUser = $('#user-form').val();
            // controlla che la mail e l'utente non siano vuoti
            if (($.trim(sEmail).length == 0) || ($.trim(sUser).length == 0)) {
            Allarme('Inserisci un indirizzo email e un username');
            }
            // convalida dell'email
            else if (!ValidateEmail(sEmail)) {
            Allarme('Indirizzo email invalido');
            }

            // Se la mail è corretta
            else {
                // se è possibile accedere alla modalità annotator
                if(blindL){
                    $("#tile").text("Annotator");
                    $(".editor").show('fast');
                    $('#login').hide();
                    $('#fa-user').removeClass("fa-user");
                    $('#fa-user').addClass("fa-user-times");
                    OpenClosePlusCita("show");
                    blindL = false;
                    // permette di ridurre le fastidiose barre di scorrimento laterali che creavano disagi psicologici al designer
                    $('.testo').css('height', '93%');
                }
            }
        }

        else {
            if(visible){
                Allarme("Salvare prima di uscire!");
            }
            // se si preme il login dopo l'accesso si può tronare alla modalità reader
            else {
                $("#tile").text("Reader");
                $('.editor').hide();
                $('#fa-user').removeClass("fa-user-times");
                $('#fa-user').addClass("fa-user");
                OpenClosePlusCita("hide");
                blindL = true;
                sEmail = "";
                sUser = "";
                $('.testo').css('height', '100%');
            }
        }
    });
}

// Utilizzata per modificare le annotazioni
function Modify () {
    $(document).on('click','#f-fuseki, #f-plus, #f-pencil, #f-cancel, #f-eraser, #f-arrow, #f-send', function() {
        // se si preme elimina tutte le annotazioni in memoria su fuseki e le rigenera
        if ($(this).attr("id") == "f-fuseki") {
            //cancello la vecchia selezione
            start=end=range=maxdim=spanning=ide=selection="";
            $('h2.err').html("Attenzione");
            $('.err').show("drop", {direction:'up'}, 1000);
            $('.errore').append("Stai per elinare tutte le annotazioni!");
            $('.err').append('<div class="footer"><hr><i id="f-ok_fuseki" class="fa fa-check fa-lg" title="Ok"></i><i id="f-stop_fuseki" class="fa fa-remove fa-lg" title="Esci"></i></div>');
            $('#f-fuseki').hide();
            $(document).one('click','#f-ok_fuseki', function() {
                // funzione dado
                forceScraper();
                $('.err').hide("drop", {direction:'down'}, 1000);
                $('.errore').empty();
                $('#f-fuseki').show();
            });
            $(document).one('click','#f-stop_fuseki', function() {
                $('.err').hide("drop", {direction:'down'}, 1000);
                $('.errore').empty();
                $('#f-fuseki').show();
            });
        }
        // se si preme il bottone di aggiunta annotazione
        else if ($(this).attr("id") == "f-plus") {
            //var flag_ok=isValidRange(range); questa flag non serve più. Range non validi li scarto in fase di sottolineatura
            if(range){
                $('#f-eraser').hide();
                $('#f-pencil').hide();
                $('#f-plus').hide();
                $('#f-fuseki').hide();
                DocOrFrag();
                $('.add').show("drop", {direction:'up'}, 1000);
            }else Allarme("Eseguire una selezione corretta del testo prima di aggiungere l'annotazione");
        }
        // se si preme il pulsante di uscita dalla modalità aggiunta
        else if ($(this).attr("id") == "f-cancel") {
            if (Changing) {
                Changing = false;
                $(datoLista).removeAttr('style');
                $('.mod').show();
                $('.add').hide();
            }
            else {
                $('.add').hide("drop", {direction:'down'}, 1000);
                emptySelect();
                $('#f-eraser').show();
                $('#f-pencil').show();
                $('#f-fuseki').show();
                $('#f-plus').show();
                //svuoto la vecchia selezione se presente
                start=end=range=maxdim=spanning=ide=selection="";
                // Nel caso sia il .add della citazione aggiungo la citazione in fondo tolta al momento della creazione della citazione
                if (citazione) {
                    $('.lista').append('<li id="citazione"><button>Citazione</button></li>');
                    citazione = false;
                }
                // mi accorgo di aver sbagliato solo nella finestra di aggiunta vera e propria dell'annotazione
                else if(!blindP){
                    $('.lista').show();
                    $('.annotazione').empty();
                    $('#f-arrow').hide();
                    $('#f-send').hide();
                    blindP = true;
                }
            }
        }
        // permette di tornare indietro alla lista delle annotazioni da aggiungere
        else if ($(this).attr("id") == "f-arrow") {
            $('.lista').show();
            $('.annotazione').empty();
            $('#f-arrow').hide();
            $('#f-send').hide();
            blindP = true;
        }
        // invia l'annotazione allo switcher per il salvataggio dell'annotazione
        else if ($(this).attr("id") == "f-send") {
            if (Changing){
                var ret=switcher(referenceVar);
                if(ret!=false){
                    deleteTwin(AnnCita);
                    //if($(AnnCita).parent().attr('class')!='cita')deleteRange("",$('#'+referenceVar)[0]);
                    $(AnnCita).remove();
                    Changing = false;
                    $(datoLista).removeAttr('style');
                    $('.mod_annotazione').empty();
                    $('.start_end').empty();
                    OkEsci = false;
                    repeat = true;
                    Visibility();
                    //elimino la vecchia annotazione
                    $('.notSavage').find('div.annota').filter(function (key,node){
                        return $(node).html()==$(TWIN).html();
                    }).remove();
                }
            }
            else {
                switcher($('#f-send').attr("reference"));
                emptySelect();
            }
        }
        // attiva la modalità di rimozione delle annotazioni
        else if ($(this).attr("id") == "f-eraser") {
            // se è possibile entrare nella modalità cancella
            if (!cancella && !blindL) {
                mode = "elimina";
                cancella = true;
                $('#f-pencil').hide();
                $('#f-plus').hide();
                OpenClosePlusCita("hide");
                // se si preme la citazione finchè questa non ha figli non si può eliminarla, nel caso si elimina il suo range
                $(document).on('click', '.cita', function() {
                    $('.annota').off();
                    var findElem = $(this).attr('by')?$(this).attr('by'):$('#'+$(this).attr('reference')).attr('by');
                    if(findElem==undefined) findElem="ltw1521";
                    // se l'annotazione è del nostro gruppo
                    if (findElem == 'ltw1521') {
                        if ($(this).children().length == magicNumb && !modifica) {
                            deleteTwin(this);
                            OkEsci = true;
                            Visibility();
                        }
                    }
                    else if (findElem != 'ltw1521' && dontDo == false) {
                        time = setInterval(function(){
                            dontDo = false;
                            clearInterval(time)
                        },3000);
                        dontDo = true;
                        Allarme("Non puoi cancellare o modificare un annotazione di un altro gruppo!");
                    }
                });
                // se è un annotazione la si rimuove che faccia parte di una citazione o no
                $(document).on('click', '.annota', function(e) {
                    e.stopPropagation();
                    $('.cita').off();
                    var findElem = $(this).attr('by')?$(this).attr('by'):$('#'+$(this).attr('reference')).attr('by');
                    if(findElem==undefined) findElem="ltw1521";
                    // se l'annotazione è del nostro gruppo
                    if (findElem == 'ltw1521') {
                        if(!modifica){
                            deleteTwin(this);
                            OkEsci = true;
                            Visibility();
                        }
                    }
                    else if (findElem != 'ltw1521' && dontDo == false) {
                        time = setInterval(function(){
                            dontDo = false;
                            clearInterval(time)
                        },3000);
                        dontDo = true;
                        Allarme("Non puoi cancellare o modificare un annotazione di un altro gruppo!");
                    }
                });
            }
            // esco dalla modalità di cancellazione
            else {
                //elimino le informazioni sulla vecchia selezione se presente
                start=end=range=maxdim=spanning=ide=selection="";
                mode = "aggiungi";
                cancella = false;
                $('#f-pencil').show();
                $('.fa-plus').show();
                emptySelect();
                $(document).off('click', '.annota');
                $(document).off('click', '.cita');
                OpenClosePlusCita("show");
            }
        }
        // ci permette di entrare in modalità modifica
        else {
            if (!modifica && !blindL) {
                mode = "modifica";
                modifica = true;
                $('#f-eraser').hide();
                $('#f-plus').hide();
                OpenClosePlusCita("hide");
                // permette di modificare la citazione
                $(document).on('click', '.cita', function() {
                    var findElem = $(this).attr('by')?$(this).attr('by'):$('#'+$(this).attr('reference')).attr('by');
                    if(findElem==undefined) findElem="ltw1521";
                    // se l'annotazione è del nostro gruppo
                    if (findElem == 'ltw1521') {
                        $('.annota').off();
                        if(!canMod && !cancella){
                            canMod=true;
                            time = setInterval(function(){
                                canMod = false;
                                clearInterval(time)
                            },3000);
                            Modifica(this, $(this).find("p:first").text());
                        }
                    }
                    else if (findElem != 'ltw1521' && dontDo == false) {
                        time = setInterval(function(){
                            dontDo = false;
                            clearInterval(time)
                        },3000);
                        dontDo = true;
                        Allarme("Non puoi cancellare o modificare un annotazione di un altro gruppo!");
                    }
                });
                // permette di modificare l' annotazione
                $(document).on('click', '.annota', function(e) {
                    e.stopPropagation();
                    $('.cita').off();
                    var findElem = $(this).attr('by')?$(this).attr('by'):$('#'+$(this).attr('reference')).attr('by');
                    if(findElem==undefined) findElem="ltw1521";
                    // se l'annotazione è del nostro gruppo
                    if (findElem == 'ltw1521') {
                        if(!canMod && !cancella){
                            canMod=true;
                            time = setInterval(function(){
                                canMod = false;
                                clearInterval(time)
                            },1000);
                            TWIN=this;
                            Modifica(this, $(this).text());
                        }
                    }
                    else if (findElem != 'ltw1521' && dontDo == false) {
                        time = setInterval(function(){
                            dontDo = false;
                            clearInterval(time)
                        },3000);
                        dontDo = true;
                        Allarme("Non puoi cancellare o modificare un annotazione di un altro gruppo!");
                    }
                });
            }
            // esce dalla modalità di modifica
            else {
                mode = "aggiungi";
                //piallo la vecchia selezione
                start=end=range=maxdim=spanning=ide=selection="";
                modifica = false;
                $('#f-eraser').show();
                emptySelect();
                OpenClosePlusCita('show');
                //OpenClosePlusCita("show");
                $('.fa-plus').show();
                $(document).off('click', '.annota');
                $(document).off('click', '.cita');
            }
        }
    });
}

// Aggiunge l'annotazione alla lista delle annotazioni non ancora salvate
function Adding () {
    $(document).on('click', '#autore, #data, #titolo, #doi, #url, #commento, #denotazione, #citazione', function() {
        // aggiunge l'autore alla finestra di scelta dell'autore
        if ($(this).attr("id") == "autore") {
            // creo una select nella quale aggiungo da una lista di autori tutti gli autori del testo
            annotazione = '<select name="Author"><option></option>';
            for(var i = 0; i < lista_autori.length; i++) {
                annotazione += '<option>' + lista_autori[i] + '</option>';
            }
            annotazione += '</select><p>Aggiungi un autore se non presente nella lista</p><input type"text" id="nome_a" placeholder="Nome"><br><input type"text" id="cognome_a" placeholder="Cognome">';
            type = "autore";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            // aggiungo dinamicamente il testo per la selezione alla schermata
            $('.annotazione').append(annotazione);
            blindP = false;
        }
        // aggiungo dinamicamente una select che contine alcune date recenti
        else if ($(this).attr("id") == "data") {
            annotazione = '<select id="date" name="dataPub">';
            var myDate = new Date();
            var year = myDate.getFullYear();
            for(var i = year; i > 1950; i--){
                annotazione += '<option value="' + i + '">' + i + '</option>';
            }
            annotazione += '</select>';
            type = "data";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            // aggiungo dinamicamente il testo per la selezione alla schermata
            $('.annotazione').append(annotazione);
            blindP = false;
        }
        // creo un campo testo dove poter inserire un titolo
        else if ($(this).attr("id") == "titolo") {
            annotazione = '<textarea rows="25" cols="40"></textarea>';
            type = "titolo";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            // aggiungo dinamicamente il testo per la selezione alla schermata
            $('.annotazione').append(annotazione);
            blindP = false;
        }
        // creo un campo testo dove poter inserire un DOI
        else if ($(this).attr("id") == "doi") {
            annotazione = '<textarea rows="4" cols="40" maxlength="80"></textarea>';
            type = "doi";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            // aggiungo dinamicamente il testo per la selezione alla schermata
            $('.annotazione').append(annotazione);
            blindP = false;
        }
        // creo un campo testo dove poter inserire un URL
        else if ($(this).attr("id") == "url") {
            annotazione = '<textarea rows="4" cols="40"></textarea>';
            type = "url";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            // aggiungo dinamicamente il testo per la selezione alla schermata
            $('.annotazione').append(annotazione);
            blindP = false;
        }
        // creo un campo testo dove poter inserire un commento
        else if ($(this).attr("id") == "commento") {
            annotazione = '<textarea rows="25" cols="40"></textarea>';
            type = "commento";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            $('.annotazione').append(annotazione);
            // aggiungo dinamicamente il testo per la selezione alla schermata
            blindP = false;
        }
        // creo una lista di input radio dal quale si può scegliere una denotazione retorica
        else if ($(this).attr("id") == "denotazione") {
            annotazione = '<form id="d_form" style="text-align: left"><input id="abs" type="radio" name="denota" value="Abstract" checked><label for="abs"> Abstract</label><br><input type="radio" id="intro" name="denota" value="Introduction"><label for="intro"> Introduction</label><br><input type="radio" id="mat" name="denota" value="Materials"><label for="mat"> Materials</label><br><input type="radio" id="met" name="denota" value="Methods"><label for="met"> Methods</label><br><input id="res" type="radio" name="denota" value="Results"><label for="res"> Results</label><br><input id="dis" type="radio" name="denota" value="Discussion"><label for="dis"> Discussion</label><br><input id="con" type="radio" name="denota" value="Conclusion"><label for="con"> Conclusion</label></form>';
            type = "denotazione";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            $('.annotazione').append(annotazione);
            blindP = false;
        }
        // creo una citazione partendo da un titolo per quella citazione considerando poi questo come un contenitore di annotazioni
        else {
            annotazione = '<p>Inserisci descrizione citazione:<p>';
            annotazione += '<textarea rows="25" cols="40"></textarea>';
            type = "citazione";
            $('.lista').hide();
            $('#f-arrow').show();
            $('#f-send').show();
            // aggiungo dinamicamente il testo per la selezione alla schermata
            $('.annotazione').append(annotazione);
            blindP = false;
        }
    });
}

// Selezione delle classi di annotazione per la visualizzazione a schermo delle annotazioni in un certo punto del testo
function SeeDinamic() { //BIG UP PER DANI!! by Dado e Casa
    var sel=getSelection().toString();
    if(!sel && repeat){
        if ($(this).attr("class") == "fragment an_author") {
            findFragment(this);
        }

        else if ($(this).attr("class") == "fragment an_year") {
            findFragment(this);
        }

        else if ($(this).attr("class") == "fragment an_title") {
            findFragment(this);
        }

        else if ($(this).attr("class") == "fragment an_doi") {
            findFragment(this);
        }

        else if ($(this).attr("class") == "fragment an_url") {
            findFragment(this);
        }

        else if ($(this).attr("class") == "fragment an_comment") {
            findFragment(this);
        }

        else if ($(this).attr("class") == "fragment an_rethoric") {
            findFragment(this);
        }

        else {
            findFragment(this);
        }
    }
}

function Elenco() {
    $(".elenco ul ul").slideUp();
    $(".elenco ul i").not('.fa-plus-square-o').removeClass('fa fa-chevron-circle-up');
    $(".elenco ul i").not('.fa-plus-square-o').addClass('fa fa-chevron-circle-down');
    if(!$(this).next().is(":visible")) {
        $(this).next().slideDown();
        $(':first-child()', $(this)).removeClass('fa fa-chevron-circle-down');
        $(':first-child()', $(this)).addClass('fa fa-chevron-circle-up');
    }
}

/* MAIN SCRITTO DA DANIELE */
$(document).ready(function(){

    // Diminuisco il livello di visualizzazione per un problema con la classe .add
    setTimeout(function(){ $('.head').css('z-index','2'); },2000);

    // Gestione della memorizzazione delle citazioni
    $(document).on('click', '.fa-plus-square-o', function() {
        // cosi sembra come se fossi in un documento e visualizzo solo quello che devo visualizzare
        range="";
        DocOrFrag();
        $('.add').show("drop", {direction:'up'}, 1000);
        $('#citazione').remove();
        // salvo al suo interno un identificatore univoco utile per eliminare successivamente un annotazione dentro una citazione
        var reference = $(this).parent().parent().attr("reference");
        $('#f-send').attr('reference', reference);
        citazione = true;
    });

    // Rimuove la visualizzazione delle annotazioni
    $(document).on('click', '#f-stop', function() {
        $('.ann').hide("drop", {direction:'down'}, 1000);
        $('.ann_annotazione').empty();
        repeat = true;
    });

    // Permette la visualizzazione dell'annotazione su schermo
    $(document).on('click', '.fragment', SeeDinamic);

    $('.editor').hide(); // l'editor all'inizio è nascosto
    $('.add, .mod, .err, .gruppi, .ann, .filter, .ricerca_avanzata').hide(); // le schermate nascoste sono appunto nascoste all'inizio
    $('#f-arrow').hide(); // l'icona di torna indietro è nascosta
    $('#f-send').hide(); // l'iconda di invio di un annotazione è nascosta all'inizio
    $('#f-save').hide(); // così come l'icona di salva tutto delle annotazioni
    $('#f-plus').hide(); // fino alla fisualizzazione delle annotazioni l'icona piu non si deve vedere
    $('#f-fuseki').hide(); // anche le altre della barra editor
    $('#f-eraser').hide();
    $('#f-pencil').hide();

    // Gestione del menu salvati
    $(".elenco h3").click(Elenco);

    // Permette la visualizzazione dei titoli su schermo
    /*if (!isTouchDevice()) {
        $(document).tooltip({
            tooltipClass: "tooltip",
        });
    }*/

    $(document).on('mouseover','.fragment',function (evt){
        evt.stopPropagation();
        var color=$(this).css("background-color");
        $(this).css("background-color","white");
        $(this).css("outline","thick solid");
        $(this).css("outline-color",color);
    });

    $(document).on('mouseout','.fragment',function(){
        $(this).attr("style","");
    });

    //eseguo le funzioni
    Access();
    Modify();
    Adding();
    NotifyMe();

});
