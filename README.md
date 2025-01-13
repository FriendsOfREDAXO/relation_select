# Relation Select AddOn

Ermöglicht die Auswahl verknüpfter Datensätze mit Tom Select.

## Nutzung

```html
<input type="text" name="my_field" value="1,4,7" 
    data-relation-config="{'table':'rex_categories','valueField':'id','labelField':'name','sortable':true,'multiple':true,'placeholder':'Bitte wählen...'}">
```

## Optionen

- table: Name der REDAXO Tabelle
- valueField: Spalte für den Wert
- labelField: Spalte für die Anzeige
- multiple: Mehrfachauswahl (true/false)
- placeholder: Platzhaltertext
