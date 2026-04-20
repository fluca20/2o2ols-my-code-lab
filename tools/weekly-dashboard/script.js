// ============================================
// DASHBOARD SETTIMANALE - VERSIONE CON SUONI
// ============================================

// ------------------------------------------------------------
// 0. SISTEMA SUONI
// ------------------------------------------------------------

// Creiamo un contesto audio per gestire i suoni
let audioContext = null;

// Inizializziamo il contesto audio al primo click (richiesto dai browser)
function initAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playSuono(tipo) {
    try {
        initAudio();
        if (!audioContext) return;
        
        // Riprendi il contesto se sospeso
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(tipo) {
            case 'aggiungi':
                // Suono ascendente per nuova attività
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
                
            case 'completato':
                // Suono gioioso per completamento
                oscillator.frequency.setValueAtTime(523.25, now); // Do
                oscillator.frequency.setValueAtTime(659.25, now + 0.1); // Mi
                oscillator.frequency.setValueAtTime(783.99, now + 0.2); // Sol
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case 'rimandato':
                // Suono discendente per rimandato
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.linearRampToValueAtTime(220, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
                
            case 'elimina':
                // Suono breve e grave per eliminazione
                oscillator.frequency.setValueAtTime(220, now);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case 'livello':
                // Fanfara per cambio livello
                oscillator.frequency.setValueAtTime(392, now); // Sol
                oscillator.frequency.setValueAtTime(493.88, now + 0.1); // Si
                oscillator.frequency.setValueAtTime(587.33, now + 0.2); // Re
                oscillator.frequency.setValueAtTime(783.99, now + 0.3); // Sol
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;
                
            case 'punti':
                // Suono per punti guadagnati
                oscillator.frequency.setValueAtTime(659.25, now); // Mi
                oscillator.frequency.setValueAtTime(783.99, now + 0.05); // Sol
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
                
            default:
                // Suono neutro
                oscillator.frequency.setValueAtTime(440, now);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
        }
    } catch (e) {
        console.log('Audio non disponibile:', e);
    }
}

// ------------------------------------------------------------
// 1. CONFIGURAZIONE INIZIALE
// ------------------------------------------------------------

const CASSETTO_ATTIVITA = 'attivitaSettimanali';
const CASSETTO_PUNTI = 'puntiUtente';
const CASSETTO_AUDIO = 'audioAbilitato';

// Carichiamo le preferenze audio
let audioAbilitato = localStorage.getItem(CASSETTO_AUDIO) !== 'false';

function toggleAudio() {
    audioAbilitato = !audioAbilitato;
    localStorage.setItem(CASSETTO_AUDIO, audioAbilitato);
    aggiornaPulsanteAudio();
    if (audioAbilitato) {
        playSuono('aggiungi'); // Suono di test
    }
}

function aggiornaPulsanteAudio() {
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
        btnAudio.innerHTML = audioAbilitato ? '🔊 Audio ON' : '🔇 Audio OFF';
        btnAudio.style.background = audioAbilitato 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
}

// Carichiamo le attività e i punti dal localStorage
let attività = [];
let puntiUtente = {
    punti: 0,
    livello: 1,
    puntiProssimoLivello: 100,
    storia: [] // Storico delle ultime azioni
};

function caricaAttività() {
    const salvate = localStorage.getItem(CASSETTO_ATTIVITA);
    if (salvate) {
        try {
            const dati = JSON.parse(salvate);
            return dati.filter(a => a && typeof a === 'object').map(a => ({
                id: a.id || generaIdUnico(),
                nome: a.nome || 'Senza nome',
                descrizione: a.descrizione || '',
                categoria: a.categoria || '',
                giorni: Array.isArray(a.giorni) ? a.giorni : ['Lunedì'],
                stato: a.stato || 'non_definito'
            }));
        } catch (e) {
            console.error('Errore nel caricamento', e);
            return [];
        }
    }
    return [];
}

function caricaPunti() {
    const salvati = localStorage.getItem(CASSETTO_PUNTI);
    if (salvati) {
        try {
            return JSON.parse(salvati);
        } catch (e) {
            console.error('Errore nel caricamento punti', e);
            return {
                punti: 0,
                livello: 1,
                puntiProssimoLivello: 100,
                storia: []
            };
        }
    }
    return {
        punti: 0,
        livello: 1,
        puntiProssimoLivello: 100,
        storia: []
    };
}

// Inizializzazione
attività = caricaAttività();
puntiUtente = caricaPunti();

function salvaAttività() {
    localStorage.setItem(CASSETTO_ATTIVITA, JSON.stringify(attività));
    console.log('💾 Attività salvate:', attività.length);
}

function salvaPunti() {
    localStorage.setItem(CASSETTO_PUNTI, JSON.stringify(puntiUtente));
    console.log('💾 Punti salvati:', puntiUtente.punti);
}

// ------------------------------------------------------------
// 2. SISTEMA PUNTI E LIVELLI
// ------------------------------------------------------------

function calcolaPuntiPerAttività(attività) {
    let puntiBase = 10;
    
    if (attività.categoria && attività.categoria.trim() !== '') {
        puntiBase += 5;
    }
    
    if (attività.descrizione && attività.descrizione.trim() !== '') {
        puntiBase += 5;
    }
    
    if (attività.giorni.length > 1) {
        puntiBase += (attività.giorni.length - 1) * 3;
    }
    
    return puntiBase;
}

function calcolaLivello(punti) {
    return 1 + Math.floor(punti / 100);
}

function calcolaPuntiProssimoLivello(punti) {
    const livelloCorrente = 1 + Math.floor(punti / 100);
    return (livelloCorrente * 100) - punti;
}

function aggiungiPunti(attivitàId, vecchioStato, nuovoStato) {
    const attivitàCorrente = attività.find(a => a.id === attivitàId);
    if (!attivitàCorrente) return;
    
    let variazionePunti = 0;
    let messaggio = '';
    let tipoSuono = 'punti';
    
    const puntiAttività = calcolaPuntiPerAttività(attivitàCorrente);
    
    if (nuovoStato === 'fatto' && vecchioStato !== 'fatto') {
        variazionePunti = puntiAttività;
        messaggio = `✅ Completato: ${attivitàCorrente.nome} (+${puntiAttività} punti)`;
        tipoSuono = 'completato';
    } else if (vecchioStato === 'fatto' && nuovoStato !== 'fatto') {
        variazionePunti = -puntiAttività;
        messaggio = `↩️ Non più completato: ${attivitàCorrente.nome} (${puntiAttività} punti)`;
    } else if (nuovoStato === 'rimandato' && vecchioStato !== 'rimandato') {
        variazionePunti = Math.floor(puntiAttività / 2);
        messaggio = `⏰ Rimandato: ${attivitàCorrente.nome} (+${variazionePunti} punti)`;
        tipoSuono = 'rimandato';
    } else if (vecchioStato === 'rimandato' && nuovoStato !== 'rimandato') {
        variazionePunti = -Math.floor(puntiAttività / 2);
        messaggio = `↩️ Non più rimandato: ${attivitàCorrente.nome} (${-variazionePunti} punti)`;
    }
    
    if (variazionePunti !== 0) {
        puntiUtente.punti = Math.max(0, puntiUtente.punti + variazionePunti);
        
        const nuovoLivello = calcolaLivello(puntiUtente.punti);
        const puntiProssimo = calcolaPuntiProssimoLivello(puntiUtente.punti);
        
        if (nuovoLivello > puntiUtente.livello) {
            messaggio += ` 🎉 LIVELLO ${nuovoLivello}!`;
            puntiUtente.storia.unshift({
                data: new Date().toLocaleString(),
                messaggio: `🎉 Sei salito al livello ${nuovoLivello}!`,
                punti: puntiUtente.punti
            });
            if (audioAbilitato) playSuono('livello');
        } else if (nuovoLivello < puntiUtente.livello) {
            puntiUtente.storia.unshift({
                data: new Date().toLocaleString(),
                messaggio: `⚠️ Sei sceso al livello ${nuovoLivello}`,
                punti: puntiUtente.punti
            });
        } else {
            if (audioAbilitato) playSuono(tipoSuono);
        }
        
        puntiUtente.livello = nuovoLivello;
        puntiUtente.puntiProssimoLivello = puntiProssimo;
        
        puntiUtente.storia.unshift({
            data: new Date().toLocaleString(),
            messaggio: messaggio,
            punti: puntiUtente.punti
        });
        
        if (puntiUtente.storia.length > 20) {
            puntiUtente.storia = puntiUtente.storia.slice(0, 20);
        }
        
        salvaPunti();
        aggiornaDisplayPunti();
    }
}

function aggiornaDisplayPunti() {
    const containerPunti = document.getElementById('container-punti');
    if (!containerPunti) return;
    
    const percentuale = ((puntiUtente.punti % 100) / 100) * 100;
    
    containerPunti.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px; margin-bottom: 30px; color: white; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 3rem;">🏆</div>
                    <div>
                        <div style="font-size: 1.2rem; opacity: 0.9;">Livello ${puntiUtente.livello}</div>
                        <div style="font-size: 2rem; font-weight: bold;">${puntiUtente.punti} punti</div>
                    </div>
                </div>
                <div style="flex: 1; max-width: 300px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9rem;">
                        <span>Liv. ${puntiUtente.livello}</span>
                        <span>${puntiUtente.puntiProssimoLivello} punti al prox livello</span>
                        <span>Liv. ${puntiUtente.livello + 1}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.3); height: 10px; border-radius: 5px; overflow: hidden;">
                        <div style="background: white; width: ${percentuale}%; height: 100%; border-radius: 5px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
            
            ${puntiUtente.storia.length > 0 ? `
            <div style="margin-top: 20px; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="font-weight: bold;">📜 Ultime attività</span>
                </div>
                <div style="max-height: 100px; overflow-y: auto; padding-right: 10px;">
                    ${puntiUtente.storia.slice(0, 5).map(s => `
                        <div style="font-size: 0.9rem; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            ${s.messaggio}
                            <span style="opacity: 0.7; font-size: 0.8rem; margin-left: 10px;">${s.data}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

function resetPunti() {
    if (confirm('⚠️ Sei sicuro di voler resettare i punti? Questa operazione è irreversibile!')) {
        puntiUtente = {
            punti: 0,
            livello: 1,
            puntiProssimoLivello: 100,
            storia: [{
                data: new Date().toLocaleString(),
                messaggio: '🔄 Punti resettati',
                punti: 0
            }]
        };
        salvaPunti();
        aggiornaDisplayPunti();
        if (audioAbilitato) playSuono('elimina');
    }
}

// ------------------------------------------------------------
// 3. RIFERIMENTI ALLA PAGINA
// ------------------------------------------------------------

const campoNome = document.getElementById('nomeInput');
const campoDescrizione = document.getElementById('descrizioneInput');
const campoCategoria = document.getElementById('categoriaInput');
const campoGiorni = document.getElementById('giorniSelect');
const pulsanteAggiungi = document.getElementById('aggiungiBtn');
const contenitoreAttivita = document.getElementById('contenitoreAttivita');

// Stato per la modifica e selezione multipla
let attivitàInModifica = null;
let attivitàSelezionate = new Set();

// ------------------------------------------------------------
// 4. FUNZIONI DI UTILITÀ
// ------------------------------------------------------------

function generaIdUnico() {
    return 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getGiorniSelezionati() {
    const selezionati = [];
    for (let option of campoGiorni.options) {
        if (option.selected) {
            selezionati.push(option.value.replace('📆 ', ''));
        }
    }
    return selezionati.length > 0 ? selezionati : ['Lunedì'];
}

function resetForm() {
    campoNome.value = '';
    campoDescrizione.value = '';
    campoCategoria.value = '';
    for (let option of campoGiorni.options) {
        option.selected = false;
    }
    for (let option of campoGiorni.options) {
        if (option.value === 'Lunedì' || option.value === '📆 Lunedì') {
            option.selected = true;
            break;
        }
    }
    attivitàInModifica = null;
    pulsanteAggiungi.textContent = '➕ Aggiungi Attività';
    pulsanteAggiungi.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    campoNome.focus();
}

// ------------------------------------------------------------
// 5. FUNZIONI PER I COLORI E GLI STILI
// ------------------------------------------------------------

function getColoreStato(stato) {
    switch(stato) {
        case 'fatto': return '#10b981';
        case 'rimandato': return '#f59e0b';
        case 'da_fare': return '#ef4444';
        default: return '#6b7280';
    }
}

function getIconaStato(stato) {
    switch(stato) {
        case 'fatto': return '✓';
        case 'rimandato': return '⏰';
        case 'da_fare': return '○';
        default: return '◌';
    }
}

function getTestoStato(stato) {
    switch(stato) {
        case 'fatto': return 'Fatto';
        case 'rimandato': return 'Rimandato';
        case 'da_fare': return 'Da fare';
        default: return 'Non definito';
    }
}

function getProssimoStato(stato) {
    const ciclo = {
        'non_definito': 'da_fare',
        'da_fare': 'rimandato',
        'rimandato': 'fatto',
        'fatto': 'non_definito'
    };
    return ciclo[stato] || 'non_definito';
}

function generaBagliore(categoria, stato = 'non_definito') {
    if (!categoria || categoria.trim() === '') {
        return stato === 'non_definito' 
            ? '0 0 25px rgba(107, 114, 128, 0.5)'
            : '0 0 15px rgba(107, 114, 128, 0.2)';
    }
    
    let hash = 0;
    for (let i = 0; i < categoria.length; i++) {
        hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    
    if (stato === 'non_definito') {
        return `0 0 30px hsla(${hue}, 85%, 65%, 0.7)`;
    } else {
        return `0 0 15px hsla(${hue}, 70%, 60%, 0.3)`;
    }
}

// ------------------------------------------------------------
// 6. FUNZIONE PER ORDINARE LE ATTIVITÀ
// ------------------------------------------------------------

function ordinaAttività(attivitàDaOrdinare) {
    const ordineStati = {
        'non_definito': 0,
        'da_fare': 1,
        'rimandato': 2,
        'fatto': 3
    };
    
    const ordineGiorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    
    return [...attivitàDaOrdinare].sort((a, b) => {
        if (ordineStati[a.stato] !== ordineStati[b.stato]) {
            return ordineStati[a.stato] - ordineStati[b.stato];
        }
        
        const giornoA = a.giorni && a.giorni.length > 0 ? ordineGiorni.indexOf(a.giorni[0]) : 0;
        const giornoB = b.giorni && b.giorni.length > 0 ? ordineGiorni.indexOf(b.giorni[0]) : 0;
        return giornoA - giornoB;
    });
}

// ------------------------------------------------------------
// 7. FUNZIONI PER LA SELEZIONE MULTIPLA
// ------------------------------------------------------------

function toggleSelezione(id) {
    if (attivitàSelezionate.has(id)) {
        attivitàSelezionate.delete(id);
    } else {
        attivitàSelezionate.add(id);
    }
    aggiornaBarraSelezione();
    disegnaAttività();
}

function selezionaTutte() {
    attività.forEach(a => attivitàSelezionate.add(a.id));
    aggiornaBarraSelezione();
    disegnaAttività();
}

function deselezionaTutte() {
    attivitàSelezionate.clear();
    aggiornaBarraSelezione();
    disegnaAttività();
}

function eliminaSelezionate() {
    if (attivitàSelezionate.size === 0) {
        alert('Nessuna attività selezionata');
        return;
    }
    
    const conferma = confirm(`Sei sicuro di voler eliminare ${attivitàSelezionate.size} attività?`);
    if (conferma) {
        attivitàSelezionate.forEach(id => {
            const att = attività.find(a => a.id === id);
            if (att && att.stato === 'fatto') {
                const punti = calcolaPuntiPerAttività(att);
                puntiUtente.punti = Math.max(0, puntiUtente.punti - punti);
            }
        });
        
        attività = attività.filter(a => !attivitàSelezionate.has(a.id));
        attivitàSelezionate.clear();
        
        puntiUtente.livello = calcolaLivello(puntiUtente.punti);
        puntiUtente.puntiProssimoLivello = calcolaPuntiProssimoLivello(puntiUtente.punti);
        
        salvaAttività();
        salvaPunti();
        aggiornaDisplayPunti();
        disegnaAttività();
        aggiornaBarraSelezione();
        
        if (audioAbilitato) playSuono('elimina');
    }
}

function cambiaStatoSelezionate(nuovoStato) {
    if (attivitàSelezionate.size === 0) {
        alert('Nessuna attività selezionata');
        return;
    }
    
    attività.forEach(a => {
        if (attivitàSelezionate.has(a.id)) {
            const vecchioStato = a.stato;
            a.stato = nuovoStato;
            aggiungiPunti(a.id, vecchioStato, nuovoStato);
        }
    });
    
    salvaAttività();
    disegnaAttività();
}

function aggiornaBarraSelezione() {
    const barra = document.getElementById('barra-selezione');
    const contatore = document.getElementById('contatore-selezione');
    const btnEliminaSelezionate = document.getElementById('btn-elimina-selezionate');
    const btnStatoSelezionate = document.getElementById('btn-stato-selezionate');
    
    if (!barra) return;
    
    if (attivitàSelezionate.size > 0) {
        barra.style.display = 'flex';
        contatore.textContent = `${attivitàSelezionate.size} attività selezionate`;
        btnEliminaSelezionate.disabled = false;
        btnStatoSelezionate.disabled = false;
    } else {
        barra.style.display = 'none';
    }
}

// ------------------------------------------------------------
// 8. FUNZIONE PRINCIPALE PER DISEGNARE LE ATTIVITÀ
// ------------------------------------------------------------

function disegnaAttività() {
    console.log('🎨 Disegno attività...', attività);
    contenitoreAttivita.innerHTML = '';
    
    if (!attività || attività.length === 0) {
        contenitoreAttivita.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
                <h3 style="color: #2d3748; margin-bottom: 10px;">Nessuna attività</h3>
                <p style="color: #718096;">Aggiungi la tua prima attività per iniziare!</p>
            </div>
        `;
        return;
    }
    
    const attivitàOrdinate = ordinaAttività(attività);
    
    attivitàOrdinate.forEach(attivitàCorrente => {
        const att = {
            id: attivitàCorrente.id || generaIdUnico(),
            nome: attivitàCorrente.nome || 'Senza nome',
            descrizione: attivitàCorrente.descrizione || '',
            categoria: attivitàCorrente.categoria || '',
            giorni: Array.isArray(attivitàCorrente.giorni) ? attivitàCorrente.giorni : ['Lunedì'],
            stato: attivitàCorrente.stato || 'non_definito'
        };
        
        const elemento = document.createElement('div');
        elemento.className = 'attivita-card';
        elemento.dataset.id = att.id;
        
        const isSelezionata = attivitàSelezionate.has(att.id);
        const coloreStato = getColoreStato(att.stato);
        const iconaStato = getIconaStato(att.stato);
        const testoStato = getTestoStato(att.stato);
        const bagliore = generaBagliore(att.categoria, att.stato);
        
        const puntiAttività = calcolaPuntiPerAttività(att);
        
        const dettagli = [];
        if (att.descrizione && att.descrizione.trim()) {
            dettagli.push(`<span>📝 ${att.descrizione}</span>`);
        }
        if (att.categoria && att.categoria.trim()) {
            dettagli.push(`<span>🏷️ ${att.categoria}</span>`);
        }
        dettagli.push(`<span>📅 ${att.giorni.join(', ')}</span>`);
        dettagli.push(`<span>⭐ ${puntiAttività} punti</span>`);
        
        elemento.innerHTML = `
            <div class="attivita-content ${isSelezionata ? 'selezionata' : ''}" style="box-shadow: ${bagliore}; border: ${isSelezionata ? '2px solid #667eea' : '1px solid rgba(0,0,0,0.05)'};">
                <div class="attivita-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" class="checkbox-attivita" data-id="${att.id}" ${isSelezionata ? 'checked' : ''}>
                        <div class="attivita-nome" style="color: ${coloreStato};">${att.nome}</div>
                    </div>
                    <div class="attivita-stato-badge" style="background: ${coloreStato}20; color: ${coloreStato};">
                        ${iconaStato} ${testoStato}
                    </div>
                </div>
                <div class="attivita-dettagli">
                    ${dettagli.join(' · ')}
                </div>
                <div class="attivita-azioni">
                    <button class="btn-azione btn-stato" data-id="${att.id}" data-stato="${att.stato}" style="background: ${coloreStato}20; color: ${coloreStato};">
                        ${iconaStato} Cambia stato
                    </button>
                    <button class="btn-azione btn-modifica" data-id="${att.id}">
                        ✏️ Modifica
                    </button>
                    <button class="btn-azione btn-elimina" data-id="${att.id}">
                        🗑️ Elimina
                    </button>
                </div>
            </div>
        `;
        
        const checkbox = elemento.querySelector('.checkbox-attivita');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            toggleSelezione(att.id);
        });
        
        elemento.addEventListener('mouseenter', () => {
            const content = elemento.querySelector('.attivita-content');
            const baglioreHover = generaBagliore(att.categoria, att.stato).replace('30px', '40px').replace('15px', '25px');
            content.style.boxShadow = baglioreHover;
        });
        
        elemento.addEventListener('mouseleave', () => {
            const content = elemento.querySelector('.attivita-content');
            content.style.boxShadow = bagliore;
        });
        
        contenitoreAttivita.appendChild(elemento);
    });
}

// ------------------------------------------------------------
// 9. FUNZIONI PER LE OPERAZIONI CRUD
// ------------------------------------------------------------

function aggiungiOModificaAttività() {
    console.log('➕ Aggiunta/modifica attività...');
    
    const nome = campoNome.value.trim();
    const descrizione = campoDescrizione.value.trim();
    const categoria = campoCategoria.value.trim();
    const giorni = getGiorniSelezionati();
    
    if (!nome) {
        alert('❌ Inserisci almeno il nome dell\'attività');
        campoNome.focus();
        return;
    }
    
    if (attivitàInModifica) {
        console.log('✏️ Modifica attività:', attivitàInModifica.id);
        const indice = attività.findIndex(a => a.id === attivitàInModifica.id);
        if (indice !== -1) {
            attività[indice] = {
                ...attività[indice],
                nome,
                descrizione,
                categoria,
                giorni
            };
        }
        if (audioAbilitato) playSuono('punti');
    } else {
        console.log('🆕 Nuova attività');
        const nuovaAttività = {
            id: generaIdUnico(),
            nome,
            descrizione,
            categoria,
            giorni,
            stato: 'non_definito'
        };
        attività.unshift(nuovaAttività);
        if (audioAbilitato) playSuono('aggiungi');
    }
    
    salvaAttività();
    disegnaAttività();
    resetForm();
}

function cambiaStato(idAttività) {
    console.log('🔄 Cambio stato:', idAttività);
    const indice = attività.findIndex(a => a.id === idAttività);
    if (indice !== -1) {
        const vecchioStato = attività[indice].stato;
        const nuovoStato = getProssimoStato(vecchioStato);
        attività[indice].stato = nuovoStato;
        
        aggiungiPunti(idAttività, vecchioStato, nuovoStato);
        
        salvaAttività();
        disegnaAttività();
    }
}

function modificaAttività(idAttività) {
    console.log('✏️ Modifica:', idAttività);
    const attivitàDaModificare = attività.find(a => a.id === idAttività);
    if (attivitàDaModificare) {
        campoNome.value = attivitàDaModificare.nome;
        campoDescrizione.value = attivitàDaModificare.descrizione || '';
        campoCategoria.value = attivitàDaModificare.categoria || '';
        
        for (let option of campoGiorni.options) {
            const valoreOption = option.value.replace('📆 ', '');
            option.selected = attivitàDaModificare.giorni.includes(valoreOption) || 
                             attivitàDaModificare.giorni.includes(option.value);
        }
        
        attivitàInModifica = attivitàDaModificare;
        pulsanteAggiungi.textContent = '✏️ Modifica Attività';
        pulsanteAggiungi.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        
        campoNome.scrollIntoView({ behavior: 'smooth' });
        campoNome.focus();
    }
}

function eliminaAttività(idAttività) {
    console.log('🗑️ Elimina:', idAttività);
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
        const att = attività.find(a => a.id === idAttività);
        if (att && att.stato === 'fatto') {
            const punti = calcolaPuntiPerAttività(att);
            puntiUtente.punti = Math.max(0, puntiUtente.punti - punti);
            puntiUtente.livello = calcolaLivello(puntiUtente.punti);
            puntiUtente.puntiProssimoLivello = calcolaPuntiProssimoLivello(puntiUtente.punti);
            salvaPunti();
            aggiornaDisplayPunti();
        }
        
        attività = attività.filter(a => a.id !== idAttività);
        attivitàSelezionate.delete(idAttività);
        salvaAttività();
        disegnaAttività();
        aggiornaBarraSelezione();
        
        if (audioAbilitato) playSuono('elimina');
        
        if (attivitàInModifica && attivitàInModifica.id === idAttività) {
            resetForm();
        }
    }
}

// ------------------------------------------------------------
// 10. FUNZIONI SETTIMANALI
// ------------------------------------------------------------

function nuovaSettimana() {
    console.log('🔄 Nuova settimana');
    if (confirm('Vuoi resettare tutte le attività allo stato "non definito" per la nuova settimana?')) {
        attività.forEach(a => {
            if (a.stato === 'fatto') {
                const punti = calcolaPuntiPerAttività(a);
                puntiUtente.punti = Math.max(0, puntiUtente.punti - punti);
            }
            a.stato = 'non_definito';
        });
        
        puntiUtente.livello = calcolaLivello(puntiUtente.punti);
        puntiUtente.puntiProssimoLivello = calcolaPuntiProssimoLivello(puntiUtente.punti);
        
        salvaAttività();
        salvaPunti();
        aggiornaDisplayPunti();
        disegnaAttività();
        
        if (audioAbilitato) playSuono('rimandato');
    }
}

function chiudiSettimana() {
    console.log('🔒 Chiusura settimana');
    if (confirm('Vuoi archiviare le attività completate? Le attività "Fatto" verranno rimosse, le altre rimarranno.')) {
        attività = attività.filter(a => a.stato !== 'fatto');
        salvaAttività();
        disegnaAttività();
        if (audioAbilitato) playSuono('elimina');
    }
}

function eliminaTutteAttività() {
    console.log('🗑️ Elimina tutte le attività');
    if (confirm('⚠️ Sei sicuro di voler eliminare TUTTE le attività? Questa operazione è irreversibile!')) {
        attività = [];
        attivitàSelezionate.clear();
        salvaAttività();
        disegnaAttività();
        aggiornaBarraSelezione();
        if (audioAbilitato) playSuono('elimina');
    }
}

function esportaHTML() {
    console.log('💾 Esportazione HTML...');
    
    if (!attività || attività.length === 0) {
        alert('Nessuna attività da esportare');
        return;
    }
    
    const data = new Date().toLocaleDateString('it-IT');
    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Backup Settimanale</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            padding: 30px; 
            margin: 0; 
            min-height: 100vh;
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 24px; 
            padding: 30px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #1a202c; 
            border-bottom: 4px solid #667eea; 
            padding-bottom: 15px; 
            margin-top: 0;
            font-size: 2em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .stats {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 16px;
            margin: 20px 0;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 15px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        .attivita-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
        }
        .attivita-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 15px rgba(0,0,0,0.05);
        }
        .attivita-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .attivita-nome {
            font-size: 1.3rem;
            font-weight: 600;
        }
        .badge-stato {
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .attivita-dettagli {
            color: #4a5568;
            font-size: 1rem;
            margin: 10px 0;
            padding: 10px 0;
            border-top: 1px dashed #e2e8f0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .giorni-tag {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        .giorno-tag {
            background: #f7fafc;
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 0.85rem;
            color: #4a5568;
            border: 1px solid #e2e8f0;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #718096;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Backup Settimanale - ${data}</h1>`;
    
    const totale = attività.length;
    const nonDefiniti = attività.filter(a => a.stato === 'non_definito').length;
    const daFare = attività.filter(a => a.stato === 'da_fare').length;
    const rimandati = attività.filter(a => a.stato === 'rimandato').length;
    const fatti = attività.filter(a => a.stato === 'fatto').length;
    
    html += `
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">${totale}</div>
                <div class="stat-label">Totale attività</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" style="color: #6b7280">${nonDefiniti}</div>
                <div class="stat-label">Non definiti</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" style="color: #ef4444">${daFare}</div>
                <div class="stat-label">Da fare</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" style="color: #f59e0b">${rimandati}</div>
                <div class="stat-label">Rimandati</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" style="color: #10b981">${fatti}</div>
                <div class="stat-label">Fatti</div>
            </div>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 2rem;">🏆</span>
                <div>
                    <div style="font-weight: bold; font-size: 1.2rem;">Livello ${puntiUtente.livello}</div>
                    <div style="color: #4a5568;">${puntiUtente.punti} punti totali</div>
                </div>
            </div>
            <div style="background: white; padding: 10px 20px; border-radius: 50px; border: 1px solid #e2e8f0;">
                ⭐ Punti attività: ${attività.reduce((sum, a) => sum + calcolaPuntiPerAttività(a), 0)}
            </div>
        </div>
        
        <h2 style="color: #2d3748; margin-bottom: 20px;">📋 Elenco completo attività</h2>`;
    
    attività.forEach(a => {
        const coloreStato = getColoreStato(a.stato);
        const iconaStato = getIconaStato(a.stato);
        const testoStato = getTestoStato(a.stato);
        const puntiAtt = calcolaPuntiPerAttività(a);
        
        html += `
            <div class="attivita-card">
                <div class="attivita-header">
                    <span class="attivita-nome" style="color: ${coloreStato};">${a.nome}</span>
                    <span class="badge-stato" style="background: ${coloreStato}20; color: ${coloreStato};">${iconaStato} ${testoStato} ⭐ ${puntiAtt}</span>
                </div>`;
        
        if (a.descrizione || a.categoria) {
            html += `<div class="attivita-dettagli">`;
            if (a.descrizione) html += `📝 ${a.descrizione} `;
            if (a.categoria) html += `🏷️ ${a.categoria}`;
            html += `</div>`;
        }
        
        html += `
                <div class="giorni-tag">
                    ${a.giorni.map(g => `<span class="giorno-tag">📅 ${g}</span>`).join('')}
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="footer">
            Generato automaticamente dalla Dashboard Settimanale<br>
            <span style="font-size: 0.8em;">✨ Totale: ${totale} attività · 🏆 Livello ${puntiUtente.livello} · ⭐ ${puntiUtente.punti} punti</span>
        </div>
    </div>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_settimana_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup HTML creato e scaricato!');
}

// ------------------------------------------------------------
// 11. GESTIONE EVENTI
// ------------------------------------------------------------

pulsanteAggiungi.addEventListener('click', aggiungiOModificaAttività);

campoNome.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        aggiungiOModificaAttività();
    }
});

contenitoreAttivita.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const id = btn.dataset.id;
    if (!id) return;
    
    if (btn.classList.contains('btn-stato')) {
        cambiaStato(id);
    } else if (btn.classList.contains('btn-modifica')) {
        modificaAttività(id);
    } else if (btn.classList.contains('btn-elimina')) {
        eliminaAttività(id);
    }
});

// ------------------------------------------------------------
// 12. BARRA DI SELEZIONE MULTIPLA
// ------------------------------------------------------------

function creaBarraSelezione() {
    if (document.getElementById('barra-selezione')) return;
    
    const barra = document.createElement('div');
    barra.id = 'barra-selezione';
    barra.style.cssText = `
        display: none;
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 1000;
        align-items: center;
        gap: 20px;
        border: 2px solid #667eea;
        backdrop-filter: blur(10px);
    `;
    
    barra.innerHTML = `
        <span id="contatore-selezione" style="font-weight: 600; color: #2d3748;">0 attività selezionate</span>
        <div style="display: flex; gap: 10px;">
            <select id="stato-selezionate" style="padding: 8px 15px; border-radius: 25px; border: 1px solid #e2e8f0; background: white;">
                <option value="non_definito">◌ Non definito</option>
                <option value="da_fare">○ Da fare</option>
                <option value="rimandato">⏰ Rimandato</option>
                <option value="fatto">✓ Fatto</option>
            </select>
            <button id="btn-stato-selezionate" style="padding: 8px 20px; background: #667eea; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 500;">
                Applica stato
            </button>
            <button id="btn-elimina-selezionate" style="padding: 8px 20px; background: #ef4444; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 500;">
                Elimina selezionate
            </button>
            <button id="btn-deseleziona-tutte" style="padding: 8px 20px; background: #6b7280; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 500;">
                Deseleziona
            </button>
        </div>
    `;
    
    document.body.appendChild(barra);
    
    document.getElementById('btn-stato-selezionate').addEventListener('click', () => {
        const nuovoStato = document.getElementById('stato-selezionate').value;
        cambiaStatoSelezionate(nuovoStato);
    });
    
    document.getElementById('btn-elimina-selezionate').addEventListener('click', eliminaSelezionate);
    
    document.getElementById('btn-deseleziona-tutte').addEventListener('click', deselezionaTutte);
}

// ------------------------------------------------------------
// 13. PULSANTI DI CONTROLLO
// ------------------------------------------------------------

function creaPulsantiControllo() {
    if (document.getElementById('pulsanti-container')) return;
    
    const container = document.createElement('div');
    container.id = 'pulsanti-container';
    container.style.cssText = `
        display: flex;
        gap: 15px;
        margin: 30px 0 20px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    const btnSelezionaTutte = document.createElement('button');
    btnSelezionaTutte.innerHTML = '✅ Seleziona tutte';
    btnSelezionaTutte.style.cssText = `
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnSelezionaTutte.addEventListener('mouseenter', () => {
        btnSelezionaTutte.style.transform = 'translateY(-2px)';
        btnSelezionaTutte.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    });
    btnSelezionaTutte.addEventListener('mouseleave', () => {
        btnSelezionaTutte.style.transform = 'translateY(0)';
        btnSelezionaTutte.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    btnSelezionaTutte.addEventListener('click', selezionaTutte);
    
    const btnReset = document.createElement('button');
    btnReset.innerHTML = '🔄 Nuova Settimana';
    btnReset.style.cssText = `
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnReset.addEventListener('mouseenter', () => {
        btnReset.style.transform = 'translateY(-2px)';
        btnReset.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
    });
    btnReset.addEventListener('mouseleave', () => {
        btnReset.style.transform = 'translateY(0)';
        btnReset.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    btnReset.addEventListener('click', nuovaSettimana);
    
    const btnChiudi = document.createElement('button');
    btnChiudi.innerHTML = '🔒 Chiudi Settimana';
    btnChiudi.style.cssText = `
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnChiudi.addEventListener('mouseenter', () => {
        btnChiudi.style.transform = 'translateY(-2px)';
        btnChiudi.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
    });
    btnChiudi.addEventListener('mouseleave', () => {
        btnChiudi.style.transform = 'translateY(0)';
        btnChiudi.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    btnChiudi.addEventListener('click', chiudiSettimana);
    
    const btnEliminaTutte = document.createElement('button');
    btnEliminaTutte.innerHTML = '🗑️ Elimina tutte';
    btnEliminaTutte.style.cssText = `
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnEliminaTutte.addEventListener('mouseenter', () => {
        btnEliminaTutte.style.transform = 'translateY(-2px)';
        btnEliminaTutte.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.4)';
    });
    btnEliminaTutte.addEventListener('mouseleave', () => {
        btnEliminaTutte.style.transform = 'translateY(0)';
        btnEliminaTutte.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    btnEliminaTutte.addEventListener('click', eliminaTutteAttività);
    
    const btnBackup = document.createElement('button');
    btnBackup.innerHTML = '💾 Salva HTML';
    btnBackup.style.cssText = `
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnBackup.addEventListener('mouseenter', () => {
        btnBackup.style.transform = 'translateY(-2px)';
        btnBackup.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
    });
    btnBackup.addEventListener('mouseleave', () => {
        btnBackup.style.transform = 'translateY(0)';
        btnBackup.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    btnBackup.addEventListener('click', esportaHTML);
    
    const btnResetPunti = document.createElement('button');
    btnResetPunti.innerHTML = '🏆 Reset Punti';
    btnResetPunti.style.cssText = `
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnResetPunti.addEventListener('mouseenter', () => {
        btnResetPunti.style.transform = 'translateY(-2px)';
        btnResetPunti.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
    });
    btnResetPunti.addEventListener('mouseleave', () => {
        btnResetPunti.style.transform = 'translateY(0)';
        btnResetPunti.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    btnResetPunti.addEventListener('click', resetPunti);
    
    // Pulsante Audio
    const btnAudio = document.createElement('button');
    btnAudio.id = 'btn-audio';
    btnAudio.innerHTML = audioAbilitato ? '🔊 Audio ON' : '🔇 Audio OFF';
    btnAudio.style.cssText = `
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        background: ${audioAbilitato ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'};
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnAudio.addEventListener('mouseenter', () => {
        btnAudio.style.transform = 'translateY(-2px)';
        btnAudio.style.boxShadow = `0 6px 20px ${audioAbilitato ? 'rgba(16, 185, 129, 0.4)' : 'rgba(107, 114, 128, 0.4)'}`;
    });
    btnAudio.addEventListener('mouseleave', () => {
        btnAudio.style.transform = 'translateY(0)';
        btnAudio.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    btnAudio.addEventListener('click', toggleAudio);
    
    container.appendChild(btnSelezionaTutte);
    container.appendChild(btnReset);
    container.appendChild(btnChiudi);
    container.appendChild(btnEliminaTutte);
    container.appendChild(btnBackup);
    container.appendChild(btnResetPunti);
    container.appendChild(btnAudio);
    
    contenitoreAttivita.parentNode.insertBefore(container, contenitoreAttivita);
}

// ------------------------------------------------------------
// 14. AGGIUNGI STILI CSS DINAMICI
// ------------------------------------------------------------

function aggiungiStiliCSS() {
    if (document.getElementById('stili-dashboard')) return;
    
    const style = document.createElement('style');
    style.id = 'stili-dashboard';
    style.textContent = `
        .attivita-card {
            margin-bottom: 20px;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .attivita-content {
            background: white;
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .attivita-content.selezionata {
            background: linear-gradient(135deg, #667eea10, #764ba210);
        }
        
        .attivita-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .attivita-nome {
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .attivita-stato-badge {
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        
        .attivita-dettagli {
            color: #64748b;
            font-size: 0.95rem;
            margin-bottom: 15px;
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
            line-height: 1.6;
        }
        
        .attivita-azioni {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .btn-azione {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #f1f5f9;
            color: #334155;
        }
        
        .btn-azione:hover {
            transform: translateY(-2px);
            filter: brightness(0.95);
        }
        
        .btn-modifica {
            background: #f1f5f9;
            color: #3b82f6;
        }
        
        .btn-elimina {
            background: #fef2f2;
            color: #ef4444;
        }
        
        .btn-modifica:hover {
            background: #3b82f6;
            color: white;
        }
        
        .btn-elimina:hover {
            background: #ef4444;
            color: white;
        }
        
        .checkbox-attivita {
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #667eea;
        }
        
        #giorniSelect[multiple] {
            min-height: 140px;
            padding: 10px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: white;
            font-size: 14px;
            width: 100%;
        }
        
        #giorniSelect[multiple] option {
            padding: 10px 15px;
            margin: 2px 0;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        #giorniSelect[multiple] option:checked {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        #giorniSelect[multiple] option:hover {
            background: #f1f5f9;
        }
        
        .messaggio-aiuto {
            display: block;
            margin-top: 8px;
            font-size: 0.85rem;
            color: #64748b;
            background: #f8fafc;
            padding: 8px 12px;
            border-radius: 8px;
            border-left: 3px solid #667eea;
        }
        
        #container-punti {
            margin-bottom: 30px;
        }
    `;
    document.head.appendChild(style);
}

// ------------------------------------------------------------
// 15. CREA CONTAINER PUNTI
// ------------------------------------------------------------

function creaContainerPunti() {
    if (document.getElementById('container-punti')) return;
    
    const container = document.createElement('div');
    container.id = 'container-punti';
    contenitoreAttivita.parentNode.insertBefore(container, contenitoreAttivita);
}

// ------------------------------------------------------------
// 16. INIZIALIZZAZIONE
// ------------------------------------------------------------

function init() {
    console.log('🚀 Inizializzazione dashboard...');
    aggiungiStiliCSS();
    creaContainerPunti();
    creaBarraSelezione();
    creaPulsantiControllo();
    resetForm();
    aggiornaDisplayPunti();
    disegnaAttività();
    console.log('✅ Dashboard pronta!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}