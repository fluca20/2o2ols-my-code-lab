// MEMORIA LOCALE – salva chat e storico
let currentChatId = Date.now().toString();
let history = JSON.parse(localStorage.getItem('ai_history') || '[]');

function saveHistory() {
    localStorage.setItem('ai_history', JSON.stringify(history));
}

function renderHistory() {
    const historyDiv = document.getElementById('historyList');
    if (!historyDiv) return;
    
    if (history.length === 0) {
        historyDiv.innerHTML = '<p style="color:#64748b;">Nessuna ricerca salvata</p>';
        return;
    }
    
    historyDiv.innerHTML = history.map((item, idx) => `
        <div class="history-item">
            <strong>📌 ${item.task.substring(0, 60)}...</strong><br>
            🏆 Top: ${item.top1}<br>
            📅 ${new Date(item.date).toLocaleString()}
        </div>
    `).join('');
}

function analyzeTask(taskText) {
    const lower = taskText.toLowerCase();
    if (lower.includes('codice') || lower.includes('programma') || lower.includes('python') || lower.includes('javascript')) return 'codice';
    if (lower.includes('sfondo') || lower.includes('immagine') || lower.includes('foto') || lower.includes('disegno') || lower.includes('dashboard') && lower.includes('foto')) return 'immagini';
    if (lower.includes('audio') || lower.includes('trascrivere') || lower.includes('registrazione')) return 'audio';
    if (lower.includes('video') || lower.includes('montaggio')) return 'video';
    if (lower.includes('dati') || lower.includes('tabella') || lower.includes('csv') || lower.includes('analisi')) return 'dati';
    if (lower.includes('testo') || lower.includes('articolo') || lower.includes('traduci') || lower.includes('riassunto')) return 'testo';
    return 'misto';
}

function getTop3AI(category, taskText) {
    if (!window.aiDatabase) {
        console.error("Database non caricato");
        return [];
    }
    let filtered = window.aiDatabase.filter(ai => ai.categoria === category);
    if (filtered.length === 0) filtered = window.aiDatabase.filter(ai => ai.categoria === 'misto');
    
    filtered.sort((a,b) => (b.gratis === true ? 1 : 0) - (a.gratis === true ? 1 : 0));
    return filtered.slice(0,3);
}

function renderTop3(aiList) {
    if (!aiList || aiList.length === 0) {
        document.getElementById('top3Table').innerHTML = '<p style="color:red;">Nessuna AI trovata per questa categoria</p>';
        return;
    }
    const tableHtml = `
        <table>
            <thead>
                <tr><th>Posizione</th><th>Nome AI</th><th>Dove</th><th>Motivo</th><th>Sicurezza</th><th>Limiti</th</tr>
            </thead>
            <tbody>
                ${aiList.map((ai, idx) => `
                    <tr>
                        <td><b>${idx+1}</b></td>
                        <td>${ai.nome}</td>
                        <td>${ai.dove}</td>
                        <td>${ai.punti_forza}</td>
                        <td>${ai.sicurezza}</td>
                        <td>${ai.limiti}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('top3Table').innerHTML = tableHtml;
}

// EVENTI UI
document.addEventListener('DOMContentLoaded', () => {
    // Verifica che il database sia caricato
    if (!window.aiDatabase) {
        console.error("ERRORE: database_ai.js non caricato. Verifica che il file esista nella stessa cartella");
        alert("ERRORE: database non trovato. Assicurati che database_ai.js sia nella stessa cartella di index.html");
        return;
    }
    
    renderHistory();
    
    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const task = document.getElementById('taskInput').value.trim();
        if (!task) {
            alert('Scrivi cosa devi fare');
            return;
        }
        const guessed = analyzeTask(task);
        document.getElementById('guessedCategory').innerText = guessed;
        document.getElementById('confirmationBox').style.display = 'block';
        document.getElementById('resultBox').style.display = 'none';
        
        window.currentTask = task;
        window.guessedCategory = guessed;
    });
    
    document.getElementById('confirmYes').addEventListener('click', () => {
        const task = window.currentTask;
        const cat = window.guessedCategory;
        const top3 = getTop3AI(cat, task);
        renderTop3(top3);
        document.getElementById('confirmationBox').style.display = 'none';
        document.getElementById('resultBox').style.display = 'block';
        
        if (top3 && top3.length > 0) {
            history.unshift({
                id: Date.now(),
                task: task,
                category: cat,
                top1: top3[0]?.nome || 'N/A',
                date: new Date().toISOString()
            });
            if (history.length > 20) history.pop();
            saveHistory();
            renderHistory();
        }
    });
    
    document.getElementById('confirmNo').addEventListener('click', () => {
        document.getElementById('manualCorrection').style.display = 'block';
    });
    
    document.getElementById('manualConfirm').addEventListener('click', () => {
        const newCat = document.getElementById('categorySelect').value;
        const task = window.currentTask;
        const top3 = getTop3AI(newCat, task);
        renderTop3(top3);
        document.getElementById('confirmationBox').style.display = 'none';
        document.getElementById('resultBox').style.display = 'block';
        
        if (top3 && top3.length > 0) {
            history.unshift({
                id: Date.now(),
                task: task,
                category: newCat,
                top1: top3[0]?.nome || 'N/A',
                date: new Date().toISOString()
            });
            if (history.length > 20) history.pop();
            saveHistory();
            renderHistory();
        }
    });
    
    document.getElementById('newChatBtn').addEventListener('click', () => {
        document.getElementById('taskInput').value = '';
        document.getElementById('resultBox').style.display = 'none';
        document.getElementById('confirmationBox').style.display = 'none';
        document.getElementById('manualCorrection').style.display = 'none';
    });
    
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Cancellare tutto lo storico?')) {
            history = [];
            saveHistory();
            renderHistory();
        }
    });
});