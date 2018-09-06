// annotated spec: http://jonudell.info/h/CredCoContentAnnotation/pe_schema-credweb3.html

const appVars = {
  URL: undefined,        // url acquired on page load
  SELECTION: undefined,  // remaining vars (selector info) passed in messages from host page
  PREFIX: undefined,
  START: undefined,
  END: undefined,
}

let lastEventData = {}

let lastPostedSelection = ''

const appWindowName = 'AnnotationSurvey'

const AnnotationSurveyTag = 'AnnotationSurveyCredCo'

// display login fields only if needed
if (! hlib.getToken()) {
  hlib.createApiTokenInputForm(hlib.getById('tokenContainer'))
  hlib.createUserInputForm(hlib.getById('userContainer'))
}

function groupChangeHandler() {
  hlib.setSelectedGroup()
  reload()
}

hlib.createGroupInputForm(hlib.getById('groupContainer'))
setTimeout( () => {
  let groupsList = hlib.getById('groupsList')
  groupsList.querySelectorAll('option')[0].remove()
  groupsList.setAttribute('onchange', 'groupChangeHandler()')
  }, 1000)

function hasNewMessageData(event) {
  let _data = JSON.stringify(event.data)
  let isNew = _data !== JSON.stringify(lastEventData)
  lastEventData = event.data
  return isNew
}

function isOurMessage(event) {
  return event.data.tags && event.data.tags.indexOf(AnnotationSurveyTag) != -1
}

// listen for messages from the host
window.addEventListener('message', function(event) {
  if ( event.data === 'CloseAnnotationSurvey' ) {
    window.close()
  } else if (isOurMessage(event)) {
    app(event)
  }
});

function reload() {
  app(loadEvent)
}

function app(event) {

  appVars.URL = hlib.gup('url')
  
  if (event.data && event.data.exact) {
    appVars.SELECTION = event.data.exact
    appVars.PREFIX = event.data.prefix
    appVars.START = event.data.start
    appVars.END = event.data.end
  } 

  if (event.type === 'load') {
    console.log(event.type, event.data)
    renderQuestions()
  }

  if (event.type === 'load' || hasNewMessageData(event)) {
    console.log(event.type, event.data)
    // fetch answers from annotation layer, deposit in the `questions` object
    updateAnswers()
  }

}

function updatePriorQuestions() {
  console.log('updatePriorQuestions called')
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
function getApiBaseParamsForAnnotation() {
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
    tags: [AnnotationSurveyTag],
  }
}

function refreshUI() {
  console.log('refreshUI called')
  let paramsDiv = hlib.getById('params');

  let clearSelectionButton = appVars.SELECTION  ? 
    `<button onclick="clearSelection()">clear</button>`  : ''

  paramsDiv.innerHTML = `
     <p><b>Article</b>: <a href="${appVars.URL}">${appVars.URL}</a></p>
     <p>
       <b>Selection</b>: 
       "<span class="AnnotationSurveySelection">${appVars.SELECTION ? appVars.SELECTION : ""}</span>" 
       ${clearSelectionButton}
     </p>`

  showOnlyAnsweredQuestions()

  let nextQuestionKey = showFirstUnansweredQuestion()

  if (nextQuestionKey === 'done') {
    hlib.getById('formContainer').style.display = 'none'
    hlib.getById('questions').style.display = 'none'
    hlib.getById('params').style.display = 'none'
    hlib.getById('postAnswerButton').style.display = 'none'
    //hlib.getById('skipButton').style.display = 'none'
    hlib.getById('finished').innerHTML = '<b>Done!</b>'
  } else {
    hlib.getById('postAnswerButton').style.display = 'inline'
  }

  subdueAnsweredQuestions()

  window.scrollTo(0, document.body.scrollHeight);
}

function isUnanswered(questionKey) {
  let question = questions[questionKey]
  return ( ! question.answer && shouldShow(questionKey) )
}

function findFirstUnansweredQuestionKey() {
  let questionKeys = getQuestionKeys()
  for (let i=0; i<questionKeys.length; i++) {
    let key = questionKeys[i]
    if (isUnanswered(key)) {
      return key
    }
  }
  return 'none'
}

function findLastAnsweredRepeatableQuestionKey() {
  let keys = getQuestionKeys()
  let repeatableKeys = keys.filter(k => {
    let question = questions[k]
    return question.answer && question.repeatable
  })
  if (repeatableKeys.length) {
    console.log('findLastAnsweredRepeatableQuestionKey returning ', repeatableKeys.slice(-1)[0])
    return repeatableKeys.slice(-1)[0]
  } else {
    console.log('findLastAnsweredRepeatableQuestionKey returning none')
    return 'none'
  }
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
    if (question.answer) {
      hlib.getById(key).style.display = 'block'
    } else {
      hlib.getById(key).style.display = 'none'
    }
  })
}

function shouldShow(questionKey) {
  let question = questions[questionKey]
  let requireSpec = question.requires
  let shouldShow = requireSpec ? false : true
  if (requireSpec) {
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
      } else if (requireSpec.hasOwnProperty('exists')) {
        // requireSpec.target's answer is not null
        shouldShow = requiredAnswer != null
      } 
    }
  }
  return shouldShow
}

function showFirstUnansweredQuestion() {
  if (countQuestions() == 0) {
    return 'waiting'
  }
  let questionKey = findFirstUnansweredQuestionKey()
  if (questionKey === 'none') {
    return 'done'
  }
  
  let question = questions[questionKey]
  let questionElement = hlib.getById(questionKey)

  //hlib.getById('skipButton').style.display = question.canskip ? 'inline' : 'none'

  if (! shouldShow(questionKey)) {
    questionElement.style.display = 'none'
    return showFirstUnansweredQuestion()
  }

  questionElement.style.display = 'block'
  return questionKey
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

function renderQuestion(question, key) {
  if (question.type === 'radio') {
    renderRadioQuestion(key)
  } else if (question.type === 'checkbox') {
    renderCheckboxQuestion(key)
  } else if (question.type === 'textarea') {
    renderTextAreaQuestion(key)
  } else if (question.type === 'highlight') {
    renderHighlightQuestion(key)
  } else {
    console.log('unexpected question type')
  }
}

function renderQuestions() {
  console.log('renderQuestions', getQuestionKeys())
  let questionKeys = getQuestionKeys()
  questionKeys.forEach(key => {
    let question = questions[key]
    if (! hlib.getById(key)) {
      renderQuestion(question, key)
    }
  })
}

function endRepeat() {
  setEndSequenceTag()
}

function setEndSequenceTag() {
  let questionKey = findLastAnsweredRepeatableQuestionKey()
  let opts = {
    method: 'GET',
    url: `https://hypothes.is/api/search?group=${hlib.getGroup()}&tags=${questionKey}`,
    headers: {
      Authorization: 'Bearer ' + hlib.getToken(),
      'Content-Type': 'application/json;charset=utf-8'
    },
  }
  hlib.httpRequest(opts)
    .then( data => {
      let anno = hlib.parseAnnotation(JSON.parse(data.response).rows[0])
      let tags = anno.tags
      tags.push('EndSequence')
      let payload = {
        tags : tags,
      }
      hlib.updateAnnotation(anno.id, hlib.getToken(), JSON.stringify(payload))
        .then ( (data) => {
          console.log(JSON.parse(data.response))
          let nextQuestionKey = incrementQuestionKey(questionKey)
          delete questions[nextQuestionKey]
          hlib.getById(nextQuestionKey).remove()
          reload()
        })
    })
}

function hasEndSequenceTag(rows, questionKey) {
  let found = rows.filter(r => { 
    return r.tags.indexOf(questionKey) != -1 && r.tags.indexOf('EndSequence') != -1
  })
  return found.length
}

function hasRepeatedAnswer(rows, questionKey) {
  return rows.map( row => {
    return row.tags.indexOf(questionKey)
  })
  .filter( x => {
    return (x == 1) })
  .length
}

function extractAnswer(tag, questionKey, anno) {
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
    question.answer = tag.replace('answer:','')
  }
}

function updateAnswers() {
  console.log('updateAnswers called')
  let opts = {
    method: 'GET',
    url: `https://hypothes.is/api/search?uri=${appVars.URL}&tags=${AnnotationSurveyTag}&group=${hlib.getGroup()}&limit=200`,
    headers: {
      Authorization: 'Bearer ' + hlib.getToken(),
      'Content-Type': 'application/json;charset=utf-8'
    },
  }
  hlib.httpRequest(opts)
    .then( data => {
      let rows = JSON.parse(data.response).rows
      console.log('updateAnswers got', rows.length)
      let output = `<p>${rows.length} annotations</p>`
      let questionKeys = getQuestionKeys()
      rows.forEach(row => {
        let anno = hlib.parseAnnotation(row)
        let tags = anno.tags
        tags.forEach(tag => {
          if (questionKeys.indexOf(tag) != -1 ) {
            let questionKey = tag
            let _tags = anno.tags
            _tags.forEach(_tag => {
              if (_tag.indexOf('answer:') == 0) {
                extractAnswer(_tag, questionKey, anno)
              }
            })
          }
        })
      })
    return rows
    })
    .then ( (rows) => {
      console.log('rows after update answers', rows)
      let lastAnsweredRepeatableKey = findLastAnsweredRepeatableQuestionKey()
      console.log('updateAnswers: lastAnsweredRepeatableKey', lastAnsweredRepeatableKey)
      let endSequence = hasEndSequenceTag(rows, lastAnsweredRepeatableKey)
      console.log('updateAnswers: hasEndSequenceTag', endSequence)
      if (lastAnsweredRepeatableKey !== 'none' && ! endSequence) {
        lastAnswer = questions[lastAnsweredRepeatableKey].answer
        let newQuestionKey = addRepeatQuestion(lastAnsweredRepeatableKey)
        console.log('added', newQuestionKey)
        if (hasRepeatedAnswer(rows, newQuestionKey)) {
            updateAnswers()
        } 
      }
      else {
        hlib.getById('endRepeatButton').style.display = 'none'
        console.log('at end of sequence', lastAnsweredRepeatableKey)
      }        
      console.log( 'calling updatePriorQuestions and refreshUI after updateAnswers')    
      updatePriorQuestions()
      refreshUI()
    })
}

function incrementQuestionKey(questionKey) {
  let str = questionKey.match(/_(\d+)/)[1]
  let num = parseInt(str)
  num += 1
  return questionKey.replace(str, num.toString().padStart(2,'0'))
}

function insertAfter(newQuestionKey, baseQuestionKey) {
  let baseQuestionElement = hlib.getById(baseQuestionKey)
  let newQuestionElement = hlib.getById(newQuestionKey)
  baseQuestionElement.parentNode.insertBefore(newQuestionElement, baseQuestionElement.nextSibling);
}

function addRepeatQuestion(baseQuestionKey) {
  let baseQuestion = questions[baseQuestionKey]
  let newQuestionKey = incrementQuestionKey(baseQuestionKey)
  console.log(`addRepeatQuestion: ${newQuestionKey}`)
  questions[newQuestionKey] = Object.assign({}, baseQuestion)
  let newQuestion = questions[newQuestionKey]
  newQuestion.answer = null
  renderQuestion(newQuestion, newQuestionKey)
  insertAfter(newQuestionKey, baseQuestionKey)
  hlib.getById('endRepeatButton').style.display = 'inline'
  return newQuestionKey
}
  
function postAnswer() {
  return new Promise( (resolve) => {
    if (! hlib.getToken()) {
      alert('Please provide your Hypothesis username and API token, then retry.')
      return
    }

    let questionKey = findFirstUnansweredQuestionKey()

    let question = questions[questionKey]

    if (question.anchored && ! appVars.SELECTION) {
      alert('selection required')
      setTimeout( refreshUI, 500)
      return
    }

    if (question.newSelectionRequired && lastPostedSelection === appVars.SELECTION) {
      alert('new selection required')
      setTimeout( refreshUI, 500)
      resolve()
      return
    }

    let params
    if (question.anchored) {
      lastPostedSelection = appVars.SELECTION
      params = getApiBaseParamsForAnnotation()
    } else {
      params = getApiBaseParamsForPageNote()
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

    if (answer) {
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
        params.tags.push('answer:annotation')
      } else {
        // include short answer codes, like 1.08.03, directly in a tag
        params.tags.push('answer:' + answer)
      }
      console.log(params)
      let payload = hlib.createAnnotationPayload(params)
      let token = hlib.getToken()
      hlib.postAnnotation(payload, token)
        .then( data => {
          setTimeout(reload, 1000)
          resolve(JSON.stringify(data))
        })
    } else {
      alert('no answer')
    }
  })
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

function renderRadioQuestion(questionKey) {
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

function renderCheckboxQuestion(questionKey) {
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

function renderTextAreaQuestion(questionKey) {
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

function renderHighlightQuestion(questionKey) {
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
window.onload = reload()

