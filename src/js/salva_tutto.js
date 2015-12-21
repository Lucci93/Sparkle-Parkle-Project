// FUNZIONI SCRITTE DA DANIELE
numCita = 0; // utilizzata per sapere il numero delle citazione nel json

// Funzione che si occupa di mettere nella citazione tutte le possibili anotazioni
function switcherCita(annota, json, id) {
    var json ="";
    var testo = $(annota).html();
    var valore = testo.split(": ");
    valore = valore.slice(1).join(': ');
    var tipo = testo.split(" ");
    valore = valore.split(" - ");
    valore.pop();
    valore.pop();
    valore.pop();
    valore = valore.join(" - ");
    valore = JSONReplace(valore);
    switch(tipo[1]) {
        case "autore:":
            var nome = AuthorNameReplace(valore);
            json += '{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è ' + valore + '","subject":"' + id + '","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/' + nome + '","label":"' + valore + '"}}},';
            break;

        case "data:":
            json += '{"type":"hasPublicationYear","label":"Anno di pubblicazione","body":{"subject":"' + id + '","predicate":"fabio:hasPublicationYear","literal":"' + valore + '"}},';
            break;

        case "titolo:":
            json += '{"type":"hasTitle","label":"Titolo","body":{"subject":"' + id + '","predicate":"dcterms:title","object":"' + valore + '"}},';
            break;

        case "doi:":
            json += '{"type":"hasDOI","label":"DOI","body":{"subject":"' + id + '","predicate":"prism:doi","literal":"'+ valore +'"}},';
            break;

        case "url:":
            json += '{"type":"hasURL","label":"URL","body":{"subject":"' + id + '","predicate":"fabio:hasURL","literal":"'+ valore +'"}},';
            break;

        case "commento:":
            json += '{"type":"hasComment","label":"Commento","body":{"subject":"' + id + '","predicate":"schema:comment","literal":"'+ valore +'"}},';
            break;

        case "denotazione:":
            var risorsa = ChoiceRis(valore);
            json += '{"type":"denotesRhetoric","label":"Retorica","body":{"label":"' + valore +'","subject":"' + id + '","predicate":"sem:denotes","resource":"' + risorsa + '"}},';
            break;
    }
    return json;
}

// Scieglie la risorsa della denotazione retorica
function ChoiceRis(risorsa) {
    if( risorsa == "Abstract" || risorsa == "Discussion" || risorsa == "Conclusion") {
        return 'sro:' + risorsa ;
    }
    else {
        return 'deo:' + risorsa ;
    }
}

// La funzione preimposta la citazione e aggiunge all'interno le annotazioni presenti richiamando un altro metodo
function Cita(array, citazione, utente, mail, citato, id, data, start, end) {
    citato = JSONReplace(citato);
    citazione = JSONReplace(citazione);
    var annotazioni = 0;
    var len = array.length;
    // guardo quante annotazioni sono presenti all'interno dela citazione
    for (var i = 0; i < len; i++){
        if ($(array[i]).attr('class') == "annota") {
            annotazioni++;
        }
    }
    // dopo aver messo la prima parte del json della citazione partendo dal settimo figlio della citazione
    // (sapendo che i primi sei figli sono variabili nascoste)
    // scandisco le annotazioni nella citazioni e le salvo in una variabile da aggiungere al json finale
    var len = magicNumb + annotazioni;
    var subject = URI.split(".");
    subject = subject[subject.length - 1];
    if (subject != "html" && subject != "php") {
        subject = URI + "/index" + "_ver1";
    }
    else {
        subject = URI.slice(0, -5);
        subject += "_ver1";
    }
    var ide =  subject + '_cited' + numCita;
    json = '{"annotations":[{"type":"cites","label":"Citazione","body":{"label":"Questo articolo cita \'' + citazione + '\'","subject":"' + subject + '","predicate":"cito:cites","resource":{"id":"' + ide + '","label":"' + citato + '"}}},';
    for (i = magicNumb; i < len; i++){
        var insert = switcherCita(array[i] ,json ,ide);
        json += insert;
    }
    json = json.slice(0, -1); //elimino l'ultima virgola
    json += '],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente +'","email":"' + mail + '"},"time":"' + data +'"}},';

    return json;
}

// Sceglie l'annotazione da inserire
function switcherSave(type, valore, utente, mail, data, start, end, id, reference) {
    valore = JSONReplace(valore);
    var json = "";
    var subject = URI.split(".");
    subject = subject[subject.length - 1];
    if (subject != "html" && subject != "php") {
        subject = URI + "/index.html";
    }
    else {
        subject = URI.slice(0, -5);
    }
    switch(type) {
        case "autore":
            var nome = AuthorNameReplace(valore);
            if (reference == "d") {
                json += '{"annotations":[{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è ' + valore + '","subject":"' + subject + '","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/' + nome + '","label":"' + valore + '"}}}],"target":{"source":"' + URI + '","id":"document"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail +'"},"time":"' + data + '"}},';
            }
            else {
                json += '{"annotations":[{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è ' + valore + '","subject":"' + subject + '","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/' + nome + '","label":"' + valore + '"}}}],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail +'"},"time":"' + data + '"}},';
            }
            break;

        case "data":
            subject += "_ver1";
            if (reference == "d") {
                json += '{"annotations":[{"type":"hasPublicationYear","label":"Anno di pubblicazione","body":{"subject":"' + subject + '","predicate":"fabio:hasPublicationYear","literal":"' + valore + '"}}],"target":{"source":"' + URI + '","id":"document"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            else {
                json += '{"annotations":[{"type":"hasPublicationYear","label":"Anno di pubblicazione","body":{"subject":"' + subject + '","predicate":"fabio:hasPublicationYear","literal":"' + valore + '"}}],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            break;

        case "titolo":
            subject += "_ver1";
            if (reference == "d") {
                json += '{"annotations":[{"type":"hasTitle","label":"Titolo","body":{"subject":"' + subject + '","predicate":"dcterms:title","object":"' + valore + '"}}],"target":{"source":"' + URI + '","id":"document"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            else {
                json += '{"annotations":[{"type":"hasTitle","label":"Titolo","body":{"subject":"' + subject + '","predicate":"dcterms:title","object":"' + valore + '"}}],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            break;

        case "doi":
            subject += "_ver1";
            if (reference == "d") {
                json += '{"annotations":[{"type":"hasDOI","label":"DOI","body":{"subject":"' + subject + '","predicate":"prism:doi","literal":"'+ valore +'"}}],"target":{"source":"' + URI + '","id":"document"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            else {
                json += '{"annotations":[{"type":"hasDOI","label":"DOI","body":{"subject":"' + subject + '","predicate":"prism:doi","literal":"'+ valore +'"}}],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            break;

        case "url":
            subject += "_ver1";
            if (reference == "d") {
                json += '{"annotations":[{"type":"hasURL","label":"URL","body":{"subject":"' + subject + '","predicate":"fabio:hasURL","literal":"'+ valore +'"}}],"target":{"source":"' + URI + '","id":"document"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            else {
                json += '{"annotations":[{"type":"hasURL","label":"URL","body":{"subject":"' + subject + '","predicate":"fabio:hasURL","literal":"'+ valore +'"}}],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            }
            break;

        case "commento":
            subject += "_ver1";
            json += '{"annotations":[{"type":"hasComment","label":"Commento","body":{"subject":"' + subject + '","predicate":"schema:comment","literal":"'+ valore +'"}}],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            break;

        case "denotazione":
            subject += "_ver1#";
            var risorsa = ChoiceRis(valore);
            json += '{"annotations":[{"type":"denotesRhetoric","label":"Retorica","body":{"label":"' + valore +'","subject":"' + subject + id + '-' + start + '-' + end + '","predicate":"sem:denotes","resource":"' + risorsa + '"}}],"target":{"source":"' + URI + '","id":"' + id + '","start":"' + start + '","end":"' + end + '"},"provenance":{"author":{"name":"' + utente + '","email":"' + mail + '"},"time":"' + data + '"}},';
            break;
    }
    return json;
}

// funzione che a seconda del tipo di annotazione aggiunge il json
function Save(array, reference) {
    var testo = array[0];
    testo = $(testo).text();
    var tipo = testo.split(":");
    tipo = tipo[0].split(" ");
    // utilizzato per salvare poi l'annotazione nella lista salvati
    type = tipo[1];
    // modello il primo figlio dell'array in modo da ottenere il tipo di annotazione
    // spezzando l'annotazione ottengo tutte le informazioni da inserire nel json
    if (tipo[1] != "citazione") {
        var stringa = testo.split(": ");
        stringa = stringa.slice(1).join(': ');
        stringa = stringa.concat(':');
        stringa = stringa.concat(stringa[2]);
        stringa = stringa.slice(0, -2);
        stringa = stringa.split(" - ");
        var data = stringa.pop();
        var mail = stringa.pop();
        var utente = stringa.pop();
        stringa = stringa.join(" - ");
        var id = array[1];
        id = $(id).text();
        var start = array[2];
        start = $(start).text();
        var end = array[3];
        end = $(end).text();
        data = data.split(" ");
        var json = switcherSave(tipo[1], stringa, utente, mail, data[0], start, end, id, reference);
    }
    else {
        numCita ++;
        var citazione = testo.split(": ");
        citazione = citazione.slice(1).join(': ');
        citazione = citazione.concat(':');
        citazione = citazione.concat(citazione[2]);
        citazione = citazione.slice(0, -2);
        citazione = citazione.split(" - ");
        var data = citazione.pop();
        var mail = citazione.pop();
        var utente = citazione.pop();
        citazione = citazione.join(" - ");
        var citato = array[2];
        citato = $(array[2]).text();
        var id = array[3];
        id = $(array[3]).text();
        var start = array[4];
        start = $(array[4]).text();
        var end = array[5];
        end = $(array[5]).text();
        var data = data.split(" ");
        var json = Cita(array, citazione, utente, mail, citato, id, data[0], start, end);
    }
    return json;
}

// crea il json partendo dalla lista delle annotazioni non salvate
function CreateJson() {
    // parte di json iniziale comune a qualsiasi post al server
    var json1 = '{ "annotazioni": [';
    var json2=json1;
    //recupero tutte le mie e solo le mie annotazioni
    var array = $('.notSavage').children();
    var len = array.length;
    // scandisco la lista sapendo senza controlli che questa conterrà almeno un figlio
    for (var i = 0; i < len; i++) {
        if ($(array[i]).prop('tagName') != 'H2') {
            var figlio = $(array[i]).children();
            var reference = $(array[i]).attr('reference');
            reference = reference.slice(0,1);
            var insert = Save(figlio, reference);
            var index = $('#lista_' + type)[0];
            $('#lista_tutti').append($(figlio.parent()).clone());
            $(index).append($(figlio.parent()).clone());
            json1 += insert;
        }
    }
    //elimino l'ultima virgola e aggiungo la parte finale comune a tutti i post al server
    json1 = json1.slice(0, -1);
    json1 += ']}';
    numCita = 0;
    //ora genero il json delle annotazioni da cancellare
    len=old_notes.length;
    for (var i = 0; i < len; i++) {
        if ($(old_notes[i]).prop('tagName') != 'H2') {
            var figlio = $(old_notes[i]).children();
            var reference = $(old_notes[i]).attr('reference');
            reference = reference.slice(0,1);
            var insert = Save(figlio, reference);
            json2 += insert;
        }
    }
    json2 = json2.slice(0, -1);
    json2 += ']}';
    numCita = 0;
    return {
        'new':json1,
        'old':json2
    };
}

//FUNZIONI SCRITTE DA DAVIDE

// invia il json al server
function SendJSON() {
    //genero il JSON
    var dataJSON = CreateJson();
    //rimuovo possibili caratteri di a capo che sminchiano il JSON
    dataJSON['new'] = dataJSON['new'].replace(/[\n\r]/g, '');
    dataJSON['old'] = dataJSON['old'].replace(/[\n\r]/g, '');
    old_notes=[];
    $.ajax({
        url: locate+'Server/save.php',
        method: "POST",
        data: {'new':dataJSON['new'],'old':dataJSON['old']},
        dataType: "text",
        success:function(data){
            if(data!="error"){
                Allarme("Invio effettuato!");
            }else{
                Allarme("Errore del server. Riprovare il salvataggio");
            }
        },
        error: function(jqXHR, textStatus, textError) {
            alert( "Opss! " + textStatus + " " + textError );
        }
    });
}

$(document).ready(function() {

    // Salva tutto
    $('#f-save').on('click', function() {
        SendJSON();
        $('.notSavage').empty();
        $('.notSavage').append('<h2>Non Salvati</h2>');
        OkEsci = true;
        Visibility();
    });
});
