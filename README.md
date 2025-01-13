# Relation Select AddOn

Ermöglicht die Auswahl und Sortierung verknüpfter Datensätze.

## Nutzung

### Als Metainfo-Feld
```
data-relation-config="{'table':'rex_categories','valueField':'id','labelField':'name'}"
```

### Als HTML
```html
<input type="text" name="my_field" 
    data-relation-config="{'table':'rex_categories','valueField':'id','labelField':'name'}"
>
```

### Als YForm-Feld
```php
$yform->setValueField('text', [
    'name' => 'categories',
    'label' => 'Kategorien',
    'attributes' => 'data-relation-config="{'table':'rex_categories','valueField':'id','labelField':'name'}"'
]);
```

## Parameter
- table: Name der REDAXO-Tabelle
- valueField: Feld für den Wert
- labelField: Feld für die Anzeige
