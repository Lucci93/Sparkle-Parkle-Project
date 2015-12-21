<?php
//scritto da michele d'onza 
 require_once "include/Turtle.php";
 require_once "include/Delete.php";
//codice di salvataggio delle annotazioni modificato per ottimizzarlo
if(isset($_POST['new']) && isset($_POST['old'])){
	$old=$_POST['old'];
	$new=$_POST['new'];
	//$old='{ "annotazioni": [{"annotations":[{"type":"cites","label":"Citazione","body":{"label":"Questo articolo cita \'Questo articolo cita \'PDFX: Fully-automated PDF-to-XML Conversion of Scientific Literature\'\'","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1","predicate":"cito:cites","resource":{"id":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","label":"[1] A. Constantin, S. Pettifer, and A. Voronkov. PDFX: Fully-automated PDF-to-XML Conversion of Scientific Literature. In Proceedings of the 13th ACM symposium on Document Engineering, 2013. http://doi.org/10.1145/2494266.2494271"}}},{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è A. Constantin","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/a-constantin","label":"A. Constantin"}}},{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è S. Pettifer","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/s-pettifer","label":"S. Pettifer"}}},{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è A. Voronkov","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/a-voronkov","label":"A. Voronkov"}}},{"type":"hasComment","label":"Commento","body":{"subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"schema:comment","literal":"dhyfuf"}}],"target":{"source":"http://www.dlib.org/dlib/november14/klampfl/11klampfl.html","id":"form1_table3_tr1_td1_table5_tr1_td1_table1_tr1_td2_p73","start":"0","end":"229"},"provenance":{"author":{"name":"Sparkle Parkle","email":"sparkle.parkle@studio.unibo.it"},"time":"2015-12-21T10:11"}}]}';
	//$new='{ "annotazioni": [{"annotations":[{"type":"cites","label":"Citazione","body":{"label":"Questo articolo cita \'Questo articolo cita \'PDFX: Fully-automated PDF-to-XML Conversion of Scientific Literature\'\'","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1","predicate":"cito:cites","resource":{"id":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","label":"[1] A. Constantin, S. Pettifer, and A. Voronkov. PDFX: Fully-automated PDF-to-XML Conversion of Scientific Literature. In Proceedings of the 13th ACM symposium on Document Engineering, 2013. http://doi.org/10.1145/2494266.2494271"}}},{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è A. Constantin","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/a-constantin","label":"A. Constantin"}}},{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è S. Pettifer","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/s-pettifer","label":"S. Pettifer"}}},{"type":"hasAuthor","label":"Autore","body":{"label":"Un autore del documento è A. Voronkov","subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"dcterms:creator","resource":{"id":"http://vitali.web.cs.unibo.it/raschietto/person/a-voronkov","label":"A. Voronkov"}}},{"type":"hasComment","label":"Commento","body":{"subject":"http://www.dlib.org/dlib/november14/klampfl/11klampfl_ver1_cited1","predicate":"schema:comment","literal":"dhyfuf"}}],"target":{"source":"http://www.dlib.org/dlib/november14/klampfl/11klampfl.html","id":"form1_table3_tr1_td1_table5_tr1_td1_table1_tr1_td2_p73","start":"0","end":"229"},"provenance":{"author":{"name":"Sparkle Parkle","email":"sparkle.parkle@studio.unibo.it"},"time":"2015-12-21T10:11"}}]}';
	try{
		//cancello le annotazioni modificate o eliminate
		deleteOldTurtleFromJson($old);
		//inserisco le nuove annotazioni
		jsonToTurtle($new);
	}catch(Exception $e){
		echo("error");
	}
}
else echo("error");
