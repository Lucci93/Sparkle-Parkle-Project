//File scritto da Daniele
$(document).ready(function() {

    /* Codice che carica l'elemento in corso */    
	function PathLoader(el) {
		this.el = el;
		/* impostiamo la distanza totale del percorso uguale alla strokeDasharray e la stroke-Dashoffset */
		this.el.style.strokeDasharray = this.el.style.strokeDashoffset = this.el.getTotalLength();
	}

    /* Disegniamo gradualemnte il contenuto fino a che non raggiungiamo zero e il disegno è completo */
	PathLoader.prototype._draw = function(val) {
		this.el.style.strokeDashoffset = this.el.getTotalLength() * (1 - val);
	}
    /* Disegnamo il percorso impostando l'offset su un valore inferiore fino ad arrivare a zero quando il percorso è completamente disegnato */
	PathLoader.prototype.setProgress = function(val) {
		this._draw(val);
	}

    /* Ci permette di animare il caricamento del loader */
	PathLoader.prototype.setProgressFn = function(fn) {
		if(typeof fn === 'function') { 
            fn(this); 
        }
	}
    
    /* Blocco o sblocco lo scrolling */
	function noscroll() {
		window.scrollTo(0, 0);
	}
    
	var header = container.querySelector('header.head'),
		loader = new PathLoader($('#loader-circle')[0]),
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd',
                              'OAnimation' : 'oAnimationEnd', 
                              'msAnimation' : 'MSAnimationEnd', 
                              'animation' : 'animationend' 
                            },
        /* Ritorna il prefisso appropriato a seconda del browser */
		animEndEventName = animEndEventNames[ Modernizr.prefixed('animation') ];

	function init() {

		/* durante la visualizzazione dell'animazione la pagina non può scorrere */
		window.addEventListener('scroll', noscroll);
		/* inizio animazione */
		$('#container').addClass('loading');
        startLoading();
	}
    
	function startLoading() {
		/* Simula il caricamento */
		var simulationFn = function(instance) {
			var progress = 0,
				interval = setInterval( function() {
                    progress = Math.min(progress + Math.random() * 0.1, 1);
                    instance.setProgress(progress);

					/* Quando raggiunge la fine */
					if( progress === 1 ) {
						$('#container').removeClass('loading');
						$('#container').addClass('loaded');
						clearInterval( interval );

						var onEndHeaderAnimation = function(ev) {
                            if(ev.target !== header) return;
                            this.removeEventListener(animEndEventName, onEndHeaderAnimation);   
                            $(document.body).addClass('layout-switch');
							window.removeEventListener('scroll', noscroll);
						};

				        header.addEventListener(animEndEventName, onEndHeaderAnimation);
					}
				}, 80 );
		};

		loader.setProgressFn(simulationFn);
	}

	init();

});