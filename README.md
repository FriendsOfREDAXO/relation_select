# Relation Select AddOn

Ermöglicht die Auswahl und Sortierung verknüpfter Datensätze mit erweiterten Filter- und Sortiermöglichkeiten.

## Features

- Benutzerfreundliche Oberfläche zum Auswählen und Sortieren von Datensätzen
- Flexible Filtermöglichkeiten mit einer vereinfachten Syntax
- Durchsuchbare Liste verfügbarer Einträge
- Drag & Drop Sortierung der ausgewählten Einträge
- Unterstützung für Meta Infos
- Automatische Datumswerte (now, today)
- Flexible Label-Gestaltung durch Feldverknüpfungen

## Installation

1. Im REDAXO Installer das AddOn "relation_select" herunterladen
2. AddOn installieren und aktivieren

## Anwendung

### Basis-Konfiguration
```html
<input type="text" name="my_field" 
    data-relation-mode="modal" 
    data-relation-config='{
        "table": "rex_article",
        "valueField": "id",
        "labelField": "name"
    }'
>
```

### Beispiel für eine Relation in Yform

Das Feld wird als Textfeld mit dem Namen der Relation angelegt (z.B. autoren_id).

Bei den individuellen Attributen des Feldes kann dann folgendes eingetragen werden:

`{"data-relation-mode":"modal","data-relation-config":"{\"table\": \"rex_autoren\",\"valueField\": \"id\",\"labelField\": \"anrede|vorname|nachname\"}"}`

### Label-Syntax

Einfache Feldverknüpfung (mit automatischem Leerzeichen):
```json
"labelField": "firstname|lastname"
```


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


