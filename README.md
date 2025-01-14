# 🐣 Relation Select AddOn

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

### Label-Syntax

Das `labelField` ermöglicht verschiedene Varianten der Anzeige:

1. Einfache Feldverknüpfung (mit automatischem Leerzeichen):
```json
"labelField": "firstname|lastname"                    // "Max Mustermann"
```

2. Mit beschreibenden Texten:
```json
"labelField": "#Vorname: #|firstname|# Nachname: #|lastname"  // "Vorname: Max Nachname: Mustermann"
"labelField": "#ID: #|id|# - #|title"                        // "ID: 123 - Mein Artikel"
```

3. Komplexere Formatierungen:
```json
"labelField": "#(#|id|#) #|firstname|# #|lastname"           // "(123) Max Mustermann"
"labelField": "firstname|# (#|id|#)#"                        // "Max (123)"
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
- Text mit Leerzeichen: `#Mein Text#`

#### Beispiele für Filter

```php
// Einfache Vergleiche
"dbw": "status=1"                               // Status ist 1
"dbw": "priority>=5"                            // Priorität >= 5
"dbw": "parent_id!=0"                           // Kein Hauptartikel

// Textsuche
"dbw": "name=#Max Muster#"                      // Name ist genau "Max Muster"
"dbw": "name~#Max#"                             // Name enthält "Max"
"dbw": "name~#Start*#"                          // Name beginnt mit "Start"
"dbw": "description~#*wichtig*#"                // Beschreibung enthält "wichtig"

// Datum und Zeit
"dbw": "createdate>now"                         // Nur zukünftige Einträge
"dbw": "date_from=today"                        // Einträge von heute
"dbw": "valid_until>now"                        // Noch gültige Einträge

// NULL-Werte
"dbw": "parent_id=NULL"                         // Nur Hauptkategorien
"dbw": "updated!=NULL"                          // Nur bearbeitete Einträge

// Mehrere Bedingungen (mit AND verknüpft)
"dbw": "status=1,parent_id!=0"                  // Online und kein Hauptartikel
"dbw": "name~#Start*#,status!=0"               // Beginnt mit "Start" und online
"dbw": "title=#Mein Artikel#,status=1"         // Exakter Titel und online
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


## Autor

**Friends Of REDAXO**

* http://www.redaxo.org
* https://github.com/FriendsOfREDAXO

**Projektleitung**

- [Peter Bickel](https://github.com/polarpixel)
- [Thomas Skerbis](https://github.com/skerbis)

## Lizenz

MIT License - siehe [LICENSE.md](LICENSE.md)

