# AnnotationPoweredSurvey

This is a minimal solution for the survey specified here: http://jonudell.info/h/CredCoContentAnnotation/pe_schema-credweb3.html

## Installation

The survey runs from a bookmarklet that refers to:

- An index.html page (where the app runs)
- A gather.js script, injected into the host page, that opens index.html in an app window and sends messages to it
- An index.js script that runs the app window
- StandaloneAnchoring.js, from https://github.com/judell/TextQuoteAndPosition (modules, also used by the Hypothesis client, to convert a selection in a web page into the selectors needed by an annotation that targets the selection)
- hlib.bundle.js, from https://github.com/judell/hlib (convenience wrappers around the Hypothesis API)

My current bookmarklet's text is:

```
javascript:(function(){var d=document; var s=d.createElement('script');s.setAttribute('src','https://jonudell.info/hlib/StandaloneAnchoring.js');d.head.appendChild(s); s=d.createElement('script');s.setAttribute('src','https://jonudell.info/hlib/hlib.bundle.js');d.head.appendChild(s); s=d.createElement('script');s.setAttribute('src','https://jonudell.info/h/CredCoContentAnnotation/gather.js');d.head.appendChild(s);})();
```

GitHub's Markdown doesn't seem to let me form a drag-installable bookmarklet here in this page, but you can:

1. Drag it from <a href="https://jonudell.net/h/#bookmarklets">here</a>

2. Edit the above text into the URL field of an existing bookmarklet

## Question Types

### Radio

The answer is one of a set of choices

### Checkbox

The answer is one or more of a set of choices

### Textarea

The answer is freeform text

### Highlight

The answer is a selection

## Requiring a selection

```
 'Q02' : {
    'type' : 'radio',
    'title' : 'Title Representativeness',

    ... 
    
    'anchored' : true,
  },
```
## Conditional display of questions

### Display a question if a prior answer is one of a set of choices

```
 'Q02' : {
    'type' : 'radio',
    'title' : 'Title Representativeness',
    'question' : 'Does the title of the article accurately reflect the content of the article?',
    'prompt' : 'Please select the title',
    'choices' : [
      '1.02.01:Completely Unrepresentative',
      '1.02.02:Somewhat Unrepresentative',
      '1.02.03:Somewhat Representative',
      '1.02.04:Completely Representative',      
    ],
    'anchored' : true,
  },
  'Q03' : {
    'type' : 'checkbox',
    'title' : 'Title Representativeness',
    'question' : 'How is the title unrepresentative? (select all that apply)',
    'requires' : {
      'target': 'Q02',
      'oneOf' : ['1.02.01','1.02.02'],
    },
    'choices' : [
      '1.03.01:Title is on a different topic than the body',
      '1.03.02:Title emphasizes different information than the body',
      '1.03.03:Title carries little information about the body',
      '1.03.04:Title takes a different stance than the body',
      '1.03.05:Title overstates claims or conclusions in the body',
      '1.03.06:Title understates claims or conclusions in the body',
      '1.03.07:Other'
    ],
    'anchored' : true,
  },
  ```
  
### Display a question if a prior answer contains a value
  
  ```
    'Q03_01' : {
    'type' : 'textarea',
    'title' : 'Title Representativeness',
    'question' : 'Please describe other ways in which the title is not representative',
    'anchored' : true,
    'requires' : {
      'target' : 'Q03',
      'contains' : '1.03.07'
    },
  },
  ```
  
### Display a question if a prior answer exists
  
  ```
    'Q09_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Expert sources',
    'question' : 'Highlight expert source #2',
    'anchored': true,
    'requires' : {
      'target': 'Q09_01',
      'exists' : true,
    },
  },
```

### Skip a question

See `canskip` above. 


