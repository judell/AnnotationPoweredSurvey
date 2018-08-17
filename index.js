// annotated spec: http://jonudell.info/h/CredCoContentAnnotation/pe_schema-credweb3.html

const questions = {
  'Q01' : {
    'type' : 'radio',
    'title' : 'Overall Credibility',
    'question' : 'Rate your impression of the credibility of this article',
    'choices' : [
      '1.01.01:Very low credibility',
      '1.01.02:Somewhat low credibility',
      '1.01.03:Medium credibility',
      '1.01.04:Somewhat high credibility',      
      '1.01.05:High credibility',      
    ],
    'anchored' : false,
  },
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
  'Q04' : {
    'type': 'radio',
    'title': 'Clickbaitiness',
    'question': 'Is the headline clickbaity',
    'anchored': true,
    'choices' :[
      '1.04.01:Very much clickbaity',
      '1.04.02:Somewhat clickbaity',
      '1.04.03:A little bit clickbaity',
      '1.04.04:Not at all clickbaity',
    ],
  },
  'Q05' : {
    'type': 'checkbox',
    'title': 'Clickbaitiness',
    'prompt': 'Select all that apply',
    'question': 'What clickbait techniques does this headline employ?',
    'anchored': true,
    'requires' : {
      'target': 'Q04',
      'oneOf' : ['1.04.01','1.04.02','1.04.03'],
    },
    'choices' : [
      '1.05.01:Listicle ("6 Tips on ...")',
      '1.05.02:Cliffhanger to a story ("You Won\'t Believe What Happens Next")',
      '1.05.03:Provoking emotions, such as shock or surprise ("...Shocking Result", "...Leave You in Tears")',
      '1.05.04:Hidden secret or trick ("Fitness Companies Hate Him...", "Experts are Dying to Know Their Secret")',
      '1.05.05:Challenges to the ego ("Only People with IQ Above 160 Can Solve This")',
      '1.05.06:Defying convention ("Think Orange Juice is Good for you? Think Again!", "Here are 5 Foods You Never Thought Would Kill You")',
      '1.05.07:Inducing fear ("Is Your Boyfriend Cheating on You?")',
      '1.05.08:Other',       
    ],
  },
  'Q06' : {
    'type' : 'textarea',
    'title' : 'Clickbaitiness',
    'question' : 'Please describe other ways in which the title is clickbaity',
    'anchored' : true,
    'requires' : {
      'target' : 'Q05',
      'contains' : '1.05.08'
    },
  },
  'Q07' : {
    'type' : 'radio',
    'title' : 'Single study?',
    'question' : 'Is the article primarily about a single scientific study?',
    'choices' : [
      '1.07.01:Yes',
      '1.07.02:No',
    ],
    'anchored' : false,
  },
  'Q08a' : {
    'type' : 'radio',
    'title' : 'Types of sources',
    'question' : 'Does the article cite sources?',
    'choices' : [
      '1.08a.01:Yes',
      '1.08a.02:No',
    ],
    'anchored' : false,
  },  
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
  'Q09_03' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Expert sources',
    'question' : 'Highlight expert source #3',
    'anchored': true,
    'requires' : {
      'target': 'Q09_01',
      'exists' : true,
    },
  },
  'Q10_01' : {
    'type' : 'highlight',
    'title' : 'Studies',
    'question' : 'Highlight study #1',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.03',
    },
  },
  'Q10_02' : {
    'type' : 'highlight',
    'canskip': true,
    'title' : 'Studies',
    'question' : 'Highlight study #2',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.03',
    },
  },
  'Q11_01' : {
    'type' : 'highlight',
    'title' : 'Organizations',
    'question' : 'Highlight organization #1',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.04',
    },
  },
  'Q11_02' : {
    'type' : 'highlight',
    'canskip': true,
    'title' : 'Organizations',
    'question' : 'Highlight organization #2',
    'anchored': true,
    'requires' : {
      'target': 'Q08b',
      'contains' : '1.08.04',
    },
  },
  'Q12' : {
    'type' : 'radio',
    'title' : 'Other types of sources',
    'question' : 'Are any experts, organizations, or studies separate from the central study quoted in the article?',
    'choices' : [
      '1.12.01:Yes',
      '1.12.02:No',
    ],
    'anchored' : false,
  },  
  'Q12_01' : {
    'type' : 'highlight',
    'title' : 'Other types of sources',
    'question' : 'Other source #1',
    'anchored': true,
    'requires' : {
      'target': 'Q12',
      'contains' : '1.12.01',
    },
  },
  'Q12_02' : {
    'type' : 'highlight',
    'canskip': true,
    'title' : 'Other types of sources',
    'question' : 'Other source #1',
    'anchored': true,
    'requires' : {
      'target': 'Q12',
      'contains' : '1.12.01',
    },
  },
  'Q13' : {
    'type' : 'radio',
    'title' : 'Confidence in claims made by sources',
    'question' : 'To what extent does the author\'s confidence in claims made by sources seem justified?',
    'anchored': false,
    'requires' : {
      'target': 'Q12',
      'contains' : '1.12.01',
    },
    'choices' : [
      '1.13.01:Completely justified',
      '1.13.02:Mostly justified',
      '1.13.03:Somewhat justified',
      '1.13.04:Slightly justified',
      '1.13.05:Not at all justified',
    ],
  },
  'Q14' : {
    'type' : 'radio',
    'title' : 'Acknowledgement of uncertainty',
    'question' : 'Does the author acknowledge uncertainty, or the possibility things might be otherwise?',
    'anchored': false,
    'requires' : {
      'target': 'Q13',
      'oneOf' : ['1.13.01', '1.13.02', '1.13.03'],
    },
    'choices' : [
      '1.14.01:Yes',
      '1.14.02:Sort of',
      '1.14.03:No',
    ],
  },
  'Q14_01' : {
    'type' : 'highlight',
    'title' : 'Acknowledgement of uncertainty',
    'question' : 'Highlight example #1',
    'anchored': true,
    'requires' : {
      'target': 'Q14',
      'oneOf' : ['1.14.01', '1.14.02'],
    },
  },
  'Q14_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Acknowledgement of uncertainty',
    'question' : 'Highlight example #2',
    'anchored': true,
    'requires' : {
      'target': 'Q14',
      'oneOf' : ['1.14.01', '1.14.02'],
    },
  },
  'Q15' : {
    'type' : 'radio',
    'title' : 'Straw man argument',
    'question' : 'Does the author present a counterargument as a weaker, more foolish version of the real counterargument?',
    'anchored': false,
    'choices' : [
      '1.15.01:Yes',
      '1.15.02:Sort of',
      '1.15.03:No',
    ],
  },
  'Q15_01' : {
    'type' : 'highlight',
    'title' : 'Straw man argument',
    'question' : 'Highlight straw man example #1',
    'anchored': true,
    'requires' : {
      'target' : 'Q15',
      'oneOf' : ['1.15.01', '1.15.02']
    },
  },
  'Q15_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Straw man argument',
    'question' : 'Highlight straw man example #2',
    'anchored': true,
    'requires' : {
      'target' : 'Q15',
      'oneOf' : ['1.15.01', '1.15.02']
    },
  },
  'Q16' : {
    'type' : 'radio',
    'title' : 'False dilemma',
    'question' : 'Does the author present a complicated choice as if it were binary?',
    'anchored': false,
    'choices' : [
      '1.16.01:Yes',
      '1.16.02:Sort of',
      '1.16.03:No',
    ],
  },
  'Q16_01' : {
    'type' : 'highlight',
    'title' : 'False dilemma',
    'question' : 'Highlight false dilemma example #1',
    'anchored': true,
    'requires' : {
      'target' : 'Q16',
      'oneOf' : ['1.16.01', '1.16.02']
    },
  },
  'Q16_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'False dilemma',
    'question' : 'Highlight false dilemma example #2',
    'anchored': true,
    'requires' : {
      'target' : 'Q16',
      'oneOf' : ['1.16.01', '1.16.02']
    },
  },
  'Q17' : {
    'type' : 'radio',
    'title' : 'Slippery slope',
    'question' : 'Does the author say that one small change will lead to a major change?',
    'anchored': false,
    'choices' : [
      '1.17.01:Yes',
      '1.17.02:Sort of',
      '1.17.03:No',
    ],
  },
  'Q17_01' : {
    'type' : 'highlight',
    'title' : 'Slippery slope',
    'question' : 'Highlight slippery slope #1',
    'anchored': true,
    'requires' : {
      'target' : 'Q17',
      'oneOf' : ['1.17.01', '1.17.02']
    },
  },
  'Q17_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Slippery slope',
    'question' : 'Highlight slippery slope #2',
    'anchored': true,
    'requires' : {
      'target' : 'Q17',
      'oneOf' : ['1.17.01', '1.17.02']
    },
  },
  'Q18' : {
    'type' : 'radio',
    'title' : 'Scare tactics',
    'question' : 'Does the author exaggerate the dangers of a situation (the appeal to fear fallacy)?',
    'anchored': false,
    'choices' : [
      '1.18.01:Yes',
      '1.18.02:Sort of',
      '1.18.03:No',
    ],
  },
  'Q18_01' : {
    'type' : 'highlight',
    'title' : 'Scare tactics',
    'question' : 'Highlight scare tactic #1',
    'anchored': true,
    'requires' : {
      'target' : 'Q18',
      'oneOf' : ['1.18.01', '1.18.02']
    },
  },
  'Q18_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Scare tactics',
    'question' : 'Highlight scare tactic #2',
    'anchored': true,
    'requires' : {
      'target' : 'Q18',
      'oneOf' : ['1.18.01', '1.18.02']
    },
  },
  'Q19' : {
    'type' : 'radio',
    'title' : 'Naturalistic fallacy',
    'question' : 'Does the author suggest something is good because it is natural, or bad because it is not natural?',
    'anchored': false,
    'choices' : [
      '1.19.01:Yes',
      '1.19.02:Sort of',
      '1.19.03:No',
    ],
  },
  'Q19_01' : {
    'type' : 'highlight',
    'title' : 'Naturalistic fallacy',
    'question' : 'Highlight naturalistic fallacy #1',
    'anchored': true,
    'requires' : {
      'target' : 'Q19',
      'oneOf' : ['1.19.01', '1.19.02']
    },
  },
  'Q19_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Naturalistic fallacy',
    'question' : 'Highlight naturalistic fallacy #2',
    'anchored': true,
    'requires' : {
      'target' : 'Q19',
      'oneOf' : ['1.19.01', '1.19.02']
    },
  },
  'Q20' : {
    'type' : 'radio',
    'title' : 'Emotionally charged tone',
    'question' : 'Does the author use outrage, snark, celebration, horror, etc?',
    'anchored': false,
    'choices' : [
      '1.20.01:Yes',
      '1.20.02:Sort of',
      '1.20.03:No',
    ],
  },
  'Q20_01' : {
    'type' : 'highlight',
    'title' : 'Emotionally charged tone',
    'question' : 'Highlight charged tone #1',
    'anchored': true,
    'requires' : {
      'target' : 'Q20',
      'oneOf' : ['1.20.01', '1.20.02']
    },
  },
  'Q20_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Emotionally charged tone',
    'question' : 'Highlight charged tone #2',
    'anchored': true,
    'requires' : {
      'target' : 'Q20',
      'oneOf' : ['1.20.01', '1.20.02']
    },
  },
  'Q21' : {
    'type' : 'radio',
    'title' : 'Exaggerated claims',
    'question' : 'Does the author exaggerate claims?',
    'anchored': false,
    'choices' : [
      '1.21.01:Yes',
      '1.21.02:Sort of',
      '1.21.03:No',
    ],
  },
  'Q21_01' : {
    'type' : 'highlight',
    'title' : 'Exaggerated claims',
    'question' : 'Exaggerate claim #1',
    'anchored': true,
    'requires' : {
      'target' : 'Q21',
      'oneOf' : ['1.21.01', '1.21.02']
    },
  },
  'Q21_02' : {
    'type' : 'highlight',
    'canskip' : true,
    'title' : 'Exaggerated claims',
    'question' : 'Exaggerate claim #2',
    'anchored': true,
    'requires' : {
      'target' : 'Q21',
      'oneOf' : ['1.21.01', '1.21.02']
    },
  },
  'Q22' : {
    'type' : 'radio',
    'title' : 'Causal claims',
    'question' : 'Is a general or singular causal claim made?',
    'anchored': false,
    'choices' : [
      '1.22.01:General causal claim',
      '1.22.02:Singular causal claim',
      '1.22.03:No causal claim',
    ],
  },
  'Q22_01' : {
    'type' : 'highlight',
    'title' : 'Causal claims',
    'question' : 'General causal claim',
    'anchored': true,
    'requires' : {
      'target' : 'Q22',
      'equal' : '1.22.01',
    },
  },
  'Q22_02' : {
    'type' : 'highlight',
    'title' : 'Causal claims',
    'question' : 'Singular causal claim',
    'anchored': true,
    'requires' : {
      'target' : 'Q22',
      'equal' : '1.22.02',
    },
  },
  'Q23' : {
    'type' : 'checkbox',
    'title' : 'Evidence for primary claim',
    'question' : 'What evidence is given for the primary claim?',
    'choices' : [
      '1.23.01:Correlation',
      '1.23.02:Cause precedes effect',
      '1.23.03:The correlation appears across multiple independent contexts',
      '1.23.04:A plausible mechanism is proposed',
      '1.23.05:An experimental study was conducted (natural experiments OK)',
      '1.23.06:Experts are cited',
      '1.23.07:Other kind of evidence',
      '1.23.08:No evidence given',
    ],
    'anchored' : false,
  },  
  'Q24' : {
    'type' : 'textarea',
    'title' : 'Evidence for primary claim',
    'question' : 'What other kind of evidence do they give?',
    'requires' : {
      'target' : 'Q23',
      'equal' : '1.23.07',
    },
    'anchored' : false,
  },  
  'Q25' : { 
    'type' : 'radio',
    'title' : 'Evidence for primary claim',
    'question' : 'How convincing do you find the evidence for the primary claim?',
    'requires' : {
      'target' : 'Q23',
      'oneOf' : ['1.23.01','1.23.02','1.23.03','1.23.04','1.23.05','1.23.06','1.23.07'],
    },
    'choices' : [
      '1.25.01:Very Convincing',
      '1.25.02:Fairly Convincing',
      '1.25.03:Moderately Convincing',
      '1.25.04:Slightly Convincing',
      '1.25.05:Not at All Convincing',
    ]
  },

}

const SKIPPED = 'questionSkipped'

const appVars = {
  URL: undefined,        // url acquired on page load
  SELECTION: undefined,  // remaining vars (selector info) passed in messages from host page
  PREFIX: undefined,
  START: undefined,
  END: undefined,
}

var lastEventData = {}

const appWindowName = 'CredCo'

const CredCoTag = 'CredCoContentAnnotation'

// display login fields only if needed
if (! hlib.getToken()) {
  hlib.createApiTokenInputForm(hlib.getById('tokenContainer'))
  hlib.createUserInputForm(hlib.getById('userContainer'))
}

function groupChangeHandler() {
  hlib.setSelectedGroup()
  updateAnswers()
}

hlib.createGroupInputForm(hlib.getById('groupContainer'))
setTimeout( () => {
  hlib.getById('groupsList').setAttribute('onchange', 'groupChangeHandler()')
  }, 1000)

function hasNewMessageData(event) {
  let _data = JSON.stringify(event.data)
  let isNew = _data !== JSON.stringify(lastEventData)
  lastEventData = event.data
  return isNew
}

function isOurMessage(event) {
  return event.data.tags && event.data.tags.indexOf(CredCoTag) != -1
}

// listen for messages from the host
window.addEventListener('message', function(event) {
  if ( event.data === 'CloseCredCo' ) {
    window.close()
  } else if (isOurMessage(event)) {
    app(event)
  }
});

function app(event) {

  appVars.URL = hlib.gup('url')
  
  if (event.data && event.data.exact) {
    appVars.SELECTION = event.data.exact
    appVars.PREFIX = event.data.prefix
    appVars.START = event.data.start
    appVars.END = event.data.end
  } 

  if (event.type === 'load') {
    createQuestions() // do this once only per page load
  }

  if (event.type=== 'load' || hasNewMessageData(event)) {
    // fetch answers from annotation layer, deposit in the `questions` object
    updateAnswers()
    setTimeout(updatePriorQuestions, 1000)
    setTimeout(refreshUI, 1000)
  }

}

function updatePriorQuestions() {
  let questionKeys = getQuestionKeys()
  questionKeys.forEach(questionKey => {
    let question = questions[questionKey]
    if (question.type === 'radio' && question.answer) {
      setRadioVal(questionKey, question.answer)
    } else if (question.type === 'checkbox' && question.answer) {
      setCheckboxVals(questionKey, question.answer.split(','))
    } else if (question.type === 'textarea' && question.answer) {
      setTextAreaVal(questionKey, question.answer)
    } else if (question.type === 'highlight' && question.answer) {
      setHighlightVal(questionKey, question.answer)
    }
    let questionElement = hlib.getById(questionKey)
    questionElement.style.display = 'block'
  })
}

// get base params for an annotation with selectors
function getApiBaseParams() {
  return {
    group: hlib.getGroup(),
    username: hlib.getUser(),
    uri: appVars.URL,
    exact: appVars.SELECTION,
    prefix: appVars.PREFIX,
    start: appVars.START,
    end: appVars.END,
    tags: [CredCoTag],
  }
}

// get base params for an annotation with no selectors
function getApiBaseParamsForPageNote() {
  return {
    group: hlib.getGroup(),
    username: hlib.getUser(),
    uri: appVars.URL,
    tags: [CredCoTag],
  }
}

function refreshUI() {

  let paramsDiv = hlib.getById('params');

  let clearSelectionButton = appVars.SELECTION 
    ? `<button onclick="clearSelection()">clear</button>`
    : ''
  paramsDiv.innerHTML = `
     <p><b>Article</b>: <a href="${appVars.URL}">${appVars.URL}</a></p>
     <p>
       <b>Selection</b>: 
       "<span class="credCoSelection">${appVars.SELECTION ? appVars.SELECTION : ""}</span>" 
       ${clearSelectionButton}
     </p>`

  showOnlyAnsweredQuestions()
  
  let nextQuestion = showFirstUnansweredQuestion()
  if (nextQuestion === 'done') {
    hlib.getById('formContainer').style.display = 'none'
    hlib.getById('questions').style.display = 'none'
    hlib.getById('params').style.display = 'none'
    hlib.getById('postAnswerButton').style.display = 'none'
    hlib.getById('skipButton').style.display = 'none'
    hlib.getById('finished').innerHTML = '<b>Done!</b>'
  } else {
    hlib.getById('postAnswerButton').style.display = 'inline'
  }
  
  window.scrollTo(0, document.body.scrollHeight);
}

function findFirstUnansweredQuestionKey() {
  let questionKeys = getQuestionKeys()
  for (let i=0; i<questionKeys.length; i++) {
    let key = questionKeys[i]
    if (! questions[key].answer) {
      return(key)
      break;
    }
  }
  return 'none'
}

function subdueAnsweredQuestions() {
  let keys = getQuestionKeys()
  let firstUnansweredKey = findFirstUnansweredQuestionKey()
  let firstUnansweredIndex = keys.indexOf(firstUnansweredKey)
  for (let i = 0; i < firstUnansweredIndex; i++) {
    let questionElement = hlib.getById(keys[i])
    questionElement.style.color = 'gray'
  }
}

function getQuestions() {
  return document.querySelectorAll('.question')
}

function getQuestionKeys() {
  return Object.keys(questions).sort()
}

function countQuestions() {
  return getQuestions().length
}

function findLastQuestionKey() {
  let questionKeys = getQuestionKeys()
  return questionKeys.slice(-1)
}

function showOnlyAnsweredQuestions() {
  if (! countQuestions()) {
    return
  }
  let questionKeys = getQuestionKeys()
  questionKeys.forEach(key => {
    let question = questions[key]
    if (question.answer && question.answer !== SKIPPED) {
      hlib.getById(key).style.display = 'block'
    } else {
      hlib.getById(key).style.display = 'none'
    }
  })
  subdueAnsweredQuestions()
}

function showFirstUnansweredQuestion() {
  if (countQuestions() == 0) {
    return 'waiting'
  }
  let key = findFirstUnansweredQuestionKey()
  if (key === 'none') {
    return 'done'
  }
  let question = questions[key]
  let requireSpec = question.requires
  let questionElement = hlib.getById(key)

  hlib.getById('skipButton').style.display = question.canskip ? 'inline' : 'none'

  if (requireSpec) {
    let shouldShow = false
    let requiredAnswer = questions[requireSpec.target].answer
    if (requiredAnswer) {
      if (requireSpec.oneOf) {
        // requireSpec.target's answer is among a set of specified answers
        shouldShow = requireSpec.oneOf.indexOf(requiredAnswer) != -1
      } else if (requireSpec.equal) {
        // requireSpec.target's answer is equal to a specified answer
        shouldShow = requireSpec.equal === requiredAnswer
      } else if (requireSpec.contains) {
        // requireSpec.target's answer is a list that contains a specified answer
        requiredAnswerList = requiredAnswer.split(',').map(a => { return a.trim() })
        shouldShow = requiredAnswerList.indexOf(requireSpec.contains) != -1
      } else if (requireSpec.hasOwnProperty('exists') && requiredAnswer !== SKIPPED) {
        // requireSpec.target's answer is not null
        shouldShow = requiredAnswer != null
      }
    }
    if (! shouldShow) {
      question.answer = SKIPPED
      questionElement.style.display = 'none'
      return showFirstUnansweredQuestion()
    }
  }
  questionElement.style.display = 'block'
  return key
}

function questionBoilerplate(questionKey) {
  let question = questions[questionKey]
  let asterisk = ''
  if (question.anchored) {
    asterisk = '<span class="asterisk" title="Selection required">*</span>'
  }
  let html = `
    <div class="question" id="${questionKey}">
    <h2>${question.title}${asterisk}</h2>
    <h3>${question.question}</h2>`
  if (question.prompt) {
    html += `<p><i>${question.prompt}</i></p>`
  }
  return html
}

function createQuestions() {
  let questionKeys = getQuestionKeys()
  questionKeys.forEach(key => {
    let question = questions[key]
    if (! hlib.getById(key)) {
      if (question.type === 'radio') {
        createRadioQuestion(key)
      } else if (question.type === 'checkbox') {
        createCheckboxQuestion(key)
      } else if (question.type === 'textarea') {
        createTextAreaQuestion(key)
      } else if (question.type === 'highlight') {
        createHighlightQuestion(key)
      } else {
        console.log('unexpected question type')
      }
    }
  })
}

function updateAnswers() {
  let opts = {
    method: 'GET',
    url: `https://hypothes.is/api/search?uri=${appVars.URL}&tags=${CredCoTag}&group=${hlib.getGroup()}&limit=200`,
    headers: {
      Authorization: 'Bearer ' + hlib.getToken(),
      'Content-Type': 'application/json;charset=utf-8'
    },
  }
  hlib.httpRequest(opts)
    .then( data => {
      let tags = {}
      let rows = JSON.parse(data.response).rows
      let output = `<p>${rows.length} annotations</p>`
      let questionKeys = getQuestionKeys()
      questionKeys.forEach(questionKey => {
        questions[questionKey].answer = null
      })
      rows.forEach(row => {
        let anno = hlib.parseAnnotation(row)
        let tags = anno.tags
        tags.forEach(tag => {
          if (questionKeys.indexOf(tag) != -1 ) {
            let questionKey = tag
            let _tags = anno.tags
            _tags.forEach(_tag => {
              if (_tag.indexOf('answer:') == 0) {
                let question = questions[questionKey]
                if (question.type === 'textarea') {
                  // the answer was posted as a tag, answer:text, so use what's wrapped by [[ ]] in the annotations text element
                  question.answer = anno.text.match('\\[\\[([^]+)\]\]')[1]   
                } else if (question.type === 'highlight') {
                  // the answer was posted as a tag, answer:annotation, so use the annotation's URL
                  question.answer = `https://hypothes.is/a/${anno.id}`
                  setHighlightVal(questionKey, question.answer)
                } else {
                  // the answer is in the tag
                  question.answer = _tag.replace('answer:','')
                }
              }
            })
          }
        })
      })
    })
    .then ( () => {
      refreshUI()
    })
}

function postSkippedAnswer() {
  postAnswer(true)
}

function postAnswer(skip) {

  if (! hlib.getToken()) {
    alert('Please provide your Hypothesis username and API token, then retry.')
    return
  }

  let questionKey = findFirstUnansweredQuestionKey()

  let question = questions[questionKey]

  if (question.anchored && ! appVars.SELECTION && ! skip) {
    alert('selection required')
    setTimeout( refreshUI, 500)
    return
  }

  let params
  if (skip || ! question.anchored) {
    params = getApiBaseParamsForPageNote()
  } else {
    params = getApiBaseParams()
  }
  
  const type = question.type
  const title = question.title
  
  var answer

  if (type === 'radio') {
    answer = getRadioVal(questionKey)
  } else if (type === 'checkbox') {
    answer = getCheckboxVals(questionKey)
  } else if (type === 'textarea') {
    answer = getTextAreaVal(questionKey)
  } else if (type === 'highlight') {
    answer = getHighlightVal(questionKey)
  }

  if (answer || skip) {
    params.text = `<p><b>${title}</b></p><p><i>${question.question}</i></p>`
    if ( question.type === 'radio' || question.type === 'checkbox') {
      let choices = JSON.stringify(question.choices, null, 2)
      params.text += `<p>Choices: <div>${choices}</div></p>`
    }
    params.tags.push(questionKey)
    if ( question.type === 'textarea') {
      // post answer in annotation body wrapped in [[ ]]
      params.text += `<p>Answer: [[${answer}]]</p>`
      // signal in a tag that the answer is in text
      params.tags.push('answer:text')
    } else if (question.type === 'highlight') {
        if (skip) {
          // signal that  the question was skipped
          params.tags.push('answer:skipped')
        } else {
          // signal that the answer is part of the annotation
          params.tags.push('answer:annotation')
        }
    } else {
      // include short answer codes, like 1.08.03, directly in a tag
      params.tags.push('answer:' + answer)
    }
    let payload = hlib.createAnnotationPayload(params)
    let token = hlib.getToken()
    hlib.postAnnotation(payload, token)
      .then( (data) => {
        let response = JSON.parse(data.response)
      })
      .then( () => {
        setTimeout(updateAnswers, 1000)
      })
  } else {
    alert('no answer')
  }

}

function clearViewer() {
  hlib.getById('viewer').innerHTML = ''
  hlib.getById('userContainer').innerHTML = ''
  hlib.getById('tokenContainer').innerHTML = ''
}

function clearSelection() {
  appVars.SELECTION = ''
  refreshUI()
}

function createRadioQuestion(questionKey) {
  let question = questions[questionKey]
  let html = questionBoilerplate(questionKey)
  let choices = question.choices
  choices.forEach(choice => {
    let _choice = choice.split(':')
    html += `
      <div class="choice">
        <input type="radio" name="${questionKey}" value="${_choice[0]}">  ${_choice[1]} 
      </div>`
  })
  html += '</div>'
  hlib.getById('questions').innerHTML += html
}

function getRadioVal(questionKey) {
  var val;
  var radios = document.getElementsByName(questionKey);
  for (var i=0, len=radios.length; i<len; i++) {
    if ( radios[i].checked ) { 
      val = radios[i].value; 
      break; 
    }
  }
  return val; 
}

function setRadioVal(questionKey, val) {
  var radios = document.getElementsByName(questionKey);
  for (var i=0, len=radios.length; i<len; i++) {
    radios[i].disabled = true
    if ( radios[i].value === val) { 
      radios[i].checked = true
    }
  }
}

function createCheckboxQuestion(questionKey) {
  let question = questions[questionKey]
  let html = questionBoilerplate(questionKey)
  let choices = question.choices
  choices.forEach(choice => {
    let _choice = choice.split(':')
    html += `
      <div class="choice">
        <input type="checkbox" name="${questionKey}" value="${_choice[0]}">  ${_choice[1]} 
      </div>`
  })
  html += '</div>'
  hlib.getById('questions').innerHTML += html
}

function getCheckboxVals(questionKey) {
  var val = []
  var checkboxes = document.getElementsByName(questionKey);
  for (var i=0, len=checkboxes.length; i<len; i++) {
    if ( checkboxes[i].checked ) { 
      val.push(checkboxes[i].value)
    }
  }
  return val.join(', ')
}

function setCheckboxVals(questionKey, vals) {
  var checkboxes = document.getElementsByName(questionKey);
  for (var i=0, len=checkboxes.length; i<len; i++) {
    checkboxes[i].disabled = true
    vals.forEach(val => {
      val = val.trim()
      if ( val === checkboxes[i].value ) {
        checkboxes[i].checked = true
      }
    })
  }
}

function createTextAreaQuestion(questionKey) {
  let question = questions[questionKey]
  let html = questionBoilerplate(questionKey)
  html += `<textarea name="${questionKey}"></textarea>`
  hlib.getById('questions').innerHTML += html
}

function getTextAreaVal(questionKey) {
  return document.getElementsByName(questionKey)[0].value
}

function setTextAreaVal(questionKey, val) {
  let textbox = document.getElementsByName(questionKey)[0]
  textbox.value = val
  textbox.disabled = true
}

function createHighlightQuestion(questionKey) {
  let question = questions[questionKey]
  let html = questionBoilerplate(questionKey)
  html += `<div name="${questionKey}"></div>`
  hlib.getById('questions').innerHTML += html
}

function getHighlightVal(questionKey) {
  return appVars.SELECTION
}

function setHighlightVal(questionKey, val) {
  document.getElementsByName(questionKey)[0].innerHTML = val
}

const loadEvent = new MessageEvent('load', {})
window.onload = app(loadEvent)

