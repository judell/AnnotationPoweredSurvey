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

javascript:(function(){var d=document; var s=d.createElement('script');s.setAttribute('src','https://jonudell.info/hlib/StandaloneAnchoring.js');d.head.appendChild(s); s=d.createElement('script');s.setAttribute('src','https://jonudell.info/hlib/hlib.bundle.js');d.head.appendChild(s); s=d.createElement('script');s.setAttribute('src','https://jonudell.info/h/CredCoContentAnnotation/gather.js');d.head.appendChild(s);})();

GitHub's Markdown doesn't seem to let me form a drag-installable bookmarklet here in this page, but you can:

1. Go to <a href="https://jonudell.info/h/#bookmarklets">this page</a> and drag it from there.

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

Use the `anchored` key

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

Q03 requires that the answer to Q02 was '1.02.01' or '1.02.02'

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

Q03_01 requires that '1.03.07' is among the responses to Q03
  
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

Q09_02 requires that Q09_01 was answered
  
  ```
  'Q08b' : {
    'type' : 'checkbox',
    'title' : 'Types of sources',
    'question' : 'Which of the following are cited?',
    'requires' : {
      'target' : 'Q08a',
      'equal' : '1.08a.01',
    },    
    'choices' : [
      '1.08.02:Experts',
      '1.08.03:Studies',
      '1.08.04:Organizations',      
    ],
    'anchored' : false,
  },  
  'Q09_01' : {
    'type' : 'highlight',
    'title' : 'Expert sources',
    'question' : 'Highlight expert source #1',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.02',
    },
  },  
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

Q09_01 will only have been answered if Experts was a choice earlier. In that case, Expert source #1 will have an answer, and Q09_02 will be displayed. There may or may not be additional expert sources. The `canskip` directive on Q09_02 (and following) surfaces a Skip button.

This method requires enumerating a set of skippable questions, e.g. for Expert sources #2, #3, etc. That's tedious and error-prone, and should probably be optimized away. Meanwhile, though it does have a possibly useful side effect: Skips are explicit user choices, recorded as such in the annotation layer. 

## Initial demo

http://jonudell.info/h/credco-01.mp4

## Notes

The `requires` syntax includes only the minimum set of patterns implied by the CredCo questionaire, in order to get the ball rolling on that front. It will definitely need to evolve/improve/simplify as other patterns appear.

As is, question-writing is trickier and more verbose than it should be. If the basic approach pans out, it may be worth investing in a bit of tool support to validate the JSON, and maybe even provide a guided editing experience. But, first things first, let's make sure the basic approach enables annotators to process articles quickly, painlessly, and accurately, and to reliably deposit answers into the annotation layer for use both as interactive overlay and source of structured data. 

For the CredCo app, we assume that annotators will be placed into individual Hypothesis groups, each of which will also have the project coordinator as a member. That means the coordinator can <a href="https://jonudell.info/h/facet/">export</a> data from each of the per-annotator groups. 




