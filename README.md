# Annotation-powered Survey

This is a minimal solution for the survey specified here: http://jonudell.info/h/CredCoContentAnnotation/pe_schema-credweb3.html. Initial demo http://jonudell.info/h/credco-01.mp4. Explanation: https://web.hypothes.is/blog/annotation-powered-questionnaires/. More <a href="https://jonudell.info/h/tools.html">Hypothesis tools</a>.

## Setup

This app runs in two browser windows. You launch it from a page of content, using a bookmarklet. That code, running in the content page, opens another window where you answer questions. When the answer to a question requires a selection in the content page, you send the selection from the content page to the app window. 

These are the ingredients:

1. `gather.js`: injected into a host page, opens `index.html` in an app window, and sends selections to it
2. `index.html`: the page where the app runs
3. `index.js`: code that runs in the app window (and uses https://github.com/judell/hlib for Hypothesis integration)
4. `questions.js`: definitions of questions and control flow
5. `StandaloneAnchoring.js`: from https://github.com/judell/TextQuoteAndPosition (modules, also used by the Hypothesis client, to convert a selection in a web page into the selectors needed by an annotation that targets the selection)

There's no server, this is purely a browser-based app. Deployment is old-school: Upload items 1-4 to some web-facing subdirectory, then create a bookmarklet like so:

```<a href="javascript:(function(){var d=document; var s=d.createElement('script');s.setAttribute('src','https://jonudell.info/hlib/StandaloneAnchoring.js');d.head.appendChild(s); s=d.createElement('script');s.setAttribute('src','https://jonudell.info/h/AnnotationPoweredSurvey/gather.js');d.head.appendChild(s);})();">Annotation-powered Survey</a>```

GitHub's Markdown doesn't seem to let me form a drag-installable bookmarklet here in this page, but you can:
- Go to <a href="https://jonudell.info/h/#bookmarklets">this page</a> and drag it from there, or
- Edit the above text into the URL field of an existing bookmarklet

That bookmarklet refers to a deployment at https://jonudell.info/h/AnnotationPoweredSurvey, and you can use the bookmarklet to test that instance. To host your own, rewrite `questions.js`, copy items 1-4 to another place, and tweak the bookmarklet to point to the `gather.js` in that place.

When activated from the bookmarklet, the app may trigger a popup blocker and require explicit consent. 

If the host page enforces Content Security Policy, the bookmarklet won't work. Should that become a problem, the mechanism can be repackaged as a browser extension. 

## Tests

To run the tests:

1. python server.py

2. visit http://localhost:8001/

3. Enter your Hypothesis username and token

4. visit http://localhost:8001/test.html?url=https://localhost:8001/test.html

## Question Types

### Radio

The answer is one of a set of choices

### Checkbox

The answer is one or more of a set of choices

### Textarea

The answer is freeform text

### Highlight

The answer is a selection

## Prompting

Use the `prompt` key: 

```
  'Q02' : {
    'type' : 'radio',
    'title' : 'Title Representativeness',
    'question' : 'Does the title of the article accurately reflect the content of the article?',
    'prompt' : 'Please select the title',

     ...
     
    'anchored' : true,
  },
```

Every question should have a `title` and a `question`. I added `prompt` initally for messages like <i>Please make a selection</i> or <i>Select all that apply</i>. But those are just rules that can be applied automatically when a question asserts `'anchored':true` or `'type':'checkbox'`. The former is separately communicated with a tooltip, the latter could be. So I'm thinking `prompt` is an optional way to say something else about a question, but we'll see how that plays out.


## Requiring a selection

Use the `anchored` key (the annotation will be anchored to the selection)

```
 'Q02' : {
    'type' : 'radio',
    'title' : 'Title Representativeness',

    ... 
    
    'anchored' : true,
  },
```

## Requiring a new selection

When consecutive questions relate to the same selection, a selection is remembered and carried forward. Use `newSelectionRequired` to require a new selection.

```
  'Q16_01': {
    'type': 'highlight',
    'title': 'Emotional valence',
    'question': 'Highlight where any language is extremely negative or extremely positive',
    'anchored': true,
    'newSelectionRequired': true,
    'requires': {
      'target': 'Q16',
      'oneOf': ['1.16.01', '1.16.02', '1.16.04', '1.16.05'],
    },
    'repeatable': true,
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

### Repeatable questions

Given this setup, if the answer to Q15 is _yes_ or _sort of_, the user is prompted to make a new selection and provide that as the answer to Q15_01. The question then repeats, requiring a new selection each time, until the user clicks a `next question` button. 

```
  'Q15': {
    'type': 'radio',
    'title': 'Acknowledgement of uncertainty',
    'question': 'Does the author acknowledge uncertainty, or the possibility things might be otherwise?',
    'choices': [
      '1.15.01:Yes',
      '1.15.02:Sort of',
      '1.15.03:No',
    ],
    'anchored': false,
  },
  'Q15_01': {
    'type': 'highlight',
    'title': 'Acknowledgement of uncertainty',
    'question': 'Highlight uncertainty example',
    'anchored': true,
    'newSelectionRequired': true,
    'requires': {
      'target': 'Q15',
      'oneOf': ['1.15.01', '1.15.02'],
    },
    'repeatable': true,
  },
```  

## Exporting the data

Visit https://jonudell.info/h/facet/, select the appropriate group, click CSV.

## Notes

The `requires` syntax includes only the minimum set of patterns implied by the CredCo questionnaire. The syntax will likely need to evolve/improve/simplify as other patterns emerge.

For the CredCo app, annotators will be placed into individual Hypothesis groups, each of which will also have the project coordinator as a member. That means the coordinator can <a href="https://jonudell.info/h/facet/">export</a> data from each of the per-annotator groups. It also means that we'd need to copy the data to the Public layer if/when that's desired. 

If you close the app window during a survey, then relaunch from the bookmarlet, your prior context will be read from the annotation layer and restored. 

Ideally this approach can integrate with other systems, like <a href="https://meedan.com/en/check/">Check</a> and  <a href="https://tag.works/">TagWorks</a>, in order bring their question-answering capabilities to granular, in-situ content. 




