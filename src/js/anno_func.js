/* FUNZIONI SCRITTE DA DANIELE */

// Funzione di alert ma con design apprezzabile
function Allarme(str) {
    // all'accesso viene mostrata la finestra di benvenuto
    if (info && blindL) {
        blindI = false;
        $('.err h2').html("Modalità reader");
        $('.err').show("drop", {direction:'up'}, 1000);
        var insert = '<p>Benvenuto, il nostro designer ha messo a tua disposizione tutto quello che ti serve per iniziare tra i pulsanti in alto a destra, tra questi troverai :</p><ul><li>Un pulsante di informazione per sapere il significato di ogni icona presente nella nostra applicazione <i class="fa fa-info-circle"></i>;</li><li>Un pulsante di login per permetterti di accedere come annotator al sito e creare, modificare e cancellare le annotazioni <i class="fa fa-user"></i>;</li><li>Un pulsante di ricerca del sito di cui vuoi visualizzare le annotazioni <i class="fa fa-search"></i>;</li><li>Un pulsante di transizione tra la pagina principale e la pagina dove è possibile visualizzare i nostri documenti e le annotazioni nuove o già presenti sul tuo documento di interesse <i class="fa fa-folder"></i>;</li><li>Un pulsante di visualizzazione delle annotazioni presenti sul documento caricato <i class="fa fa-eye"></i>;</li><li>Se questo ultimo è premuto noterai anche un nuovo pulsante, questo è il pulsante filtri con cui potrai filtrare i vari tipi di annotazioni <i class="fa fa-filter"></i>;</li><li>Un pulsante di visualizzazione di altri siti come il nostro da cui richiedere documenti per visualizzare le annotazioni al loro interno <i class="fa fa-users"></i>;</li><li>Premi su una annotazione per visualizzarne il contenuto.</li></ul></p><hr><p>Premi di nuovo il pulsante informazioni per chiudere la guida</p>';
        $('.errore').append(insert);
    }
    // passando in modalità annotator vinene visualizzata una breve spiegazione delle funzionalità della modalità
    else if (info && !blindL) {
        blindI = false;
        $('.err h2').html("Modalità annotator (" + mode + ")");
        $('.err').show("drop", {direction:'up'}, 1000);
        var insert = '<p>Nella modalità annotator potrai: :</p><ul><li>Creare nuove annotazioni, selezionando il frammento di testo nella quale inserire l\'annotazione <i class="fa fa-plus" ></i>;</li><li>Modificare le annotazioni, spostandoti nella pagina contenente la lista di tutte le annotazioni e premendo su quella di tuo interesse <i class="fa fa-pencil" ></i>;</li><li>Eliminare le annotazioni, spostandoti nella pagina contenente la lista di tutte le annotazioni e premendo su quella da rimuovere <i class="fa fa-eraser" ></i>;</li><li>Svuotare il server di Fuseki premento su l\'icona a forma di bomba <i class="fa fa-bomb" ></i>;</li><li>Salvare tutte le annotazioni, premendo il pulsante di "salva tutto".</li></ul></p><hr><p>Premi di nuovo il pulsante informazioni per chiudere la guida</p>';
        $('.errore').append(insert);
    }
    // nel caso sorgessero probemi
    else if (!str) {
        return false;
    }
    // altrimenti visualizza un errore
    else {
        $('h2.err').html("Attenzione");
        $('.err').show("drop", {direction:'up'}, 1000);
        $('.errore').append(str);
        setTimeout(function() {
            $('.err').hide("drop", {direction:'down'}, 1000);
            $('.errore').empty();
        }, 2000);
    }
}

// Convalida dell'email utente (Puro copia e incolla trasgressivo)
function ValidateEmail(sEmail) {
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (filter.test(sEmail)) {
        return true;
    }
    else {
        return false;
    }
}

// Convalida dell'URI (Puro copia e incolla trasgressivo)
function ValidateURL(val) {
    var urlregex = new RegExp(
        "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
  return urlregex.test(val);
}

// Il save sarà visibile solo se vi è qualcosa di annotato e non salvato
function Visibility() {
    if (!blindL) {
        if (OkEsci) {
            visible = false;
            if ($(".notSavage").children().length === 1) {
                $('#f-save').hide();
            }
        }
        else {
            $('#f-save').show();
            visible = true;
        }
    }
    // Controllo gli elementi nelle liste
    NotifyMe();
    return !visible;
}

// Funzione ricorsiva che permette di memorizzare e poi rappresentare su schermo una annotazione
function switcherAdd(figlio) {
    var array = $(figlio).children();
    var testo = $(array[0]).text();
    testo = testo.split(": ");
    var tipo = testo[0].split(" ");
    testo = testo.slice(1).join(': ');
    testo = testo.split(" - ");
    var data = testo.pop();
    var mail = testo.pop();
    var utente = testo.pop();
    var valore = testo.join(" - ");
    var gruppo = arr_group[$('#'+$(figlio).attr('reference')).attr('by')];
    switch(tipo[1]) {
        case "autore":
            insert += '<p>Nome autore: ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            break;

        case "data":
            insert += '<p>Anno di pubblicazione : ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            break;

        case "titolo":
            insert += '<p>Titolo : ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            break;

        case "doi":
            insert += '<p>DOI : ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            break;

        case "url":
            insert += '<p>URL : ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            break;

        case "commento":
            insert += '<p>Commento : ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            break;

        case "denotazione":
            insert += '<p>Denotazione retorica : ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            break;

        case "citazione":
            insert += '<p>Citazione : ' + valore + '</p><p>Utente: ' + utente + '</p><p>Email: ' + mail + '</p><p>Gruppo: ' + gruppo + '</p><p>Data: ' + data + '</p>';
            var len = $(figlio).children().length;
            // scandisco dal settimo figlio in poi, punto in cui sono sicuro vi sia l'inizio di una annotazione
            for(var i = magicNumb; i < len; i++) {
                var annota = array[i];
                var tipo = $(annota).text();
                tipo = tipo.split(":");
                tipo = tipo[0].split(" ");
                // essendo la variabile insert globale alla funzione qualsiasi nuova
                // chiamata alla funzione aggiunge a insert il proprio valore
                insert += '<hr>';
                switcherAdd(annota);
            }
            break;
    }
    if (($(figlio).parent().attr("id") == "lista_tutti") || ($(figlio).parent().attr("class") == "notSavage")) {
        if (checkOverlapping(figlio)!=false) {
            // nel caso il padre sia uno span cerco la prima annotazione non filtrata
                var pointer = checkOverlapping(figlio);
                var parent = $('#'+$(pointer).attr('reference'))[0];
                while (!$(parent).hasClass('fragment') && $(parent).prop('tagName').toLowerCase() == 'span') {
                    parent = $(parent).parent()[0];
                }

                if ($(parent).prop('tagName').toLowerCase() == 'span') {
                    insert += '<hr>';
                    pointer=$('#lista_tutti,.notSavage').children().filter('div[reference="'+$(parent).attr('id')+'"]')[0];
                    switcherAdd(pointer);
                }
                else {
                    $('.ann_annotazione').append(insert);
                    $('.ann').show("drop", {direction:'up'}, 1000);
                }
            }
        else {
            $('.ann_annotazione').append(insert);
            $('.ann').show("drop", {direction:'up'}, 1000);
        }
    }
}

// Sceglie in base all'annotazione cosa caricare
function switcher(reference) {
    switch(type) {
        case "autore":
            // se la select è vuota allora utilizza il nome e il cognome fornito
            if( !$('select[name="Author"]').val()) {
                var valoreN = $("#nome_a").val();
                var valoreG = $("#cognome_a").val();
                if (valoreN && valoreG) {
                    var valore = valoreN + " " + valoreG;
                    lista_autori.push(valore);
                }
                else {
                    var valore = false;
                }
            }
            else {
                var valore = $("option:selected").val();
            }
            // se il valore non è vuoto
            if (valore){
                var desc = "Aggiunto autore: ";
                if (!citazione) {
                    // colora solo se non sei una annotazione dentro una citazione
                    var span = colorRange(range, "an_author");
                }
                Memo(valore, desc, span, reference);
            }
            else {
                Allarme("Inserire un autore!");
                return false;
            }
            break;

        case "data":
            // prendo il valore della option selezionata e lo coloro se non è una citazione
            var valore = $("option:selected").val();;
                var desc = "Aggiunta data: ";
                if (!citazione) {
                    var span = colorRange(range, "an_year");
                }
                Memo(valore, desc, span, reference);
            break;

        case "titolo":
            var valore = $("textarea").val();
            // se il valore non è vuoto allora lo si manda alla funzione di memorizzazione
            if (valore) {
                var desc = "Aggiunto titolo: ";
                if (!citazione) {
                    var span = colorRange(range, "an_title");
                }
                Memo(valore, desc, span, reference);
            }
            else {
                Allarme("Inserire un titolo!");
                return false;
            }
            break;

        case "doi":
            var valore = $("textarea").val();
            // se il valore non è vuoto allora lo si manda alla funzione di memorizzazione
            if (valore) {
                var desc = "Aggiunto doi: ";
                if (!citazione) {
                    var span = colorRange(range, "an_doi");
                }
                Memo(valore, desc, span, reference);
            }
            else {
                Allarme("Inserire un doi!");
                return false;
            }
            break;

        case "url":
            var valore = $("textarea").val();
            // se il valore non è vuoto allora lo si manda alla funzione di memorizzazione
            var desc = "Aggiunto url: ";
            if (valore && ValidateURL(valore)) {
                if (!citazione) {
                    var span = colorRange(range, "an_url");
                }
                Memo(valore, desc, span, reference);
            }
            else {
                Allarme("URL non valido");
                return false;
            }
            break;

        case "commento":
            var valore = $("textarea").val();
            // se il valore non è vuoto allora lo si manda alla funzione di memorizzazione
            if (valore) {
                var desc = "Aggiunto commento: ";
                if (!citazione) {
                    var span = colorRange(range, "an_comment");
                }
                Memo(valore, desc, span, reference);
            }
            else {
                Allarme("Inserire un commento!");
                return false;
            }
            break;

        case "denotazione":
            // il valore cliccato viene inviato alla funzione di memorizzazione
            var valore = $("input:checked").val();
            var desc = "Aggiunta denotazione: ";
            if (!citazione) {
                var span = colorRange(range, "an_rethoric");
            }
            Memo(valore, desc, span, reference);
            break;

        case "citazione":
            var valore = $("textarea").val();
            // se il valore non è vuoto allora lo si manda alla funzione di memorizzazione
            var desc = "Aggiunta citazione: ";
            if (valore) {
                var span = colorRange(range, "an_cite");
                Memo(valore, desc, span, reference);
            }
            else {
                Allarme("URL non valido");
                return false;
            }
            break;
    }
}

// Sceglie cosa mostrare al momento della modifica
// Gli switch sono praticamente identici rigenerano l'aggiunta di una annotazione che però questa volta deve essere sovrascritta
// Per fare ciò se non si è una annotazione dentro una citazione appendo anche lo start e l'end del range in modo da modificarli
// fatto ciò controllo che non vi siano incoerenze e invio tutto alla funzione mod che finisce il lavoro di riappendere i vari
// campi della striinga al loro posto
function switcherMod(questo, babbo, tipo, valore, loco, started, ended, maxim) {
    start = started;
    end = ended;
    // controllo non sia un documento sennò non visualiazzo start e end
    var reference = $(questo).attr('reference');
    reference = reference.slice(0,1);
    $('#f-change_type').unbind('click');
    switch(tipo) {
        case "autore:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<select name="Author"><option></option>';
            for(var i = 0; i < lista_autori.length; i++) {
                temp += '<option>' + lista_autori[i] + '</option>';
            }
            temp += '</select><p>Aggiungi un autore se non presente nella lista</p><input type"text" id="nome_a" placeholder="Nome"><br><input type"text" id="cognome_a" placeholder="Cognome">';
            if(babbo != "cita" && reference != 'd') {
                var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
                var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end" max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
                $('.start_end').append(tempstart);
                $('.start_end').append(tempend);
            }
            type = "autore";
            $('.mod_annotazione').append(temp);
            $('#f-ok').unbind('click').on('click', function () {
                if( !$('select[name="Author"]').val()) {
                    var addN = $("#nome_a").val();
                    var addG = $("#cognome_a").val();
                    if (addN && addG) {
                        var add = addN + " " + addG;
                        lista_autori.push(add);
                    }
                    else {
                        var add = false;
                    }
                }
                else {
                    var add = $("option:selected").val();
                }
                if(babbo != "cita") {
                    tempstart = $("input[name='start']").val();
                    tempend = $("input[name='end']").val();
                }
                var desc = "Modificato autore: ";
                if (babbo!='cita'){
                    if((add && parseInt(tempstart)>=0 && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& checkCorrectSelection(questo,tempstart,tempend)*/) && okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                        var ok=changeRange(loco, questo, tempstart, tempend, "hasAuthor");
                        if(ok!=false)Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                    }
                    else {
                        Allarme("Confermare la stessa cosa o niente non è ammesso!");
                    }
                }else{
                    if(add && add!=valore){
                        Mod(questo,babbo,add,desc,loco,started,ended,maxim);
                    }else{
                        Allarme("Confermare la stessa cosa o niente non è ammesso!");
                    }
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;

        case "data:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<select id="date" name="dataPub" value=' + valore + '>';
            var myDate = new Date();
            var year = myDate.getFullYear();
            for(var i = year; i > 1950; i--){
                temp += '<option value="' + i + '">' + i + '</option>';
            }
            temp += '</select>';
            if(babbo != "cita" && reference != 'd') {
                var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
                var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end" max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
                $('.start_end').append(tempstart);
                $('.start_end').append(tempend);
            }
            type = "data";
            $('.mod_annotazione').append(temp);
            $('#f-ok').unbind('click').on('click', function () {
                var add = $("option:selected").val();
                if(babbo != "cita") {
                    tempstart = $("input[name='start']").val();
                    tempend = $("input[name='end']").val();
                }
                var desc = "Modificata data: ";
                if(babbo!='cita'){
                    if(parseInt(tempstart)>=0 && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& checkCorrectSelection(questo,tempstart,tempend)*/ &&  okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                        if(babbo != "cita") {
                            var ok=changeRange(loco, questo, tempstart, tempend, "hasPublicationYear");
                        }
                       if(ok!=false) Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                        linkDisabler();
                    }
                    else {
                        Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
                    }
                }else{
                    Mod(questo,babbo,add,desc,loco,started,ended,maxim);
                    linkDisabler();
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;

        case "titolo:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<textarea rows="25" cols="40">' + valore + '</textarea>';
            if(babbo != "cita" && reference != 'd') {
                var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
                var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end" max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
                $('.start_end').append(tempstart);
                $('.start_end').append(tempend);
            }
            type = "titolo";
            $('.mod_annotazione').append(temp);
            $('#f-ok').unbind('click').on('click', function () {
                var add = $("textarea").val();
                var desc = "Modificato titolo: ";
                if(babbo != "cita") {
                    tempstart = $("input[name='start']").val();
                    tempend = $("input[name='end']").val();
                }
                if(babbo!='cita'){
                    if((parseInt(tempstart)>=0 && add && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& checkCorrectSelection(questo,tempstart,tempend)*/) &&  okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                        if(babbo != "cita") {
                            var ok=changeRange(loco, questo, tempstart, tempend, "hasTitle");
                        }
                        if(ok!=false)Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                        linkDisabler();
                    }
                    else {
                        Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
                    }
                }else{
                    if(add && add!="valore"){
                        Mod(questo,babbo,add,desc,loco,started,ended,maxim);
                        linkDisabler();
                    }
                    else{
                        Allarme("Confermare la stessa cosa o niente non è ammesso!");
                    }
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;

        case "doi:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<textarea rows="25" cols="40" maxlength="80">' + valore + '</textarea>';
            if(babbo != "cita" && reference != 'd') {
                var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
                var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end" max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
                $('.start_end').append(tempstart);
                $('.start_end').append(tempend);
            }
            type = "doi";
            $('.mod_annotazione').append(temp);
            $('#f-ok').unbind('click').on('click', function () {
                var add = $("textarea").val();
                var desc = "Modificato doi: ";
                if(babbo != "cita") {
                    tempstart = $("input[name='start']").val();
                    tempend = $("input[name='end']").val();
                }
                if (babbo!='cita'){
                    if((add && parseInt(tempstart)>=0 && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& checkCorrectSelection(questo,tempstart,tempend)*/) &&  okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                        if(babbo != "cita") {
                            var ok=changeRange(loco, questo, tempstart, tempend, "hasDOI");
                        }
                        if(ok!=false)Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                        linkDisabler();
                    }
                    else {
                        Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
                    }
                }else{
                    if(add && add!=valore){
                        Mod(questo,babbo,add,desc,loco,started,ended,maxim);
                        linkDisabler();
                    }else{
                        Allarme("Confermare la stessa cosa o niente non è ammesso!");
                    }
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;

        case "url:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<textarea rows="25" cols="40">' + valore + '</textarea>';
            if(babbo != "cita" && reference != 'd') {
                var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
                var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end" max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
                $('.start_end').append(tempstart);
                $('.start_end').append(tempend);
            }
            type = "url";
            $('.mod_annotazione').append(temp);
            $('#f-ok').unbind('click').on('click', function () {
                var add = $("textarea").val();
                var desc = "Modificato url: ";
                if(babbo!='cita'){
                    if(babbo != "cita") {
                        tempstart = $("input[name='start']").val();
                        tempend = $("input[name='end']").val();
                    }
                    if((add && ValidateURL(add) && parseInt(tempstart)>=0 && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& checkCorrectSelection(questo,tempstart,tempend)*/) &&  okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                        if(babbo != "cita") {
                            var ok=changeRange(loco, questo, tempstart, tempend, "hasURL");
                        }
                        if(ok!=false)Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                        linkDisabler();
                    }
                    else {
                        Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
                    }
                }else{
                    if(add && ValidateURL(add) && add!=valore){
                        Mod(questo,babbo,add,desc,loco,started,ended,maxim);
                        linkDisabler();
                    }else{
                        Allarme("Confermare la stessa cosa o niente non è ammesso!");
                    }
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;

        case "commento:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<textarea rows="25" cols="40">' + valore + '</textarea>';
            if(babbo != "cita") {
                var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
                var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end" max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
                $('.start_end').append(tempstart);
                $('.start_end').append(tempend);
            }
            type = "commento";
            $('.mod_annotazione').append(temp);
            $('#f-ok').unbind('click').on('click', function () {
                var add = $("textarea").val();
                var desc = "Modificato commento: ";
                if(babbo != "cita") {
                    tempstart = $("input[name='start']").val();
                    tempend = $("input[name='end']").val();
                }
                if(babbo!='cita'){
                    if((add && parseInt(tempstart)>=0 && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& checkCorrectSelection(questo,tempstart,tempend)*/) && okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                        if(babbo != "cita") {
                            var ok=changeRange(loco, questo, tempstart, tempend, "hasComment");
                        }
                       if(ok!=false) Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                        linkDisabler();
                    }
                    else {
                        Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
                    }
                }else{
                    if(add && add!=valore){
                        Mod(questo,babbo,add,desc,loco,started,ended,maxim);
                        linkDisabler();
                    }else{
                        Allarme("Confermare la stessa cosa o niente non è ammesso!");
                    }
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;

        case "denotazione:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<form id="d_form" style="text-align: left"><input id="abs" type="radio" name="denota" value="Abstract" checked><label for="abs"> Abstract</label><br><input type="radio" id="intro" name="denota" value="Introduction"><label for="intro"> Introduction</label><br><input type="radio" id="mat" name="denota" value="Materials"><label for="mat"> Materials</label><br><input type="radio" id="met" name="denota" value="Methods"><label for="met"> Methods</label><br><input id="res" type="radio" name="denota" value="Results"><label for="res"> Results</label><br><input id="dis" type="radio" name="denota" value="Discussion"><label for="dis"> Discussion</label><br><input id="con" type="radio" name="denota" value="Conclusion"><label for="con"> Conclusion</label></form>';
            if(babbo != "cita") {
                var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
                var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end" max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
                $('.start_end').append(tempstart);
                $('.start_end').append(tempend);
            }
            type = "denotazione";
            $('.mod_annotazione').append(temp);
            $('#f-ok').unbind('click').on('click', function () {
                var add = $("input:checked").val();
                var desc = "Modificata denotazione: ";
                if(babbo!='cita'){
                    if(babbo != "cita") {
                        tempstart = $("input[name='start']").val();
                        tempend = $("input[name='end']").val();
                    }
                    if(parseInt(tempstart)>=0 && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& checkCorrectSelection(questo,tempstart,tempend)*/ &&  okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                        if(babbo != "cita") {
                            var ok=changeRange(loco, questo, tempstart, tempend, "denotesRhetoric");
                        }
                        if(ok!=false)Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                        linkDisabler();
                    }
                    else {
                        Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
                    }
                }else{
                    Mod(questo,babbo,add,desc,loco,started,ended,maxim);
                    linkDisabler();
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;

            case "citazione:":
            $('.mod').show("drop", {direction:'up'}, 1000);
            var temp = '<p>Inserisci il titolo dell\'articolo citato:<p>';
            temp += '<textarea rows="25" cols="40">' + valore + '</textarea>';
            var tempstart = '<label for="f-start">Start: </label><input id="f-start" type="number" name="start" min="' + minStart(started, $(questo).attr('reference')) + '"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + started + '">';
            var tempend = '<label for="f-end">End: </label><input id="f-end" type="number" name="end"  max="' + maxEnd(ended, $(questo).attr('reference')) + '"  value="' + ended + '">';
            type = "citazione";
            $('.mod_annotazione').append(temp);
            $('.start_end').append(tempstart);
            $('.start_end').append(tempend);
            $('#f-ok').unbind('click').on('click', function () {
                var add = $("textarea").val();
                var desc = "Modificata citazione: ";
                tempstart = $("input[name='start']").val();
                tempend = $("input[name='end']").val();
                if(add &&  parseInt(tempstart)>=0 && parseInt(tempstart) < parseInt(tempend) && parseInt(tempend)<=maxEnd(ended, $(questo).attr('reference')) /*&& (checkCorrectSelection(questo,tempstart,tempend))*/ &&  okToGoIfYouAreModifying($('#'+$(questo).attr('reference'))[0],tempstart,tempend) && ( add != valore || parseInt(started) != parseInt(tempstart) || parseInt(ended) != parseInt(tempend))) {
                    var ok=changeRange(loco, questo, tempstart, tempend, "cites");
                    if(ok!=false)Mod(questo, babbo, add ,desc, loco, tempstart, tempend, maxim);
                    linkDisabler();
                }
                else {
                    Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
                }
            });
            $('#f-change_type').on('click', function () {
                ChangeType(questo, "#" + tipo, babbo);
            });
            $('#f-no').on('click', function () {
                $('.mod').hide("drop", {direction:'down'}, 1000);
                $('.mod_annotazione').empty();
                $('.start_end').empty();
                repeat = true;
                $(this).off();
            });
            break;
    }
}

// Funzione ausiliaria per la memorizzazione delle annotazioni modificate
// simile alla memo reinserisce nei campi i valori moodificati nello switcherMod
function Mod(questo, babbo, ValIns, descript, loco, started, ended, maxim) {
    var tipo = "lista_" + type;
    var sEmail = $('#email-form').val();
    var sUser = $('#user-form').val();
    var d = new Date();
    d.setHours(d.getHours()+2);
    var sDate = d.toISOString();
    sDate = sDate.substring(0,sDate.length - 8);
    // se si è una citazione bisogna settare oltre gli elementi della memo anche lo start e l'end a tutti i figli mediante il loop
    if (babbo == "io") {
        var outer = $(elemento).text();
        $(questo).children().first().html(descript + ValIns + " - " + sUser + " - " + sEmail + " - " + sDate + " .");
        $(':nth-child(3)', $(questo)).text(outer);
        $(':nth-child(4)', $(questo)).text(loco);
        $(':nth-child(5)', $(questo)).text(started);
        $(':nth-child(6)', $(questo)).text(ended);
        $(':nth-child(7)', $(questo)).text(maxim);
        for (var i = magicNumb; i < questo.length; i++) {
            // mi permete di entrare nello start e end di ogni figlio della citazione
            $(questo).eq(i).eq(2).text(started);
            $(questo).eq(i).eq(3).text(ended);
        }
        // li sposto tra i non salvati
        if ($(questo).parent().attr('id') == "lista_tutti" || $(questo).parent().attr('id') == tipo) {
            $('.notSavage').append(questo);
        }
    }
    else {
        var insert = '<p>' + descript + ValIns + " - " + sUser + " - " + sEmail + " - " + sDate + " ." + '</p>' + " " + '<p class="nascosto">' + loco + '</p>' + " " + '<p class="nascosto">'+ started + '</p>' + " " + '<p class="nascosto">' + ended + '</p>' + " " + '<p class="nascosto">' + maxim + '</p>';
        // svuoto il nodo e reinserisco in questo la nuova annotazione
        $(questo).empty();
        $(questo).append(insert);
        // li sposto tra i non salvati
        if ($(questo).parent().attr('class') == "cita") {
            tipo = "lista_citazione";
            if ($(questo).parent().parent().attr('id') == "lista_tutti" || $(questo).parent().parent().attr('id') == tipo) {
                $('.notSavage').append($(questo).parent());
            }
        }
        else {
            if ($(questo).parent().attr('id') == "lista_tutti" || $(questo).parent().attr('id') == tipo) {
                $('.notSavage').append(questo);
            }
        }
    }
    deleteTwin(questo);
    $('.mod').hide("drop", {direction:'down'}, 1000);
    $('.mod_annotazione').empty();
    $('.start_end').empty();
    $('#f-ok').off();
    $('#f-change_type').off();
    OkEsci = false;
    repeat = true;
    Visibility();
}

// Funzione ausiliaria per la memorizzazione delle annotazioni in locale
// memorizza l'annotazione aggiungendo una serie di parametri che saranno poi utilizzati successivamente nelle modifiche
// e trasformazioni in json delle annotazioni
function Memo(ValIns, descript, spanner, reference) {
    if(Changing && !spanner){
        var span = referenceVar;
    }
    else if(!spanner && !citazione) {
        var data = new Date();
        var span = "doc" + data.getTime();
        start = 0;
        end = 0;
    }
    else {
        var span = $(spanner).attr('id');
    }
    var sEmail = $('#email-form').val();
    var sUser = $('#user-form').val();
    // setto la data secondo il fusorario corrente e diminuisco questa di 8 caratteri per standardizzarla al json
    var d = new Date();
    d.setHours(d.getHours()+2);
    var sDate = d.toISOString();
    sDate = sDate.substring(0,sDate.length - 8);
    // la differenza tra una citazione e le altre annotazioni è che questa ha bisogno del suo outerHTML
    // in quanto senza non riesce a riempire il campo label del tipo citazione
    if (type == "citazione") {
        var outer = $(spanner).text();
        var insert = '<div class="cita" reference="'+span+'"><p>' + descript + ValIns + " - " + sUser + " - " + sEmail + " - " + sDate + ' .</p>';
        if(group_property=="ltw1521")insert+='<p>Aggiungi nuova citazione <i class="fa fa-plus-square-o fa-lg"></i></p>';
        insert+=" " + '<p class="nascosto">' + outer + '</p>' + " " + '<p class="nascosto">' + ide + '</p>' + " " + '<p class="nascosto">'+ start + '</p>' + " " + '<p class="nascosto">' + end + '</p>' + " " + '<p class="nascosto">' + maxdim + '</p></div>';
        $('.notSavage').append(insert);
    }
    else {
        var insert = '<div class="annota" reference="'+span+'"><p>' + descript + ValIns + " - " + sUser + " - " + sEmail + " - " + sDate + " ." + '</p>' + " " + '<p class="nascosto">' + ide + '</p>' + " " + '<p class="nascosto">'+ start + '</p>' + " " + '<p class="nascosto">' + end + '</p>' + " " + '<p class="nascosto">' + maxdim + '</p></div>';
        // Nel caso sia il .add della citazione mostro di nuovo la citazione nella lista delle annotazioni da aggiungere
        // e salvo anche l'identificatore univoco per le chiamate di funzioni
        if (citazione) {
            var old_cita=$('.cita[reference="'+ reference +'"]')[0];
            $('.cita[reference="'+ reference +'"]').append(insert);
            $('.lista').append('<li id="citazione"><button>Citazione</button></li>');
            // trovo la citazione appartenente all'annotazione mediante la reference
            var nodo = $('.cita').filter(function (key,node) {
                return $(node).attr("reference") == reference;
            })[0];
            if($(nodo).parent().attr('id') == "lista_tutti" || $(nodo).parent().attr('id') == "lista_citazione"){
                var clone = $(nodo).clone();
                $('.cita[reference="'+ reference +'"]').remove();
                $('.notSavage').append(clone);
                //salvo l'annotazione per poi cancellarla da Fuseki
                old_notes.push(old_cita);              
            }
            else {
                $('.notSavage').append(nodo);
            }
        }
        else {
            $('.notSavage').append(insert);
        }
        citazione = false;
    }
    $('.add').hide("drop", {direction:'down'}, 1000);
    $('.lista').show();
    $('.annotazione').empty();
    $('#f-arrow').hide();
    $('#f-send').hide();
    // se non e' una modifica di tipo
    if(!Changing) {
        OkEsci = false;
        Visibility();
        $('#f-eraser').show();
        $('#f-pencil').show();
        $('#f-fuseki').show();
        $('.fa-plus').show();
        blindP = true;
    }
    else {
        $('#f-ok').off();
        $('#f-change_type').off();
        OpenClosePlusCita("hide");
    }
    //svuoto gli attributi globali
    start=end=range=maxdim=spanning=ide=selection="";
}

//Funzione che divide il contenuto dell'annotazione e prende solo il testo da modificare e il tipo di annotazione
function Modifica (questo, valore) {
    var tipo = valore.split(": ");
    tipo = tipo[0].split(" ");
    tipo = tipo[1] + ':';
    var stringa = valore.split(": ");
    stringa = stringa.slice(1).join(': ');
    stringa = stringa.split(" - ");
    var laster = stringa.pop();
    stringa.pop();
    stringa.pop();
    stringa = stringa.join(" - ");
    // se lui stesso è una citazione
    if (tipo == "citazione:") {
        var padre = "io";
        var loco = $(':nth-child(4)', $(questo)).html();
        var start = $(':nth-child(5)', $(questo)).html();
        var end = $(':nth-child(6)', $(questo)).html();
        var maxdim = $(':nth-child(7)', $(questo)).html();
        switcherMod(questo, padre, tipo, stringa, loco ,start, end, maxdim);
    }
    else {
        laster = laster.split(" ");
        var loco = $(':nth-child(2)', $(questo)).html();
        var start = $(':nth-child(3)', $(questo)).html();
        var end = $(':nth-child(4)', $(questo)).html();
        var maxdim = $(':nth-child(5)', $(questo)).html();
        // se il padre è una citazione
        if($(questo).parent().attr('class') == "cita") {
            var padre = "cita";
        }
        else {
            var padre = "";
        }
        switcherMod(questo, padre, tipo, stringa, loco ,start, end, maxdim);
    }
}

// durante la modifica ci permette di cambiare il tipo dell'annotazione
function ChangeType(nodo, lista, padre) {
    $('.add').show("drop", {direction:'up'}, 1000);
    $('.mod').hide();
    //setto start ed end per l'eventuale nuova colorazione dello span
    // se siamo in una annotazione dentro una citazione
    if (padre == "cita") {
        referenceVar = $(nodo).parent().attr("reference");
        $('#f-send').attr('reference', referenceVar);
        citazione = true;
        $('#citazione').remove();
    }
    else if (padre == "io") {
        start = $(':nth-child(5)', $(nodo))[0];
        start=$(start).text();
        end = $(':nth-child(6)', $(nodo))[0];
        end=$(end).text();
        referenceVar = $(nodo).attr("reference");
        ide = $(':nth-child(4)', $(nodo))[0];
        ide=$(ide).text();
        maxdim = $(':nth-child(7)', $(nodo))[0];
        maxdim=$(maxdim).text();
    }
    // se siamo in una normale annotazione
    else {
        start = $(':nth-child(3)', $(nodo)).text();
        end = $(':nth-child(4)', $(nodo)).text();
        ide = $(':nth-child(2)', $(nodo)).text();
        maxdim = $(':nth-child(5)', $(nodo)).text();
        referenceVar = $(nodo).attr("reference");
    }
    Changing = true;
    DocOrFrag();
    AnnCita = nodo;
    datoLista = lista.slice(0,-1);
    $(datoLista).hide();
}

//elimino la copia del nodo modificato o eliminato dal menu
function deleteTwin(node) {
    var toSave=true;
    // se sta tra i non salvati
    if ($(node).parent().attr('class') == "notSavage" && $(node).attr('class') == 'cita' && cancella) {
        var ide=$(':nth-child(4)',$(node)).text();
        deleteRange(ide,$('#'+$(node).attr("reference")));
        $(node).remove();
    }
    else if ($(node).parent().attr('class') == "notSavage" && $(node).attr('class') == 'annota' && cancella) {
        var ide=$(':nth-child(2)',$(node)).text();
        deleteRange(ide,$('#'+$(node).attr("reference")));
        $(node).remove();
    }
    // se sta tra i non savati e l'annotazione sta dentro una citazione
    else if ($(node).parent().parent().attr('class') == "notSavage" && cancella) {
        $(node).remove();
    }
    else if ($(node).parent().attr('class') == "notSavage" && Changing) {
        $(node).remove();
    }
    //se sta tra i salvati
    else {
        var reference = "";
        // se il padre e' una citazione salvane il nodo e la reference dell'annotazione
        if ($(node).parent().attr('class') == "cita") {
            reference = $(node).attr('reference');
            node = $(node).parent();
        }
        else {
            reference = $(node).attr('reference');
        }
        var tipo = $(node).text();
        var tipo = tipo.split(":");
        tipo = tipo[0].split(" ");
        type = tipo[1];
        var index = $('#lista_' + type)[0];
        var array = $('.elenco ul').children();
        var len = $('.elenco ul').children().length;
        //per ogni lista
        for (var i = 0; i < len; i++) {
            var verifica = $(array[i]).children();
            verifica = verifica[1];
            if ($(verifica).attr('id') == $(index).attr('id') || $(verifica).attr('id') == $('#lista_tutti').attr('id')) { //another BIGUP!!! by Casa e Dado
                var figlio = $(verifica).children();
                var lenV = $(verifica).children().length;
                // per ogni figlio della lista
                for(var j = 0; j < lenV; j++) {
                    if ($(figlio[j]).attr('reference') == reference) {
                        // le copie sono sempre due quindi in salva tutti non c'e' nessun range
                        if ($(node).attr('class') == 'cita' && $(verifica).attr('id') != $('#lista_tutti').attr('id')) {
                            if (cancella) {
                                var ide=$(':nth-child(4)',$(node)).text();
                                deleteRange(ide,$('#'+$(node).attr("reference")));
                            }
                            //salvo l'annotazione per inviarla poi al server
                            if(toSave){
                                old_notes.push(figlio[j]);
                                toSave=false;
                            }
                            $(figlio[j]).remove();
                        }
                        else {
                            // le copie sono sempre due quindi in salva tutti non c'e' nessun range
                            if (cancella && $(verifica).attr('id') != $('#lista_tutti').attr('id')) {
                                var ide=$(':nth-child(2)',$(node)).text();
                                deleteRange(ide,$('#'+$(node).attr("reference")));
                            }
                            //salvo l'annotazione per inviarla poi al server
                            if(toSave){
                                old_notes.push(figlio[j]);
                                toSave=false;
                            }
                            $(figlio[j]).remove();
                        }
                    }
                    else if (($(figlio[j]).attr('reference') != reference) && ($(figlio[j]).attr('class') == "cita")) {
                        var bimbo = $(figlio[j]).children();
                        var lenF = $(figlio[j]).children().length
                        // per ogni figlio della citazione
                        for(var k = magicNumb; k < lenF; k++) {
                            if ($(bimbo[k]).attr('reference') == reference) {
                                if(modifica) {
                                    //salvo l'annotazione per inviarla poi al server
                                    if(toSave){
                                        old_notes.push(figlio[j]);
                                        toSave=false;
                                    }
                                    $(figlio[j]).remove();
                                    break;
                                }
                                else {
                                    //salvo l'annotazione per inviarla poi al server
                                    if(toSave){
                                        old_notes.push(bimbo[k]);
                                        toSave=false;
                                    }
                                    $(bimbo[k]).remove();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


// Funzione che mi permette di scandire la lista di annotazioni e trovare quella dove ho cliccato
function findFragment (nodo) {
    elemento=nodo;
    var len1 = $('#lista_tutti').children().length;
    var array1 = $('#lista_tutti').children();
    var len2 = $('.notSavage').children().length;
    var array2 = $('.notSavage').children();
    var len = len1 + len2;
    var array = $.merge(array1, array2);
    for (var i = 0; i < len; i++) {
        if ($(array[i]).prop('tagName') != 'H2') {
            var figlio = array[i];
            // se il nodo e la citazione cliccata hanno la stessa chiave allora posso accedere a lo switcher
            var key = $(figlio).attr('reference');
            if (key == $(nodo).attr('id')) {
                insert = "";
                // vedo se l'annotazione è del nostro gruppo
                var findElem = $(figlio).attr('by')?$(figlio).attr('by'):$('#'+$(figlio).attr('reference')).attr('by');
                if (mode == "aggiungi") {
                    switcherAdd(figlio);
                    repeat = false;
                }
                else if (mode == "modifica") {
                    if (findElem == 'ltw1521') {
                        canMod = true;
                        Modifica(figlio, $(figlio).find("p:first").text());
                        canMod = false;
                        repeat = false;
                    }
                    else if (findElem != 'ltw1521' && dontDo == false) {
                        time = setInterval(function(){
                            dontDo = false;
                            clearInterval(time)
                        },3000);
                        dontDo = true;
                        Allarme("Non puoi cancellare o modificare un annotazione di un altro gruppo!");
                    }
                }
                else if (mode == "elimina") {
                    if (findElem == 'ltw1521') {
                        if ($(figlio).attr('class') == "cita" && !canDel) {
                            canDel = true;
                            time = setInterval(function(){
                                canDel = false;
                                clearInterval(time)
                            },100);
                            deleteTwin(figlio);
                            OkEsci = false;
                            Visibility();
                        }
                        else if(!canDel){
                            canDel = true;
                            time = setInterval(function(){
                                canDel = false;
                                clearInterval(time)
                            },100);
                            deleteTwin(figlio);
                            OkEsci = false;
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
                }
            }
        }
    }
}

/* FUNZIONI SCRITTE DA DAVIDE */

//funzione per ottenere il livello di annidamento di un nodo rispetto ad un suo ancestor parent
function annidationOffset(nodo,parent){
    var i=0;
    while(nodo!=parent && nodo){
        i++;
        nodo=$(nodo).parent()[0];
    }
    if(!nodo) return i;
    else return undefined;
}

//funzione che, dato un range di una selezione, controlla che esso sia valido per eseguire un annotazione
function isValidRange(range){
    var x=$(range.startContainer).parent()[0];
    var y=$(range.endContainer).parent()[0];
    var px=$(range.startContainer).parents().filter(':not(span.fragment)').filter(':not(span.frag)')[0];
    var py=$(range.endContainer).parents().filter(':not(span.fragment)').filter(':not(span.frag)')[0];
    var xx=$(x).parent()[0];
    var yy=$(y).parent()[0];
    //se il range non è collassato in un punto
    if(!range.collapsed){
        //controlli aggiuntivi per la modifica
        if(modifica){
            var text_notes=getRecursiveTextNode([],x);
            if(x!=y && x.tagName=="SPAN" && text_notes.length >1 && text_notes[0]!=range.startContainer /*x==yy && $.contains(x,range.endContainer) && (ofx-ofy<1)*/)
            return false;
        }
        //controllo se il padre dei due nodi di testo coincide
        if(x==y){
            return true;
        }
        // o che uno dei due nodi contenga l'altro per intero
        else if($.contains(x,y) && range.endOffset==$(range.endContainer).text().length){
            return true;
        }else if($.contains(y,x) && range.startOffset==0){
            return true;
        }
        //o che  i due nodi siano due fratelli completamente selezionati
        else if((px==py || $(px).parent()[0]==$(py).parent()[0]) && range.startOffset==0 && range.endOffset==$(y).text().length){
            return true;
        }
        
    }
    return false;
}

//funzione che recupera correttamente la selezione fatta dall'utente sul documento
function SelectionText(){
    elemento=getElementByCurrentSelection();
    if(isValidRange(range)){ //se il range è valido
        //per ora provo a non settare direttamente ora start ed end. Vediamo che succede, ma penso che non succeda nulla, dato che dani prima
        //chiama me che coloro gli span e poi salva i valori. Dopo la visualizzazione, start ed end saranno corretti (credo)
        ide=getIdFromNode(elemento);
    }else{
        start=end=range=maxdim=spanning=ide=selection="";
    }
}

//funzione che restituisce il nodo che contiene l'attuale selezione
//e salva nella variabile globale selection l'attuale selezione
function getElementByCurrentSelection(){
    if (typeof window.getSelection != "undefined"){
        selection=window.getSelection();
    }
    else{
        selection = document.getSelection();
    }
    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0).cloneRange();
        var parentElement = range.commonAncestorContainer;
        if (parentElement.nodeType == 3) {
            parentElement = parentElement.parentNode;
        }
    }
    return parentElement;
}

//funzione che restituisce l'offset di testo dal padre fino al figlio
function getNodeOffset(parent,son){
    var count=0;
    var nodes=$(parent).contents();
    $.each(nodes, function (key,node){
        if($(son).is(node))return false;
        else count+=$(node).text().length;
    });
    return count;
}

/*metodo che viene richiamato sull'evento onmouseup nel testo del documento.
  se siamo in aggiunta delle annotazioni, esegue la selezione del nodo*/
function okToAnnote(evt){
    if (!blindE &&!modifica && !cancella) SelectionText();
    else start=end=range=maxdim=spanning=ide=selection="";
}

//funzione che colora il testo selezionato
function colorRange(range,classe){
    //controllo se l'annotazione ha uno span oppure no (quindi è sul documento)
    if (isFragmentAnnotation(undefined)){ //parametro undefined per dire che deve semplicemente controllare la referenceVar per decidere
            var reference,s,e,isMod;
            //se sto modificando un frammento già esistente
            if(Changing){
                isMod=true;
                reference=referenceVar+1;
                s=start;
                e=end;
                //elemento=$('#'+referenceVar).parent()[0];
                elemento=$('#'+referenceVar).parents().filter(':not(span.fragment)').filter(':not(span.frag)')[0];
            }else{
                //sto creando un nuovo frammento
                isMod=false;
                reference=undefined;
                var tmp=getAbsoluteStartEnd(range);
                //risetto le variabili con i valori corretti
                s=tmp['start'];
                e=tmp['end'];
                elemento=tmp['nodo'];
            }
            group_property="ltw1521";
            //creo l'annotazione
            var span=showAnnotation(classe,elemento,s,e,reference,isMod,group_property);
            //salvo i valori di start ed end per Dani
            start=s;
            end=e;
            //restituisco lo span
            return span;
    }
}

//metodo che, dato un nodo del DOM, calcola il suo id da salvare sul JSON (concatenato all'id generico).
function getIdFromNode(nodo){
    if(nodo!=undefined){
        var base=id_usato;
        var arr=[];
        var i=0;
        var parent=$('.testo')[0];
        var tmp=$('.testo').children()[0];
        var again=true;
        //scorro la lista dei figli cercando se l'i-esimo figlio è quello che cerco o se contiene quello che cerco
        while(again){
            while(!$.contains(tmp,nodo) && nodo!=tmp){
                i++;
                //memorizzo quanti nodi dello stesso tipo d quelli cercati trovo
                tmp=$(parent).children()[i];
            }
            //aggiungo la parte di id calcolata fin'ora
            base+=$(tmp).prop('tagName').toLowerCase()+nodePosition(tmp,parent)+"_";
            //se ho già trovato il nodo mi fermo
            if(nodo==tmp) again=false;
            //altrimenti risetto le variabili
            else {
                i=0;
                parent=tmp;
                tmp=$(tmp).children()[0];
            }
        }
        //rimuovo l'ultimo ' _ ' inserito di troppo
        base=base.substr(0,base.length-1);
        var arr=base.split("tbody1_");
        base=arr.join("");
        base=base.replace(/_span[0-9]*/g,"");
        return base;
    }else return undefined;
}

//funzione che, dato un range, restituisce il nodo dal quale creare l'annotazione e start ed end corretti
function getAbsoluteStartEnd(range){
    var parent,s_node,e_node,start,end;
    parent=range.commonAncestorContainer;
    while(parent.nodeType==3 || parent.tagName=="SPAN" || parent.tagName =="BR")parent=$(parent).parent()[0];
    //Recupero tutti i nodi di testo del padre comune (nodo html) dei due nodi
    var nodes=getTextNodesUnder(parent);
    //itero per calcolare gli offset
    var flag=false;
    var count=0;
    var off_s,off_e;
    $.each(nodes,function (key,node){
        var len=$(node).text().length;
        //se flag è false, sto ancora cercando il nodo dello start
        if(!flag){
            if(node==range.startContainer){
                //ho trovato il nodo dello start. l'attuale valore di count è l'offset dello start
                flag=true;
                off_s=count;
            }
        }
        if(flag){
            //ho già trovato lo start. cerco l'end
            if(node==range.endContainer){
                //ho trovato il nodo dell'end. l'attuale valore di count è l'offset dell'end
                off_e=count;
                //inutile proseguire, ho già quello che mi serve
                return false;
            }
        }
        //in ogni caso, incremento count per il giro successivo
        count+=len;
    });
    //a questo punto posseggo gli offset sia per lo start che per l'end. li sommo
    start=range.startOffset+off_s;
    end=range.endOffset+off_e;
    return {
        "nodo":parent,
        "start":start,
        "end":end
    }
}

//funzione che conta il numero di fratelli dello stesso tipo prima del nodo stesso
function nodePosition(nodo,parent){
    var i=0;
    $.each($(parent).children(),function (key,node){
        if(node.tagName==nodo.tagName) i++;
        if(node==nodo) return false;
    });
    return i;
}

//metodo per cambiare graficamente il range di una annotazione
    function changeRange(id,nodo,start,end,an_type){
    //prima elimino il vecchio range
    if (isFragmentAnnotation(nodo)){
        var parent=getElementByTargetId(id);
        var node=$('#'+$(nodo).attr("reference"));
        node=node[0];
        var bkp_span=$('.testo').html();
        var bkp_note=$('.doc-right').html();
        deleteRange(id,node);
        //poi ne creo uno nuovo con la sua nuova dimensione
        id=$(node).attr("id");
        try{
           showAnnotation(an_type,parent,start,end,id,true,'ltw1521');
        }catch(exc){
            $('.testo').html(bkp_span);
            $('.doc-right').html(bkp_note);
            Allarme("Confermare, nulla o la stessa cosa, non è ammesso!");
            return false;
        }
    }
}

//metodo per eliminare graficamente un'annotazione dato il nodo e l'id del parent
function deleteRange(id,node){
    if(node!=undefined){
        //var parent=getElementByTargetId(id);
        deleteRangeFromParent(node,parent);
    }
}

//metodo per eliminare graficamente un'annotazione dato il nodo e il parent
function deleteRangeFromParent(node,parent){
    /*salvo il testo dell'annotazione, prendo tutto l'html del padre e faccio lo split con l'html dello span
      quello che ottengo è il testo prima e dopo dello span. Ri-incollo i 3 pezzi di testo nel parent.*/
    /*var text=$(node)[0].textContent;
    var text_p=$(parent)[0].innerHTML;
    var text_n=$(node)[0].outerHTML;
    text_p=text_p.split(text_n);
    var after=text_p[1];
    var before=text_p[0];
    $(parent).html(before+text+after);*/
    $(node).contents().unwrap();
}

//metoodo per dani che controlla se, dato uno span, c'è un'altra annotazione che lo wrappa completamente.
function checkOverlapping(node){
    var span=$('#'+$(node).attr("reference"));
    var parent=$(span).parent()[0];
    //se il padre non è uno span, posso terminare
    if(!(parent.tagName.toLowerCase()=="span")) return false;
    //il padre è uno span. se il testo dei due nodi non coincide, posso terminare
    var t_parent=$(parent).text();
    var s_parent=$(span).text();
    if(t_parent.trim()!=s_parent.trim()) return false;
    //il testo coincide, richiamo switcherAdd col padre
    var nodi=$('#lista_tutti,.notSavage').children();
    nodi=nodi.filter(function (key,node){
        return (node.tagName.toLowerCase()=="div" && $(node).attr("reference")==$(parent).attr("id"))
    });
    return nodi[0];
}

//funzione che si occupa di capire se l'annotazione è su frammento o sul documento.
function isFragmentAnnotation(div){
    //per la creazione, il controllo è semplice
    if(!modifica){
        if (range=="") return false;
        else return true;
    }
    else{
        //sono in modifica
        if(div!=undefined){
          if ($(div).attr("reference").indexOf('doc')>-1){
             //se sono qui significa che è un annotazione su un documento
             return false;
          }
          else return true;
        }else{
            if(Changing){
                return referenceVar.indexOf('doc')>-1?false:true;
            }else{
                //non dovrebbe mai entrare qui
                return undefined;
            }
        }
    }
}

//funzione che restituisce in quale chave dell'array si trova il nodo
function keyInArr(nodo,array){
    var i=-1;
    $.each(array,function (key,value){
        if($(value).is(nodo)){
            i=key;
            return false;
        }
    });
    return i;
}

//funzione che calcola il valore minimo dello start
function minStart(start,span){
    /*var nodi=$('#'+span).parent().contents();
    var i=keyInArr(span,nodi);
    var again=true;
    while(i>0 && again){
        i--;
        if(nodi[i].nodeType==3)
            start-=nodi[i].length;
        else
            again=false;
    }
    return start;*/
    return 0;
}

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

//funzione che controlla se la modifica di uno start ed end vanno bene
function checkCorrectSelection(div,start,end){
    var span=$('#'+$(div).attr('reference'))[0];
    var nodi=getRecursiveTextNode([],span);
    var count=0;
    var starter=ender=undefined;
    var again=true;
    $.each(nodi,function (key,node){
        var length=$(node).text().length;
        count+=length;
        if(start<=count && again){
            starter=node;
            again=false;
        }else if(end<=count){
            ender=node;
            return false;
        }
    });
    //se non trovo starter ed ender, e può succedere, li setto rispettivamente al primo ed ultimo nodo di testo trovato
    if(starter==undefined) starter=$(nodi)[0];
    if(ender==undefined) ender=$(nodi).last()[0];
    var x=$(starter).parent()[0];
    var y=$(ender).parent()[0];
    var xx=$(x).parent()[0];
    var yy=$(y).parent()[0];
    //controllo se il padre dei due nodi di testo coincide
      if(x==y){
          return true;
      }
      // o che uno dei due nodi contenga l'altro per intero
      else if($.contains(x,y)){
          return true;
      }else if($.contains(y,x)){
          return true;
      }
      //o che  i due nodi siano due fratelli completamente selezionati
      else if(xx==yy && start==0 && end==$(y).text().length){
          return true;
      }
      return false;

}

//funzione che calcola il valore massimo dell'end
function maxEnd(end,span){
    //trovo tutti i caratteri
    var nodi=$('#'+span).parents().filter(':not(span.fragment)').filter(':not(span.frag)')[0];
    /*var i=keyInArr(span,nodi);
    var again=true;
    while(i<nodi.length-1 && again){
        i++;
        if(nodi[i].nodeType==3)
            end+=nodi[i].length;
        else
            again=false;
    }
    return end;*/
    return $(nodi).text().length;
}

