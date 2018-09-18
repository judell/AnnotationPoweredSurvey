// runs from a bookmarklet, injects a relay into a host page, sends messages to the app

var AnnotationSurveyWindow

var AnnotationSurveyTag = 'AnnotationSurveyCredCo'

// when there's a selection, move the activator button to it
document.addEventListener('mouseup', e => {
  let selection = document.getSelection()
  let activator = hlib.getById('activator')
  if ( selection.type==='Range' ) {
    activator.style.visibility = 'visible'
    activator.style.left = `${e.pageX}px`
    activator.style.top = `${e.pageY}px`
  } else {
    activator.style.visibility = 'hidden'
    if (AnnotationSurveyWindow) {
      let message = {
        'selection':'',
        'tags':  [AnnotationSurveyCredCo]
      }
      AnnotationSurveyWindow.postMessage(message, '*')
    }
  }
})

function remove() {
  if (AnnotationSurveyWindow && AnnotationSurveyWindow.closed) {
    document.getElementById('activator').remove()
    gather = undefined
    AnnotationSurveyWindow = undefined
    clearInterval(intervalId)
  }
}

// if the window we opened is now closed, uninstall
var intervalId = setInterval(remove, 1000)

window.onbeforeunload = function() {
  AnnotationSurveyWindow.postMessage('CloseAnnotationSurvey', '*')
}

function gather() {

  // always pass the url at which the bookmarklet activated
  let params = {
    uri: location.href,
  }

  let selection = document.getSelection()
  
  if ( selection.type==='Range' ) {
    // we have a selection to use as the target of an annotation
    // gather the selector info
    let range = selection.getRangeAt(0)

    let quoteSelector = anchoring.TextQuoteAnchor.fromRange(document.body, range)
    params.exact = quoteSelector.exact
    params.prefix = quoteSelector.prefix

    params.selection = params.exact
    
    let positionSelector = anchoring.TextPositionAnchor.fromRange(document.body, range)
    params.start = positionSelector.start
    params.end = positionSelector.end
  } else {
    params.selection = ''
  }

  // common tag for all CredCo-related annotations
  // the app expects this tag on a message 
  params.tags = [AnnotationSurveyTag]

  let encodedParams = encodeURIComponent(JSON.stringify(params));

  // call the app with:
  //   always: uri of page on which the bookmarklet was activated
  //   maybe: selectors for a selection on the page
  if (!AnnotationSurveyWindow) {   // open the app
    let activator = document.createElement('div')
    activator.id = 'activator'
    activator.style['position'] = 'absolute'
    activator.style['visibility'] = 'hidden'
    activator.style['z-index'] = 999999999
    activator.innerHTML = '<button title="send selection" onclick="gather()">send selection</button>'
    document.body.insertBefore(activator, document.body.firstChild)
    let opener = "width=700, height=900, toolbar=yes, top=-1000"
    //AnnotationSurveyWindow = window.open( `https://jonudell.info/h/CredCoContentAnnotation/index.html?url=${location.href}`, '_credco', opener)
    AnnotationSurveyWindow = window.open( `http://10.0.0.9:8000/index.html?url=${location.href}`, '_credco', opener)
    
  } else {
    AnnotationSurveyWindow.postMessage(params, '*') // talk to the app
    hlib.getById('activator').style.visibility = 'hidden'
    document.getSelection().removeAllRanges()
  }
}

gather()

 