// annotated spec: http://jonudell.info/h/CredCoContentAnnotation/pe_schema-credweb3.html

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
  let params = getApiBaseParamsForPageNote()
  params.exact = appVars.SELECTION
  params.prefix = appVars.PREFIX
  params.start = appVars.START
  params.end = appVars.END
  return params
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

