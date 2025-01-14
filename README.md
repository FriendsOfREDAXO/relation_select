# 🐣 Relation Select AddOn

Ermöglicht die Auswahl und Sortierung verknüpfter Datensätze mit erweiterten Filter- und Sortiermöglichkeiten.

## Features

- Benutzerfreundliche Oberfläche zum Auswählen und Sortieren von Datensätzen
- Flexible Filtermöglichkeiten mit einer vereinfachten Syntax
- Durchsuchbare Liste verfügbarer Einträge
- Drag & Drop Sortierung der ausgewählten Einträge
- Unterstützung für Meta Infos
- Automatische Datumswerte (now, today)

## Installation

1. Im REDAXO Installer das AddOn "relation_select" herunterladen
2. AddOn installieren und aktivieren

## Anwendung

### Als Metainfo-Feld

```php
data-relation-config='{"table":"rex_article","valueField":"id","labelField":"name"}'
```

### Als HTML-Eingabefeld

```html
<input type="text" name="my_field" 
    data-relation-config='{
        "table": "rex_categories",
        "valueField": "id",
        "labelField": "name",
        "dbw": "status != 0, name ~ Start*",
        "dboy": "name,ASC"
    }'
>
```

## Parameter

### Basis-Parameter

- `table`: Name der REDAXO-Tabelle
- `valueField`: Feld für den zu speichernden Wert
- `labelField`: Feld für die Anzeige
- `dbw`: Filter-Bedingungen (WHERE)
- `dboy`: Sortierung (ORDER BY)

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

### Sortier-Syntax (dboy)

Der `dboy` Parameter bestimmt die Sortierung der Einträge.

#### Format
- Komma-getrennte Liste: `Feld,Richtung,Feld,Richtung,...`
- Richtung: `ASC` (aufsteigend) oder `DESC` (absteigend)
- Wenn keine Richtung angegeben wird, wird `ASC` verwendet

#### Beispiele für Sortierung

```json
// Einfache Sortierung
"dboy": "name,ASC"                  // Alphabetisch nach Name
"dboy": "priority,DESC"             // Höchste Priorität zuerst
"dboy": "createdate,DESC"           // Neueste zuerst

// Mehrfache Sortierung
"dboy": "parent_id,ASC,name,ASC"    // Nach Kategorie, dann alphabetisch
"dboy": "priority,DESC,name,ASC"    // Nach Priorität, bei gleicher alphabetisch
```

## Komplette Beispiele

### Artikel-Auswahl mit Status-Filter

```html
<input type="text" name="articles" 
    data-relation-config='{
        "table": "rex_article",
        "valueField": "id",
        "labelField": "name",
        "dbw": "status = 1, parent_id != 0",
        "dboy": "priority,DESC,name,ASC"
    }'
>
```

### Kategorien mit Textsuche

```html
<input type="text" name="categories" 
    data-relation-config='{
        "table": "rex_categories",
        "valueField": "id",
        "labelField": "name",
        "dbw": "name ~ Start*, status = 1",
        "dboy": "name,ASC"
    }'
>
```

### Termine mit Datums-Filter

```html
<input type="text" name="events" 
    data-relation-config='{
        "table": "rex_events",
        "valueField": "id",
        "labelField": "title",
        "dbw": "date_from > now, status != 0",
        "dboy": "date_from,ASC,title,ASC"
    }'
>
```

## Lizenz

MIT License - siehe [LICENSE.md](LICENSE.md)

## Support

- Hilfe auf [REDAXO.org](https://www.redaxo.org/forum/)
- Fehler auf [Github](https://github.com/your/repo/issues) melden
