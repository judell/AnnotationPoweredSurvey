// annotated spec: http://jonudell.info/h/CredCoContentAnnotation/pe_schema-credweb3.html

const AnnotationSurveyTag = 'AnnotationPoweredSurvey' // must match counterpart in gather.js

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

const loadEvent = new MessageEvent('load', {})

async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
  await delay(seconds)
}

function groupChangeHandler() {
  hlib.setSelectedGroup()
  softReload()
}

function setUser() {
  localStorage.setItem('h_user', document.querySelector('#usercontainer input').value)
}

function getUser() {
  return localStorage.getItem('h_user')
}

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

function softReload() {
  app(loadEvent)
}

async function app(event) {
  
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
    await updateAnswers()
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
      setHighlightVal(questionKey, question.answerQuote)
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
    group: hlib.getSelectedGroup(),
    username: getUser(),
    uri: appVars.URL,
    tags: [AnnotationSurveyTag],
  }
}

function refreshUI() {
  console.log('refreshUI called')
  let paramsDiv = hlib.getById('params');

  paramsDiv.innerHTML = `
     <p><b>Article</b>: <a href="${appVars.URL}">${appVars.URL}</a></p>
     <p>
       <div><b>Selection</b>: 
         "<span class="AnnotationSurveySelection">${appVars.SELECTION ? appVars.SELECTION : ""}</span>"
       </div>
       <div class="clearSelection" onclick="clearSelection()"
         style="display:${appVars.SELECTION ? 'block' : 'none'}">clear selection</div>
     </p>`

  showOnlyAnsweredQuestions()

  hideInactiveRedoButtons()

  let nextQuestionKey = showFirstUnansweredQuestion()

  if (nextQuestionKey === 'done') {
    hlib.getById('formContainer').style.display = 'none'
    hlib.getById('questions').style.display = 'none'
    hlib.getById('params').style.display = 'none'
    hlib.getById('postAnswerButton').style.display = 'none'
    hlib.getById('finished').innerHTML = '<b>Done!</b>'
  } else {
    hlib.getById('postAnswerButton').style.display = 'inline'
  }

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

function findLastAnsweredQuestionKey() {
  let lastKey = 'none'
  let questionKeys = getQuestionKeys()
  questionKeys.forEach ( key => {
    if (questions[key].answer) {
      lastKey = key
    }
  })
  return lastKey
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

function hideInactiveRedoButtons() {
  let keys = getQuestionKeys()
  let lastAnsweredQuestionKey = findLastAnsweredQuestionKey()
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    let redoButton = hlib.getById(`redo_${key}`)
    if ( redoButton && key === lastAnsweredQuestionKey ) {
      redoButton.style.display = 'block'
      continue
    } else {
    redoButton.style.display = 'none'
    }
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
  subdueAnsweredQuestions()
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
  
  let questionElement = hlib.getById(questionKey)

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
  let redoButtonId = `redo_${key}`
  if (! hlib.getById(redoButtonId)) {
    hlib.getById(key).innerHTML += 
      `<button id="${redoButtonId}"
       class="redoButton" onclick="redoQuestion('${key}')">redo this question
       </button>`
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

// user pressed the next-question button shown when a question is repeatable
// mark the corresponding annotation as end-of-sequence
async function endRepeat() {
  let questionKey = findLastAnsweredRepeatableQuestionKey()
  let opts = {
    method: 'GET',
    url: `https://hypothes.is/api/search?group=${hlib.getSelectedGroup()}&tags=${questionKey}`,
    headers: {
      Authorization: 'Bearer ' + hlib.getToken(),
      'Content-Type': 'application/json;charset=utf-8'
    },
  }
  let data = await hlib.httpRequest(opts)
  const anno = hlib.parseAnnotation(JSON.parse(data.response).rows[0])
  const tags = anno.tags
  tags.push('EndSequence')
  const payload = {
        tags : tags,
  }
  data = await hlib.updateAnnotation(anno.id, hlib.getToken(), JSON.stringify(payload))
  console.log(JSON.parse(data.response))
  const nextQuestionKey = incrementQuestionKey(questionKey)
  delete questions[nextQuestionKey]
  hlib.getById(nextQuestionKey).remove()
  softReload()
}

// rows is the set of annotations returned from
// /api/search?uri=${appVars.URL}&tags=${AnnotationSurveyTag}&group=${hlib.getGroup()}
function hasEndSequenceTag(rows, questionKey) {
  let found = rows.filter(r => { 
    return r.tags.indexOf(questionKey) != -1 && r.tags.indexOf('EndSequence') != -1
  })
  return found.length
}

// does the set of annotations contain an answer to the question?
function hasAnswer(rows, questionKey) {
  let foundAnswers = rows.map( row => {
    return row.tags.indexOf(questionKey) != -1
  })
  foundAnswers.forEach(answer => {
    if (answer) {
      return true
    }
  })
  return false
}

// extract the answer from an annotation returned by the url/tag/question query
// and save it in the questions object
function extractAnswer(tag, questionKey, anno) {
  let question = questions[questionKey]
  question.answerId = anno.id
  if (question.type === 'textarea') {
    // the answer was posted as a tag, answer:text, so use what's wrapped by [[ ]] in the annotation's text element
    question.answer = anno.text.match('\\[\\[([^]+)\]\]')[1] // find what's between [[ and ]]
  } else if (question.type === 'highlight') {
    // the answer was posted as a tag, answer:annotation, so use the annotation's URL
    question.answer = `https://hypothes.is/a/${anno.id}` // for storage
    question.answerQuote = anno.quote // for display
  } else {
    // the answer is in the tag
    question.answer = tag.replace('answer:','')
  }
}

function updateAnswers() {
  async function worker() {
    console.log('updateAnswers called')
    let opts = {
      method: 'GET',
      url: `https://hypothes.is/api/search?uri=${appVars.URL}&tags=${AnnotationSurveyTag}&group=${hlib.getSelectedGroup()}&limit=200`,
      headers: {
        Authorization: 'Bearer ' + hlib.getToken(),
        'Content-Type': 'application/json;charset=utf-8'
      },
    }
    // answers are stored in the annotation layer
    // to fetch the set of answers for the current instance of the app, 
    // search for the url/tag/group combo that identifies the set
    const data = await hlib.httpRequest(opts)
    const questionKeys = getQuestionKeys()
    const rows = JSON.parse(data.response).rows
    //console.log('updateAnswers got', rows.length)
    rows.forEach(row => {
      const anno = hlib.parseAnnotation(row)
      const tags = anno.tags
      // look for an annotation with a tag that matches one of the questions
      tags.forEach(tag => {
        if (questionKeys.indexOf(tag) != -1 ) {
          let questionKey = tag
          let _tags = anno.tags
          // look for an answer tag in the tags for each matched annotation
          _tags.forEach(_tag => {
            if (_tag.indexOf('answer:') == 0) {
              extractAnswer(_tag, questionKey, anno) // update the answers object with answer stored in the annotation's tag
            }
          })
        }
      })
    })
    //console.log('rows after update answers', rows) 
    const lastAnsweredRepeatableKey = findLastAnsweredRepeatableQuestionKey()
    //console.log('updateAnswers: lastAnsweredRepeatableKey', lastAnsweredRepeatableKey)
    const endSequence = hasEndSequenceTag(rows, lastAnsweredRepeatableKey)
    //console.log('updateAnswers: hasEndSequenceTag', endSequence)
    // look for the most recently-answered repeatable question that isn't tagged as end of sequence
    if (lastAnsweredRepeatableKey !== 'none' && ! endSequence) {
      let newQuestionKey = addRepeatQuestion(lastAnsweredRepeatableKey)
      console.log('added', newQuestionKey)
      if (hasAnswer(rows, newQuestionKey)) {
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
    return Promise.resolve()
  }
  worker()
}


// assumes a question key of the form Qnn_mm, returns Qnn_mm+1
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

// clone and add a repeatable question
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
    async function worker() {
      if (! hlib.getToken()) {
        alert('Please provide your Hypothesis username and API token, then retry.')
        return
      }
      const questionKey = findFirstUnansweredQuestionKey()
      const question = questions[questionKey]
      if (question.anchored && ! appVars.SELECTION) {
        alert('selection required')
        setTimeout( refreshUI, 500)
        return
      }
      if (question.newSelectionRequired && lastPostedSelection === appVars.SELECTION) {
        alert('new selection required')
        setTimeout( refreshUI, 500)
        resolve() // so, when called from the test harness, can continue with the next test
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
      let answer
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
        if ( type === 'radio' || type === 'checkbox') {
          let choices = JSON.stringify(question.choices, null, 2)
          params.text += `<p>Choices: <div>${choices}</div></p>`
        }
        params.tags.push(questionKey)
        if ( type === 'textarea') {
          // post answer in annotation body wrapped in [[ ]]
          params.text += `<p>Answer: [[${answer}]]</p>`
          // signal in a tag that the answer is in text
          params.tags.push('answer:text')
        } else if (type === 'highlight') {
          params.tags.push('answer:annotation')
        } else {
          // include short answer codes, like 1.08.03, directly in a tag
          params.tags.push('answer:' + answer)
        }
        console.log(params)
        const payload = hlib.createAnnotationPayload(params)
        const data = await hlib.postAnnotation(payload, hlib.getToken())
        setTimeout( softReload, 2000 )
        resolve()
      } else {
        alert('no answer')
      }
    }
  worker()
  })
}


async function redoQuestion(key) {
  console.log(`redoQuestion: ${key}`)
  let answerId = questions[key].answerId
  await hlib.deleteAnnotation(answerId)
  delete questions[key].answer
  delete questions[key].answerId
  hlib.getById('questions').innerHTML = ''
  await waitSeconds(1)
  renderQuestions()
  softReload()
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
    let _choice = choice.split(':') // example choice: '1.22.01:General causal claim'
    html += `
      <div class="choice">
        <input type="radio" name="${questionKey}" value="${_choice[0]}">  ${_choice[1]} 
      </div>`
  })
  html += '\n</div>' // matches begin tag in questionBoilerplate
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

async function boot() {
  const userContainer = hlib.getById('userContainer')
  hlib.createApiTokenInputForm(hlib.getById('tokenContainer'))
  hlib.createFacetInputForm(userContainer, 'Hypothesis username matching API token')
  userInput = userContainer.querySelector('input')
  userInput.setAttribute('onchange', 'setUser()')
  userInput.value = getUser()
  await hlib.createGroupInputForm(hlib.getById('groupContainer'))
  let groupsList = hlib.getById('groupsList')
  groupsList.querySelectorAll('option')[0].remove() // suppress Public
  groupsList.setAttribute('onchange', 'groupChangeHandler()')
  softReload()
}

window.onload = boot

