# Claude Code Configuration

Questa directory contiene la configurazione di [Claude Code](https://claude.ai/claude-code) per il progetto Gestionale.

## 📋 Cosa contiene

### `settings.json`
Configurazione condivisa con tutti i collaboratori. Include:
- **Permissions**: Comandi pre-approvati per operazioni comuni (Docker, Git, npm, etc.)
- Questi permessi accelerano il workflow evitando di dover approvare manualmente ogni comando

### `commands/`
Directory con slash commands personalizzati per il progetto:

#### `/dev-setup`
Setup completo dell'ambiente di sviluppo:
- Verifica Docker e Docker Compose
- Avvia tutti i servizi
- Mostra endpoint disponibili

#### `/check-services`
Controlla lo stato di tutti i servizi:
- Container Docker attivi
- Log recenti
- Statistiche risorse

#### `/add-feature`
Guida passo-passo per aggiungere nuove feature:
- Workflow backend → frontend → documentazione
- Best practices del progetto
- Template per commit

#### `/debug-issue`
Processo sistematico per debug:
- Raccolta informazioni
- Verifica servizi
- Debug backend/frontend/WebSocket
- Documentazione soluzione

#### `/db-migrate`
Gestione migrazioni database:
- Modifica schema
- Ricreare database in sviluppo
- Verifica e commit

## 🚀 Come usare

### Primo Setup

1. **Installa Claude Code** seguendo le istruzioni su [claude.com/claude-code](https://claude.com/claude-code)

2. **Apri il progetto** con Claude Code:
   ```bash
   cd /path/to/Gestionale
   claude-code .
   ```

3. **I settings verranno applicati automaticamente** dal file `settings.json`

### Usare gli Slash Commands

Nella conversazione con Claude Code, puoi usare i comandi con `/`:

```
/dev-setup
```

Claude Code eseguirà automaticamente il workflow definito nel comando.

### Personalizzazione

Se vuoi personalizzare le tue impostazioni locali (non committate):

1. Crea `settings.local.json` in questa directory
2. Le tue impostazioni locali avranno priorità su `settings.json`
3. Il file `.local.json` è ignorato da git

Esempio di `settings.local.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)"
    ]
  }
}
```

## 📚 Documentazione

Per documentazione completa su Claude Code:
- [Documentazione ufficiale](https://docs.claude.com/claude-code)
- [Configurazione avanzata](https://docs.claude.com/claude-code/configuration)
- [Slash commands](https://docs.claude.com/claude-code/slash-commands)

## 🛠️ Creare nuovi comandi

Per aggiungere un nuovo comando:

1. Crea un file `.md` in `commands/`:
   ```bash
   touch .claude/commands/nuovo-comando.md
   ```

2. Aggiungi frontmatter e istruzioni:
   ```markdown
   ---
   description: Breve descrizione del comando
   ---

   Istruzioni dettagliate per Claude Code su cosa fare...
   ```

3. Usa il comando con `/nuovo-comando`

## 🤝 Contribuire

I comandi utili per tutti i collaboratori dovrebbero essere:
- **Committati** in questa directory
- **Documentati** con descrizione chiara
- **Testati** prima del commit

Le configurazioni personali vanno in file `.local.json` (non committati).

## ⚙️ Permissions

I permessi pre-approvati in `settings.json` includono:

- **Docker**: Gestione container (up, down, logs, exec, stats)
- **Git**: Operazioni comuni (add, commit, push)
- **NPM**: Build e installazione dipendenze
- **Python**: Esecuzione script backend
- **Pip**: Installazione pacchetti Python

Se hai bisogno di permessi aggiuntivi, puoi:
1. Aggiungerli al tuo `settings.local.json` personale
2. Proporre l'aggiunta a `settings.json` condiviso se utile a tutti

## 📞 Supporto

Per problemi con Claude Code:
- Consulta la [documentazione ufficiale](https://docs.claude.com/claude-code)
- Apri una issue su GitHub se il problema è specifico del progetto

---

**Buon coding con Claude Code!** 🤖
