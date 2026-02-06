# Relation Select AddOn

Ermöglicht die Auswahl und Sortierung verknüpfter Datensätze mit erweiterten Filter- und Sortiermöglichkeiten.

## Features

- 🎯 Benutzerfreundliche Oberfläche zum Auswählen und Sortieren von Datensätzen
- 🔍 Durchsuchbare Liste verfügbarer Einträge mit Debounce-Optimierung
- 🎨 Drag & Drop Sortierung der ausgewählten Einträge
- 🔒 Sichere API mit XSS-Schutz und Type Safety
- 📱 Responsive Design für mobile Geräte
- ♿ Accessibility-optimiert (ARIA-Labels, Keyboard-Navigation)
- 🚀 Performance-optimiert (Document Fragments, debounced Search)
- 🔧 Flexible Filtermöglichkeiten mit vereinfachter Syntax
- 📅 Automatische Datumswerte (now, today)
- 🏷️ Flexible Label-Gestaltung durch Feldverknüpfungen
- 🔗 Unterstützung für Meta Infos und YForm

## Installation

1. Im REDAXO Installer das AddOn "relation_select" herunterladen
2. AddOn installieren und aktivieren
3. Bei Bedarf: API-Token für Frontend-Nutzung notieren

## Anforderungen

- REDAXO >= 5.17
- PHP >= 8.2

## Anwendung

### Modi

Das AddOn unterstützt zwei Anzeigemodi:

#### **Inline-Modus (Standard)**
Widget wird direkt unterhalb des Input-Feldes angezeigt:

```html
<input type="text" 
    name="REX_INPUT_VALUE[1]" 
    value="REX_VALUE[1]"
    data-relation-config='{
        "table": "rex_article",
        "valueField": "id",
        "labelField": "name"
    }'
>
```

#### **Modal-Modus**
Widget wird in einem Overlay-Dialog geöffnet (ideal für platzsparende Layouts und Frontend-Verwendung):

```html
<input type="text" 
    name="REX_INPUT_VALUE[1]" 
    value="REX_VALUE[1]"
    data-relation-mode="modal"
    data-relation-config='{
        "table": "rex_article",
        "valueField": "id",
        "labelField": "name"
    }'
>
```

**Modal-Features:**
- 🎯 Eigenes Modal-System (keine Bootstrap-Abhängigkeit)
- � **Badge mit Anzahl** ausgewählter Einträge (live-Update)
- 📱 Frontend-kompatibel
- ⌨️ ESC-Taste zum Schließen
- 🎨 Dark-Theme-Support
- 📱 Responsive Design
- 🔒 Body-Scroll-Lock während Modal offen ist
- 💨 Smooth Animations

**UX im Modal-Modus:**
- Input-Feld wird ausgeblendet
- Button zeigt Badge mit Anzahl der Auswahlen
- Badge ist grau bei 0 Einträgen, blau bei Auswahl
- Live-Update der Badge-Anzahl bei Änderungen

### Beispiel für eine Relation in YForm

Das Feld wird als **Textfeld** mit dem Namen der Relation angelegt (z.B. `autoren_id`).

Bei den **individuellen Attributen** des Feldes wird folgendes eingetragen:

**Inline-Modus:**
```json
{
    "data-relation-config": "{
        \"table\": \"rex_autoren\",
        \"valueField\": \"id\",
        \"labelField\": \"vorname|nachname\"
    }"
}
```

**Modal-Modus:**
```json
{
    "data-relation-mode": "modal",
    "data-relation-config": "{
        \"table\": \"rex_autoren\",
        \"valueField\": \"id\",
        \"labelField\": \"vorname|nachname\"
    }"
}
```

**Wichtig:** In YForm muss das JSON doppelt escaped werden (siehe Beispiel).

### Beispiel mit Filtern und Sortierung

```html
<input type="text" 
    name="REX_INPUT_VALUE[2]" 
    value="REX_VALUE[2]"
    data-relation-mode="modal"
    data-relation-config='{
        "table": "rex_authors",
        "valueField": "id",
        "labelField": "firstname|lastname",
        "dbw": "status = 1, published != 0",
        "dbob": "lastname,ASC,firstname,ASC"
    }'
>
```

### Label-Syntax

Einfache Feldverknüpfung (mit automatischem Leerzeichen):
```json
"labelField": "firstname|lastname"
```

### Erweiterte Label-Formatierung (NEU in 1.3.0)

Anzeige zusätzlicher Informationen wie Farben, IDs oder Status-Badges:

**Parameter:**
- `displayFields`: Zusätzliche Felder aus der Datenbank (Pipe-getrennt: `"color|status"`)
- `displayFormat`: Format-String mit folgenden Optionen:
  - `color:feldname` - Farbvorschau als Quadrat (16x16px)
  - `badge:feldname` - Status/Info als Badge
  - `(id)` - ID-Anzeige in Klammern
  - Pipe-getrennte Kombinationen möglich

---

## Realistische Beispiele

### 1. Artikel mit Farbkategorien (REDAXO Modul)

```php
<?php
// Modul-Eingabe
$field = '<input type="text" 
    name="REX_INPUT_VALUE[1]" 
    value="REX_VALUE[1]"
    class="form-control relation-select"
    data-relation-mode="modal"
    data-relation-config=\'{
        "table": "rex_article",
        "valueField": "id",
        "labelField": "name",
        "displayFields": "art_color|status",
        "displayFormat": "color:art_color|name|(id)|badge:status",
        "dbw": "status = 1",
        "dbob": "name,ASC"
    }\'
/>';

echo $field;
?>
```

**Ausgabe:**
```php
<?php
$articleIds = explode(',', 'REX_VALUE[1]');
$articleIds = array_filter(array_map('intval', $articleIds));

if (count($articleIds) > 0) {
    echo '<div class="article-grid">';
    
    foreach ($articleIds as $articleId) {
        $article = rex_article::get($articleId);
        if ($article) {
            $color = $article->getValue('art_color') ?: '#cccccc';
            $status = $article->getValue('status') == 1 ? 'Online' : 'Offline';
            
            echo '<div class="article-card" style="border-left: 4px solid ' . htmlspecialchars($color) . '">';
            echo '  <h3>' . htmlspecialchars($article->getName()) . '</h3>';
            echo '  <span class="status-badge">' . $status . '</span>';
            echo '  <p class="article-id">#' . $articleId . '</p>';
            echo '</div>';
        }
    }
    
    echo '</div>';
}
?>
```

**Ergebnis im Modal:** 🟦 Startseite (1) [Online]

---

### 2. Produkt-Tags mit Farben (YForm Tabelle)

**Tabelle:** `rex_shop_tags`
- `id` (int)
- `name` (varchar)
- `tag_color` (varchar - Hex-Farbcode)
- `priority` (int)
- `status` (int)

**YForm Feld-Konfiguration:**

Feld-Typ: **text**  
Individuelle Attribute:
```json
{
    "class": "form-control relation-select",
    "data-relation-mode": "modal",
    "data-relation-config": "{
        \"table\": \"rex_shop_tags\",
        \"valueField\": \"id\",
        \"labelField\": \"name\",
        \"displayFields\": \"tag_color\",
        \"displayFormat\": \"color:tag_color|name\",
        \"dbw\": \"status = 1\",
        \"dbob\": \"priority,DESC,name,ASC\"
    }"
}
```

**Ergebnis:** 🟢 Bio-Produkt 🔵 Vegan 🟡 Glutenfrei

---

### 3. Event-Auswahl mit Datum und Status (REDAXO Modul)

```html
<input type="text" 
    name="REX_INPUT_VALUE[2]" 
    value="REX_VALUE[2]"
    class="form-control relation-select"
    data-relation-mode="modal"
    data-relation-config='{
        "table": "rex_yform_table_events",
        "valueField": "id",
        "labelField": "title",
        "displayFields": "event_status",
        "displayFormat": "name|(id)|badge:event_status",
        "dbw": "event_date >= today, published = 1",
        "dbob": "event_date,ASC"
    }'
/>
```

**Ergebnis im Modal:** 
- Sommerfest 2026 (42) [Bestätigt]
- Weihnachtsfeier (43) [In Planung]

---

### 4. Mitarbeiter mit Abteilung und Status (YForm)

**Tabelle:** `rex_hr_employees`
- `id` (int)
- `firstname` (varchar)
- `lastname` (varchar)
- `department` (varchar)
- `employment_status` (varchar - "Aktiv", "Urlaub", "Extern")
- `active` (int)

**YForm Feld-Konfiguration:**
```json
{
    "class": "form-control relation-select",
    "data-relation-config": "{
        \"table\": \"rex_hr_employees\",
        \"valueField\": \"id\",
        \"labelField\": \"firstname|lastname\",
        \"displayFields\": \"department|employment_status\",
        \"displayFormat\": \"name|badge:employment_status\",
        \"dbw\": \"active = 1\",
        \"dbob\": \"lastname,ASC,firstname,ASC\"
    }"
}
```

**Ergebnis:** 
- Max Mustermann [Aktiv]
- Anna Schmidt [Urlaub]

---

### 5. Kategorien mit Hierarchie und Farbe

```html
<input type="text" 
    name="REX_INPUT_VALUE[3]" 
    value="REX_VALUE[3]"
    class="form-control relation-select"
    data-relation-config='{
        "table": "rex_category",
        "valueField": "id",
        "labelField": "name",
        "displayFields": "cat_color",
        "displayFormat": "color:cat_color|(id)|name",
        "dbw": "status = 1, parent_id != 0",
        "dbob": "priority,DESC,name,ASC"
    }'
/>
```

**Ergebnis:** 🔴 (5) Dienstleistungen 🟢 (7) Produkte

---

### 6. Komplexes Beispiel: News mit Autor, Status und Priorität

```html
<input type="text" 
    name="REX_INPUT_VALUE[4]" 
    value="REX_VALUE[4]"
    class="form-control relation-select"
    data-relation-mode="modal"
    data-relation-config='{
        "table": "rex_yform_table_news",
        "valueField": "id",
        "labelField": "title",
        "displayFields": "priority_color|status",
        "displayFormat": "color:priority_color|name|(id)|badge:status",
        "dbw": "status != [[Gelöscht]], publish_date <= now",
        "dbob": "priority,DESC,publish_date,DESC"
    }'
/>
```

**Ergebnis im Modal:**
- 🔴 Breaking: Wichtige Neuigkeit (123) [Veröffentlicht]
- 🟡 Update verfügbar (124) [Entwurf]
- 🟢 Wartungshinweis (125) [Geplant]

---

**Vorteile der erweiterten Formatierung:**
✅ Sofortige visuelle Erkennung durch Farben  
✅ Status auf einen Blick durch Badges  
✅ ID-Anzeige für Debugging und Support  
✅ Keine Bootstrap-Abhängigkeit  
✅ Volle Dark-Theme-Unterstützung  
✅ Frontend-kompatibel


### Filter-Syntax (dbw)

Der `dbw` Parameter ermöglicht das Filtern der Datensätze mit einer vereinfachten Syntax.

#### Operatoren

- `=`: Exakte Übereinstimmung
- `!=`: Ungleich
- `>`: Größer als
- `<`: Kleiner als
- `>=`: Größer oder gleich
- `<=`: Kleiner oder gleich
- `~`: Textsuche (LIKE)

#### Spezielle Werte

- `now`: Aktuelle Zeit (CURRENT_TIMESTAMP)
- `today`: Aktuelles Datum (CURRENT_DATE)
- `NULL`: NULL-Wert
- Text mit Leerzeichen: `[[Mein Text]]`

#### Beispiele für Filter

```json
// Einfache Vergleiche
"dbw": "status = 1"
"dbw": "priority >= 5"
"dbw": "parent_id != 0"

// Textsuche
"dbw": "name = Willi Meier"              // Exakte Übereinstimmung
"dbw": "name ~ Meier"                    // Enthält "Meier" irgendwo
"dbw": "name ~ Start*"                   // Beginnt mit "Start"
"dbw": "name ~ *Ende"                    // Endet mit "Ende"
"dbw": "description ~ *wichtig*"         // Enthält "wichtig"

// Datum und Zeit
"dbw": "createdate > now"                // Nur zukünftige Einträge
"dbw": "date_from = today"               // Einträge von heute
"dbw": "valid_until > now"               // Noch gültige Einträge

// NULL-Werte
"dbw": "parent_id = NULL"                // Nur Hauptkategorien
"dbw": "updated != NULL"                 // Nur bearbeitete Einträge

// Mehrere Bedingungen
"dbw": "status = 1, parent_id != 0"      // Online und keine Hauptkategorie
"dbw": "name ~ Start*, status != 0"      // Beginnt mit "Start" und online
"dbw": "priority >= 5, createdate > now" // Wichtige zukünftige Einträge
```

### Sortier-Syntax (dbob)

Der `dbob` Parameter bestimmt die Sortierung der Einträge.

#### Format
- Komma-getrennte Liste: `Feld,Richtung,Feld,Richtung,...`
- Richtung: `ASC` (aufsteigend) oder `DESC` (absteigend)
- Wenn keine Richtung angegeben wird, wird `ASC` verwendet

#### Beispiele für Sortierung

```json
// Einfache Sortierung
"dbob": "name,ASC"                  // Alphabetisch nach Name
"dbob": "priority,DESC"             // Höchste Priorität zuerst
"dbob": "createdate,DESC"           // Neueste zuerst

// Mehrfache Sortierung
"dbob": "parent_id,ASC,name,ASC"    // Nach Kategorie, dann alphabetisch
"dbob": "priority,DESC,name,ASC"    // Nach Priorität, bei gleicher alphabetisch
```


## Sicherheit

### XSS-Schutz
Alle Ausgaben (Labels, Values) werden automatisch escaped, um Cross-Site-Scripting (XSS) Angriffe zu verhindern.

### SQL-Injection-Schutz
Die API verwendet Prepared Statements und Parameter-Binding für alle Datenbankabfragen. Tabellenamen und Feldnamen werden mit `rex_sql::escapeIdentifier()` escaped.

### Type Safety
Das AddOn ist vollständig mit Rexstan validiert und verwendet strikte Typ-Deklarationen für alle Methoden und Parameter.

### API Token
Für Frontend-Zugriffe ist ein API-Token erforderlich. Backend-Zugriffe sind durch die REDAXO-Session geschützt.

## Performance

- **Document Fragments**: DOM-Manipulationen werden gebündelt für minimale Reflows
- **Debounced Search**: Suchfunktion mit 200ms Verzögerung für bessere Performance
- **Cache Control**: API-Responses werden nicht gecacht für aktuelle Daten
- **Optimized Queries**: SQL-Queries mit `DISTINCT` und optimierten WHERE/ORDER-Klauseln

## Barrierefreiheit

- ARIA-Labels für alle interaktiven Elemente
- Keyboard-Navigation unterstützt
- Focus-States für bessere Sichtbarkeit
- Semantisches HTML

## Theme-Support

Das AddOn unterstützt alle REDAXO-Themes:

### Light Theme (Standard)
Helle Farben und hoher Kontrast für optimale Lesbarkeit

### Dark Theme
- Explizit: `body.rex-theme-dark`
- Auto-Modus: `@media (prefers-color-scheme: dark)`
- Verwendet REDAXO's offizielle Dark-Theme-Farbpalette
- Farben: `#202b35` (Background), `#409be4` (Links), `rgba(255, 255, 255, 0.75)` (Text)

### Auto Theme
Automatische Erkennung der System-Präferenz mit Fallback auf Light Theme

**CSS Custom Properties** mit Fallbacks sorgen für maximale Kompatibilität:
```css
color: var(--rex-text-color, #333);
background: var(--rex-panel-bg, #fff);
```

## Autor

**Friends Of REDAXO**

* http://www.redaxo.org
* https://github.com/FriendsOfREDAXO

**Projektleitung**

- [Peter Bickel](https://github.com/polarpixel)
- [Thomas Skerbis](https://github.com/skerbis)

## Lizenz

MIT License - siehe [LICENSE.md](LICENSE.md)

## API Token (Frontend-Zugriff)

Das AddOn verwendet einen API-Token, um den Zugriff auf die Daten vom Frontend aus zu schützen. 

**Wichtig:** Dieser Token wird **nur** benötigt, wenn Sie die API-Daten im Frontend verwenden möchten (z.B. für eigene Formulare oder dynamische Inhalte). Für die Verwendung im REDAXO-Backend ist keine Konfiguration nötig.

### Token anzeigen
Der aktuelle Token kann im REDAXO-Backend unter `AddOns > Relation Select` eingesehen werden.

### Token erneuern
Um einen neuen Token zu generieren, kann folgender PHP-Code ausgeführt werden (z.B. in der REDAXO-Konsole):

```php
// Neuen Token generieren und speichern
rex_config::set('relation_select', 'api_token', bin2hex(random_bytes(32)));
```

Alternativ kann das AddOn re-installiert werden, nachdem der Token aus der Konfiguration gelöscht wurde:

```php
// Token löschen (wird bei Re-Installation neu erstellt)
rex_config::remove('relation_select', 'api_token');
```

### Verwendung im Frontend (Custom JavaScript)

Das mitgelieferte JavaScript (`relation_select.js`) ist für die Verwendung im Backend optimiert. Wenn Sie die Funktionalität im Frontend nutzen möchten, müssen Sie eine eigene JavaScript-Implementierung schreiben, die die API anspricht.

Der Aufruf erfolgt dabei analog zum Backend, jedoch muss zusätzlich der Token übergeben werden:

`index.php?rex-api-call=relation_select&token=DEIN_TOKEN&table=rex_article&...`

Beispiel für einen Fetch-Call:

```javascript
const params = new URLSearchParams({
    'rex-api-call': 'relation_select',
    'token': 'HIER_DEN_TOKEN_EINSETZEN',
    'table': 'rex_article',
    'value_field': 'id',
    'label_field': 'name'
});

fetch('index.php?' + params.toString())
    .then(response => response.json())
    .then(data => console.log(data));
```


