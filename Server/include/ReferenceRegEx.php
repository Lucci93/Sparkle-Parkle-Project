<?php
//file scritto da Gabriele Casanova
/*Cerco il cognome dell'ultimo autore dato che ritorna estremamente utile togliere tutta la parte autori
quando si cerca il titolo(le regex diventano estremamente più efficaci,oltre che semplici)*/	
function surnameOfLastAuthor($content,$authorsset){
	$surnameslist=null;
	//per prima cosa mi creo una lista di tutti i cognomi degli autori del documento
	foreach($authorsset as $n=>$autore){
		$exploded=explode(".",$autore);
		$tmp="";
		if(isset($exploded))$tmp=$exploded[0];
		else continue;//non dovremme mai eseguire questa riga
		foreach($exploded as $esploso){
			if(strlen($esploso)>strlen($tmp))$tmp=$esploso;
		}
		$surnameslist[$n]=trim($tmp);
	}
	//ora controllo qual'è l ultimo autore
	if(isset($surnameslist))$ultimo=$surnameslist[0];
	else return null;//anche questa riga non dovrebbe mai essere eseguita
	foreach($surnameslist as $n=>$surname){
		$currentpos=strpos($content, $surname);
		//se il nome dell'autore è dopo metà della lunghezza totale della sringa, non mi interessa perchè
		//quasi sicuramente è dopo il titolo
		if(strpos($content,$ultimo)<$currentpos&&$currentpos<(strlen($content)/2))$ultimo=$surname;
	}
	
	return $ultimo;
	
}

function getTitleDLib($content,$probablytitle,$authorsset){
			/*
			dato che mi sembra ragionevole pensare che un titolo abbia almeno 2 parole
			guardo se il forse titolo preso dall'ancora ha almeno 2 parole, altrimenti non è un titolo
			e cerco il titolo con altri metodi
			*/
			if(isset($probablytitle)){
				$probablytitle=trim($probablytitle);
				
				$test=explode(" ",$probablytitle);
					if(count($test)>1){
						return $probablytitle;
					}
			}
			//prima controllo se ci sono stringhe tra "", nel caso prendo quelle come titolo
			//preg_match_all('/"(.*)"/',$content, $tmp);
			preg_match_all('/"(.*)"/',$content, $tmp);
			//se ha trovato qualcosa, in $tmp[0][0] c'è il primo match con i "" compresi, in $tmp[1][0] c'è il primo match senza "", prendo quest'ultimo
			if(isset($tmp[1][0])){ 
				$tmp=$tmp[1][0];
				//tolgo la virgola alla fine, a volte c'è e non mi sembra il caso di tenerla
				if(substr($tmp, -1)==","){
				$tmp=substr($tmp,0,-1);
				}
				$tmp= trim($tmp);
			/*
			può capitare che che ci sia una singola parola tra "" che non sia il titolo, quindi, dato che mi sembra ragionevole che il titolo non sia composto da una singola parola
			  butto via il risultato ottenuto e provo a prendere il titolo nell' altro modo (questo caso mi è capitato quando tutti i titoli non erano tra "", per questo salto all' altro caso)
			*/
				$test=explode(" ",$tmp);
				if(count($test)==1){ 
					$tmp=null;
					goto prometto_che_questo_sara_l_unico_goto_nel_mio_codice;
				}
			}
			
			
			
			/*se non ho trovato stringhe tra "" mi devo arrangiare in un altro modo
			l'unico procedimento che mi è venuto in mente che dovrebbe funzionare decentemente è prendere una stringa che inizia e finisce con . del quale
			all' interno ci sono almeno due parole separate da spazi.
			
			Più precisamente la seguente regex fa match con:(userò il termine stringa per indicare una qualsiasi sequenza di caratteri non contenente la i caratteri ". ")
			un "." seguito da un qualsiasi carattere seguito da almeno una  stringa seguita da uno spazio.
			dopo lo spazio ci deve essere almeno un'altra stringa seguita da uno spazio e infine una qualsiasi sequenza di caratteri(almeno 2) che finisca con ".", ma che non contiene un "." all'interno.

			Mi sembra ragionevole pensare che sia molto probabile che un titolo contenga abbastanza parole da fare match con questa regex, e avendo presente la struttura di dlib mi sembra ragionevole
			anche pensare che sia il primo match trovato a contenere il titolo (dato che normalmente prima del titolo ci sono gli autori e l'anno e non dovrebbero fare match con questa espressione).
			
			*/
			else {
				prometto_che_questo_sara_l_unico_goto_nel_mio_codice:
				
				$ultimo_autore=surnameOfLastAuthor($content,$authorsset);
				if(isset($ultimo_autore))$newcontent=explode($ultimo_autore,$content);
				if(isset($newcontent)){
				if(!($newcontent===FALSE||$newcontent[0]==$content))$content=$newcontent[1];//valori che restituisce l'explode nel caso fallisca
				}
				
				preg_match_all('/\.(.|..)([^\. ])+ ((([^\.])+ )+([^\.])+)\./',$content, $tmp);
				if(isset($tmp[0][0])){ 
					$tmp=$tmp[0][0];
					$tmp= str_replace(".","",$tmp);
					$tmp= trim($tmp);
				}
				else $tmp=null; //caso anche questo non ha funzionato allora non so proprio come fare
			}
			/*In alcuni casi non c'è solo il titolo tra i ".", ma c'è anche "(ANNO)", questa è la parte un cui lo tolgo*/
			if(strpos($tmp,") ")){
				$tmp=explode(")",$tmp)[1];
			}
			
			return $tmp;		
}

function getTitleUnibo($content,$year,$tauthors){
	//preg_match_all('/(\)\. |\), |\) )[^\.,]+(\.|,)/',$content, $tmp);//vecchia regex troppo precisa
	/*
	per sicurezza tolgo tutta la parte prima del titolo, usando l'anno se l'ho trovato o l'ultimo autore 
	*/
	if($year!=null){
		$content=explode($year,$content,2)[1];
	}
	else if(isset($authors)){
		$content=explode(surnameOfLastAuthor($content,$authors),$content)[1];
		$content=$content;
	}
	/* 
	Generalmente i titoli delle citazioni sono preceduti da "). " o "), " e seguiti da un punto o una virgola 
	(e se non sono l'unico match di questa dorma li ho sempre visti come primo match)
	(raremente la parentesi non c'è, per questo ho cambiato la regex, rendendola più semplice e meno precisa e ho cercato di togliere
	titolo e autori per dar si che la minore precisione non cusi problemi). Mi sono basato su questo per riconoscerli
	*/
	
	preg_match_all('/(\. |\, |\) )[^\.,]+(\.|,)/',$content, $tmp);
	if(isset($tmp[0][0])){
		$tmp=$tmp[0][0];
		$tmp=str_replace("). ","",$tmp);
		$tmp=str_replace("), ","",$tmp);
		$tmp=str_replace(") ","",$tmp);+
		$tmp=substr($tmp,0,-1);
		$esploso=explode(" ",$tmp);
		$tmp="";//tolgo i caratteri iniziali che la regex ha preso, ma non fanno parte del titolo
		foreach ($esploso as $k=>$v){
			if($k==0) continue;
			$tmp=$tmp.$v." ";
		}
		$tmp=substr($tmp,0,-1);
		
	}
	else $tmp=null;

	return $tmp;

}

//$last_regex_used: 0 alla prima chiamata, 1 se precedentemente si è usata la prima regex, 2 se si è usata la seconda
function getAuthorsDLib($content, &$last_regex_used){
	/*
	Dato che a volte ci sono prima i nomi e poi i cognomi e altre volte il contrario, è impossibile trovare regular expressions che facciano match in un caso e non lo faccia nell' altro
	in quanto al massimo prenderebbero l'uno di Mr.X e l' altro di Mrs.Y se la pagina li invertiva rispetto a ciò che ci si aspettava. Quindi l'unica cosa che mi è venuta in mente
	è fare una statistica: uso entrambi i modi e salverò il metodo che mi ha dato più risultati, in quanto il metodo sbagliato dovrebbe saltare un nome e un gognome (del primo e ultimo autore)*/
	$nome_cognome=array();$cognome_nome=array();
	//caso Nomi Cognome
	/*Questa regex prende i nomi della forma "N. N. N. Cognome," ouppure "N. N. N. Cognome and"  con un numero arbitrario di N.*/
	$content = str_replace("-"," ",$content);//per avere una regex più semplice
	//preg_match_all('/((([A-Z]\. )+)([A-Z]\.)|([A-Z]\.)) (([^\.,0-9: ])+,|([^\.,0-9: ])+ and)/',$content, $tmp);
	//l'http nella regex serve a non selezionare un caso un po' specifico, ma che ho visto capitare
	preg_match_all('/((([A-Z]\. )+)([A-Z]\.)|([A-Z]\.)) [^http](([^\.,0-9: ])+,|([^\.,0-9: ])+)/',$content, $tmp);
			
	if(!empty($tmp)){
		foreach($tmp[0] as $k=>$val){					
			if(substr($val, -1)==","){
				$val=substr($val,0,-1);
			}
			$val=str_replace(" and","",$val);
			$val=trim($val);
			if(strpos($content,$val)<(strlen($content)/2)){//se la condizione è falsa di certo ho preso qualcosa oer sbaglio che non è un titolo
			$nome_cognome[$k]=$val;	
			}
		}
	}
	//caso Cognome Nomi		
	//preg_match_all('/((([^\.,0-9: ]))+,) ([A-Z]\.[ |,])+/',$content, $tmp);
	preg_match_all('/((([^\.,0-9: ]))+,) (([A-Z]\.)+.)+/',$content, $tmp);
	if(!empty($tmp)){
		foreach($tmp[0] as $k=>$val){
			$val=substr($val,0,-1);//carattere sempre e comunque in più
			if(substr($val, -1)==","){
				$val=substr($val,0,-1);//carattere in più a meno che non sia l'ultimo autore della citazione
				
			}
			/*Per uniformità metto il cognome all' ultimo posto, in modo di avere un risultato finale di forma simile al caso precedente*/
			$pezzi=explode(",",$val);
			$max=count($pezzi);
			$pezzi[$max]=$pezzi[0];						
			$autore="";
			for($num=1;$num<$max+1;$num++){
				$autore.=$pezzi[$num]." ";
			}
			$autore=trim($autore);
			if(strpos($content,$val)<(strlen($content)/2)){//se la condizione è falsa di certo ho preso qualcosa oer sbaglio che non è un titolo
			$cognome_nome[$k]=$autore;
			}
		}
	}
	if(count($cognome_nome)>count($nome_cognome)) {$authors=$cognome_nome;$last_regex_used=2;}
	else if(count($cognome_nome)<count($nome_cognome)){$authors=$nome_cognome;$last_regex_used=1;}
	else {
		/*
		Caso in cui entrambe le regex hanno restituito lo stesso numero di risultati
		(Caso ultrararo).Per prima cosa guardo quale regex  in precedenza mi aveva
		restituito più risultati e,assumendo che nella stessa pagina gli autori siano elencati
		con la stessa forma,uso quella espressione.
				
		Se non posso controllare il caso preccedente perchè è la prima citazione della pagina
		(Caso SUPERMEGAIPERULTRAEPIUPROBABILEVINCEREUNESTRAZIONEDELLOTTORARO)
		allora per ogni nome che ha fatto match:
		controllo che nessuno dei sia più lungo di 20 caratteri(in quel caso è molto improbabile che si tratti davvero di un nome)
		e nel caso faccio una media e prendo il nome che come lunghezza si ci avvicina di più (per togliere i nomi troppo corti che molto probabilmente non sono davero nomi)
				
		Alla fine uso il metodo che ha ottenuto più vittorie,se il numero di vittorie è auguale
		(caso ancora più raro,per non dire quasi impossibile) ne restituisco uno dei due
		*/
		if($last_regex_used==1)$authors=$nome_cognome;
		if($last_regex_used==2)$authors=$cognome_nome;
		else{
			$n_c_win_counter=0;
			$c_n_win_counter=0;
					
			foreach($nome_cognome as $key=>$useless){
				$n_c_len=strlen($nome_cognome[$key]);
				$c_n_len=strlen($cognome_nome[$key]);
				if($n_c_len>20&&$c_n_len>20) continue;//caso entrambi troppo lunghi per essere nomi, nessun vincitore a sto giro
				if($n_c_len>20){$c_n_win_counter++;continue;}
				if($c_n_len>20){$n_c_win_counter++;continue;}
						
				$media=($n_c_len+$c_n_len)/2;
				$n_c_proximity=abs($media-$n_c_len);
				$c_n_proximity=abs($media-$c_n_len);
						
				if($n_c_proximity>$c_n_proximity){$c_n_win_counter++;continue;}
				else {$n_c_win_counter++;continue;}
			}
					
			if($c_n_win_counter>$n_c_win_counter)$authors=$cognome_nome;
			else $authors=$nome_cognome;
				
		}
								
	}
	//foreach($authors as $k => $val){
	//	echo "<br><br> $val <br><br>";
	//}
	return $authors;
}

function getAuthorsUnibo($content){
		$authors=null;$tmp=null;
		$nome_cognome=array();$cognome_nome=array();
		/*Valgono le stesse cose della parte di dlib, ma ci sono casi da gestire in più, in quanto a volte si ha la forma N.-N. e il carattere che si trova dopo i Nomi e Cognome della persona
		(per separare l'uno dagli altri oppure ciò che c'è dopo l'ultimo)è molto più arbitrario */
		$nome_cognome=array();$cognome_nome=array();
		
		/*torna molto comodo elimninare il carattere - e gli spazi in quanto non ci interessano e ricomdurrebbe al caso N.N.Cognome o Cognome,N.N. che devono essere gestiti comunque*/
		$content=str_replace("-","",$content);
		$content=str_replace(" ","",$content);
		
		//caso Nomi Cognome
		/*Questa regex prende i nomi della forma "N.N.N.COGNOME" o "N.N.N.Cognome" con un numero arbitrario di N.*/
		preg_match_all('/(([A-Z]\.)+)[A-Z]([^(),\.])+/',$content, $tmp);
		if(isset($tmp[0])){
	
			/*Molto raramente ci sono dei pezzi di stringa che non sono autori che hanno la stessa forma specificata prima, e quasi sempre in questi casi nell'ipotetico cognome ci sono dei numeri
			per questo nella regex di prima ho permesso al cognome di avere delle cifre. Ora tolgo dai risultati trovati tutti quelli che hanno all'interno delle cifre, in quanto so di certo che non possono
			essere degli autori*/			
			$tmp[0]=stripErrors($tmp[0]);
			foreach($tmp[0] as $k=>$val){
				//echo "<br>ris1: $val<br>";
				$nome_cognome[$k]=$val;	
			}
			
		}	
		//caso Cognome Nomi		
		preg_match_all('/([A-Za-z](([^\.,0-9]))+,)([A-Z]\.)+/',$content, $tmp);
		if(!empty($tmp)){
				foreach($tmp[0] as $k=>$val){
					/*Per uniformità metto il cognome all' ultimo posto, in modo di avere un risultato finale di forma simile al caso precedente*/
					$pezzi=explode(",",$val);
					$max=count($pezzi);
					$pezzi[$max]=$pezzi[0];						
					$autore="";
					for($num=1;$num<$max+1;$num++){
						$autore.=$pezzi[$num]." ";
					}
					
					/*Per cognomi molto particolari, tipo de Gaetano o Di Castenlunovo, diventati deGaetano e DiCastenlunovo, devo ri-separare le due parti, altrimenti avvengono errori nel trasformali nella forma
					n-cognome. Quindi aggiungo uno spazio tra una minuscola succeduta da una maiuscola se ne trovo.*/
					$tmp=$autore;
					$current_char;
					$next_char;
					for($i=0;$i<strlen($tmp);$i++){	
						$current_char=$i;
						$next_char=$i+1;
		
						if($tmp[$current_char]<='z' && $tmp[$current_char]>='a' && $tmp[$next_char]<='Z' && $tmp[$next_char]>='A'){
							//trovato caso particolare, aggiungo lo spazio
							$before=substr($tmp,0,$current_char+1);
							$after=substr($tmp,$current_char+1);
							$tmp=$before." ".$after;
							$autore=$tmp;
							$i++;
						}	
					
					}
					$cognome_nome[$k]=$autore;						
				}
		}		
		if(count($cognome_nome)>count($nome_cognome)) $authors=$cognome_nome;
		else $authors=$nome_cognome;
					
		return $authors;
}		

function getYear($content,$paper_year){		
			/*assumendo che non possano essere citate riviste antecedenti al 1950, scarto tutti i numeri che non siano nel range 1950-anno pubblicazione documento che contiene la citazione
			in più mi è capitato che nel titolo(e/o nel doi) ci fosse un anno che non era riferito all'anno di pubblicazione del documento, qunidni in quel caso se si trovano più anni che rientrano nel range
			prestabilito prendo il più grande di tutti in quanto è la scelta più logica.
			
			(la possibilità di prendere un anno sbagliato da un titolo del tipo: cosa succederà nell'anno XXXX (data del futuro) è scartata dal fatto che prendo come upperbound
			la data di pubblicazione del documento, quindi da qui in poi si può assumere che nel titolo ci siano date minori o uguali all' anno effettivo del documento)
			per lo stesso motivo si scarta anche la possibilità che nel doi ci sia casualmente un numero di 4 cifre maggiore dell'anno del documento(nel senso che se c'è non viene preso in considerazione)
			Quindi l'anno effettivo è per forza il più grande tra tutti quelli del range)*/
			//recupero tutti i numeri di 4 cifre presenti nella stringa
			preg_match_all('/[0-9]{4}/',$content, $tmp);
			$inf=1950;
			$sup=$paper_year;
			//per riconoscere se lo scraper non ha trovato l'informazione cercata, le variabili sono inizializzate a null, ma per fare dei confronti mi è più comodo settarla a zero
			$year=0;
			foreach($tmp as $i=>$y){
				foreach($y as $j=>$ye){
					if($ye<=$sup&&$ye>=$inf){
						if($ye>$year)$year=$ye;
						break;
					}
				}
			}
			if($year==0)$year=null;//ripristino il suo valore iniziale nel caso non avessi trovato nessun numero a 4 cifre
			
			return $year;
}			

function getDoiAndURL($content){			
			//doi e url della citazione
			$url=null;$doi=null;
			preg_match('/\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i',$content, $tmp);//espressione regolare copia e incollata
			if(!empty($tmp)){
			$tmp=$tmp[0];
			$url=$tmp;
			$tmpdoi=explode("http://doi.org/",$tmp);
			if(isset($tmpdoi[1]))$doi=$tmpdoi[1];
				else {
					$tmpdoi=explode("http://dx.doi.org/",$tmp);
					if(isset($tmpdoi[1]))$doi=$tmpdoi[1];
					else $doi=null;//nel caso trovi un url che non è http://doi o http://dx.doi.org/ come al solito, posso solo tenerlo come url, senza la possibilità di ottenere anche il doi come informazione
				}
			}
			
			return array(0=>$url,1=>$doi);
}

/*funzione che toglie dall'array preso come parametro, i calori che contengono almeno un numero*/
function stripErrors($array){
	$tmp_array=array();$i=0;
	if(!empty($array)){
			foreach($array as $k=>$v){
		
				preg_match("/[0-9]/", $v, $tmp);
			
				if(empty($tmp)){
					$tmp_array[$i]=$v;
					$i++;
				}
			}
	}
	return $tmp_array;
}

?>