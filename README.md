# Relation Select AddOn

Auswahl verknüpfter Datensätze mit Choices.js und Sortierung.

## Nutzung

### Als Metainfo-Feld
```
data-relation-config="{'table':'rex_categories','valueField':'id','labelField':'name','sortable':true,'multiple':true}"
```

### Als HTML
```html
<input type="text" name="my_field" 
    data-relation-config="{'table':'rex_categories','valueField':'id','labelField':'name','sortable':true,'multiple':true,'placeholder':'Bitte wählen...'}"
>
```

### Als YForm-Feld
```php
$yform->setValueField('text', [
    'name' => 'categories',
    'label' => 'Kategorien',
    'attributes' => 'data-relation-config="{'table':'rex_categories','valueField':'id','labelField':'name','sortable':true,'multiple':true}"'
]);
```

## Parameter
- table: Tabelle (z.B. rex_categories)
- valueField: Feld für den Wert (z.B. id)
- labelField: Feld für die Anzeige (z.B. name) 
- sortable: Sortierung aktivieren (true/false)
- multiple: Mehrfachauswahl (true/false)
- placeholder: Platzhaltertext
