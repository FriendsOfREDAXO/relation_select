# Changelog

## Version 1.3.2 (2026-02-06)

### 🐛 Bugfixes
- **Multi-Language Support**: Farben und Badges werden jetzt korrekt beim Laden wiederhergestellt
  - API filtert jetzt nach `clang_id` für mehrsprachige Tabellen (rex_article)
  - Separater API-Call für ausgewählte Items mit vollständigen `displayFields`
  - Duplikat-Handling: Bei mehreren Sprachversionen wird die mit gefüllten Feldern bevorzugt
- **Selected Items**: Ausgewählte Einträge zeigen jetzt color-preview und badges beim Seitenladen
- **Language Filter**: Automatische Erkennung der aktuellen Backend-Sprache (`rex.clang_id`)

### 🔧 Technisch
- `clang` Parameter in API hinzugefügt (Standard: 1)
- JavaScript erkennt `rex.clang_id` automatisch oder nutzt Config-Wert
- Promise.all() für parallele API-Calls (available + selected items)
- Fallback-Logik bei mehreren Items mit gleicher ID

## Version 1.3.0 (2026-02-06)

### ✨ Neue Features
- **Erweiterte Label-Formatierung**: Visuelle Anreicherung der Einträge
  - **Color-Preview**: `displayFormat: "color:feldname"` zeigt Farbquadrat an
  - **Status-Badge**: `displayFormat: "badge:feldname"` zeigt Status als Badge
  - **ID-Display**: `displayFormat: "(id)"` zeigt ID in Klammern
  - **Kombinationen**: Mehrere Formate kombinierbar (z.B. `"color:color|(id)|badge:status"`)
  - Keine Bootstrap-Abhängigkeit - Pure CSS-Komponenten
  - Dark-Theme-Unterstützung für alle neuen Komponenten
- **API-Erweiterung**: `displayFields` Parameter für zusätzliche Datenfelder
- **Item-Daten**: Alle Felder werden als `data-item` Attribut gespeichert für flexible Verwendung

### 🐛 Bugfixes
- **PHP Syntax Error**: api.php Zeile 93 korrigiert - ORDER BY und SELECT Statements waren durcheinander geraten
- **Type Safety**: `formatLabel()` konvertiert jetzt alle Werte zu Strings vor `.trim()` Aufruf
- **Empty Value Handling**: Leere oder null Werte in displayFields werden korrekt behandelt

### 🎭 UX-Verbesserungen
- Farbvorschau macht Kategorien/Tags sofort erkennbar
- Status-Badges zeigen Zustand auf einen Blick
- ID-Anzeige hilft bei der Identifikation
- Visuelle Hierarchie durch gestaffelte Komponenten

### 📘 Dokumentation
- README erweitert mit 6 realistischen Praxisbeispielen:
  1. Artikel mit Farbkategorien (REDAXO Modul mit Eingabe + Ausgabe)
  2. Produkt-Tags mit Farben (YForm-Tabelle)
  3. Event-Auswahl mit Datum-Filter
  4. Mitarbeiter-Verwaltung mit Status-Badges
  5. Kategorien mit Hierarchie und Farbe
  6. News-System mit Prioritäten
- Kombinationsbeispiele dokumentiert
- YForm-Integration mit doppelt-escaptem JSON erklärt

### 🎨 CSS
- `.relation-color-preview` - 16x16px Farbquadrat mit Border
- `.relation-badge` - Info-Badge im REDAXO-Stil
- `.relation-id` - Monospace ID-Display
- `.relation-label-text` - Haupt-Label-Text
- Alle Komponenten mit Dark-Theme-Varianten

## Version 1.3.1 (2026-02-06)

### 🐛 Bugfixes
- **Badge Initial-State**: Badge zeigt jetzt korrekt die `has-items` Klasse (blau) beim Laden, wenn bereits Werte ausgewählt sind
- **Speicher-Logik**: Funktionierende `updateValue()` Methode von Version 1.1.2 wiederhergestellt - Daten werden jetzt wieder korrekt gespeichert
- **README korrigiert**: Alle Modul-Beispiele verwenden jetzt `REX_INPUT_VALUE[1]` statt `my_field` für korrekte REDAXO-Modul-Integration

### ✨ Features
- **SVG-Icons**: Alle FontAwesome-Icons durch eigene inline-SVG ersetzt (Material Design Style)
  - Plus-Icon für Hinzufügen
  - Minus-Icon für Entfernen
  - Drag-Handle (6 Punkte)
  - Listen-Icon für Modal-Button
  - Close-Icon für Modal
  - `fill: currentColor` für automatische Theme-Anpassung
  - Keine externe Abhängigkeit mehr
- **Click-on-Row**: Gesamte Zeile ist jetzt klickbar (nicht nur der Button)
  - Verbesserte UX
  - Hover-Effekt zeigt Klickbarkeit
  - Button hat `stopPropagation()` für saubere Event-Behandlung
- **XSS-Schutz**: Alle Values und Labels werden durch `$('<div>').text().html()` escaped

### 📚 Dokumentation
- README-Beispiele korrigiert mit `REX_INPUT_VALUE[x]` und `REX_VALUE[x]`
- Testmodul hinzugefügt (`test_module.php`) für Debug-Zwecke

### 🔧 Technisch
- Basis: Version 1.1.2 (funktionierende Speicher-Logik)
- Modal-System aufgesetzt auf bewährte Grundlage
- `input.value = ...` statt `$(input).val()` für Kompatibilität

## Version 1.2.0 (2026-02-05)

### ✨ Neue Features
- **Modal-Modus**: Eigenes Modal-System für platzsparende Layouts
  - `data-relation-mode="modal"` aktiviert Modal-Darstellung
  - **Badge mit Anzahl** ausgewählter Einträge (live-Update)
  - Badge ist grau bei 0, blau bei Auswahl
  - Input-Feld wird ausgeblendet (nur Button sichtbar)
  - Frontend-kompatibel (keine Bootstrap-Abhängigkeit)
  - ESC-Taste zum Schließen
  - Body-Scroll-Lock während Modal aktiv
  - Smooth Animations mit Scale-Effekt
- **Inline-Modus**: Standard-Darstellung (wie bisher)
- **Dual-Mode-Support**: Frei wählbar per Attribut

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
