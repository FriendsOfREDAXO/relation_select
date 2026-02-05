# Changelog

## Version 1.2.0 (2026-02-05)

### 🔒 Security
- **XSS-Schutz**: Labels und Values werden jetzt korrekt escaped in JavaScript
- **Type Safety**: Strikte Typ-Prüfungen für alle API-Parameter implementiert
- **SQL-Injection**: Verbesserte Parameter-Validierung und Prepared Statements
- **Input-Validierung**: Strikte Validierung aller GET-Parameter

### ✅ Code Quality
- **Rexstan**: Alle 12 Rexstan-Fehler behoben ✅
  - Type-Hints für alle Methoden hinzugefügt
  - `empty()` durch strikte Vergleiche ersetzt (`count($array) > 0`)
  - Boolean-Operationen mit expliziten Checks korrigiert
  - Strikte `in_array()` Vergleiche mit `true` Parameter
  - Unreachable Code entfernt
- **REDAXO Standards**: 
  - `rex_response::sendJson()` statt manueller Header
  - `rex_response::cleanOutputBuffers()` am Anfang der API-Methode
  - Korrekte Return-Types für rex_api_function
- **PSR-12**: Code-Style vollständig angepasst
  - Yoda-Notation für Vergleiche (`'' === $value`)
  - Konsistente String-Quotes
  - Optimierte Imports mit `use function`
  - Trailing Commas in Arrays

### 🎨 UI/UX & Theme Support
- **Dark Theme Support**:
  - Vollständige Unterstützung für `rex-theme-dark` ✨
  - Auto-Modus via `prefers-color-scheme: dark` ✨
  - REDAXO-konforme Farbvariablen aus `_variables-dark.scss`
  - CSS Custom Properties mit Fallbacks
- **CSS-Verbesserungen**:
  - Hover-Effekte für bessere Interaktivität
  - Verbesserte Farbgebung und Kontraste
  - Handle-Cursor für Drag & Drop
  - Transition-Animationen
- **Accessibility**:
  - ARIA-Labels für alle interaktiven Elemente
  - Focus-States mit Outline für Tastatur-Navigation
  - Semantische Button-Labels
- **Responsive Design**:
  - Mobile-optimiertes Layout mit flexbox
  - Breakpoints für Tablets und Smartphones

### 🚀 Performance
- **Document Fragments**: DOM-Elemente werden gebündelt eingefügt (Single Reflow)
- **Debounced Search**: Suchfunktion mit 200ms Verzögerung reduziert API-Calls
- **Cache Control**: Korrekte HTTP-Header für frische Daten
- **Optimized Queries**: Effiziente SQL-Queries mit DISTINCT und Indexierung

### 📦 Meta
- **package.yml**: Version auf 1.2.0 erhöht
- **PHP-Requirement**: PHP >= 8.2 (für `never` Return-Type)
- **Author**: Korrigiert zu "Friends of REDAXO"
- **Repository**: GitHub-Link zu FriendsOfREDAXO aktualisiert
- **CHANGELOG.md**: Vollständige Dokumentation aller Änderungen

### 📚 Dokumentation
- **README.md**: Erweitert mit Security-Hinweisen
- **Performance-Tipps**: Dokumentiert im README
- **Accessibility-Features**: Aufgelistet und erklärt
- **Theme-Support**: Dark/Light/Auto Modi dokumentiert

## Version 1.1.2
- Initiale Version
