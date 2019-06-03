// runs from a bookmarklet, injects a relay into a host page, sends messages to the app
// javascript:(function(){var d=document; var s=d.createElement('script');s.setAttribute('src','https://jonudell.info/hlib/StandaloneAnchoring.js');d.head.appendChild(s); s=d.createElement('script');s.setAttribute('src','https://jonudell.info/h/AnnotationPoweredSurvey/gather.js');d.head.appendChild(s);})();


// no let or const for these three, otherwise cannot remove them when app window is closed, which means bookmarklet cannot restart

AnnotationSurveyTag = 'AnnotationPoweredSurvey' // must match counterpart in index.js
AnnotationSurveyWindow = undefined  
AnnotationSurveyIntervalId = setInterval(remove, 1000)

// when there's a selection, move the activator button to it
document.addEventListener('mouseup', e => {
  const selection = document.getSelection()
  const activator = document.querySelector('#activator')
  if ( selection.type==='Range' ) {
    activator.style.visibility = 'visible'
    activator.style.left = `${e.pageX}px`
    activator.style.top = `${e.pageY}px`
  } else {
    activator.style.visibility = 'hidden'
    if (AnnotationSurveyWindow) {
      const message = {
        'selection':'',
        'tags':  [AnnotationSurveyTag]
      }
      AnnotationSurveyWindow.postMessage(message, '*')
    }
  }
})

function remove() {
  if (AnnotationSurveyWindow && AnnotationSurveyWindow.closed) {
    document.getElementById('activator').remove()
    gather = undefined
    delete gather
    AnnotationSurveyWindow = undefined
    delete AnnotationSurveyWindow
    AnnotationSurveyTag = undefined
    delete AnnotationSurveyTag
    clearInterval(AnnotationSurveyIntervalId)
  }
}

window.onbeforeunload = function() {
  AnnotationSurveyWindow.postMessage('CloseAnnotationSurvey', '*')
}

function gather() {

  // always pass the url at which the bookmarklet activated
  const params = {
    uri: location.href,
  }

  const selection = document.getSelection()
  
  if ( selection.type==='Range' ) {
    // we have a selection to use as the target of an annotation
    // gather the selector info
    const range = selection.getRangeAt(0)

    const quoteSelector = anchoring.TextQuoteAnchor.fromRange(document.body, range)
    params.exact = quoteSelector.exact
    params.prefix = quoteSelector.prefix

    params.selection = params.exact
    
    const positionSelector = anchoring.TextPositionAnchor.fromRange(document.body, range)
    params.start = positionSelector.start
    params.end = positionSelector.end
  } else {
    params.selection = ''
  }

  // common tag for all annotations related to this instance of the tool
  // the app expects this tag on a message 
  params.tags = [AnnotationSurveyTag]

  // call the app with:
  //   always: uri of page on which the bookmarklet was activated
  //   maybe: selectors for a selection on the page
  if (!AnnotationSurveyWindow) {   // open the app
    let activator = document.createElement('div')
    activator.id = 'activator'
    activator.style['position'] = 'absolute'
    activator.style['visibility'] = 'hidden'
    activator.style['z-index'] = 999999999
    activator.innerHTML = '<button onclick="gather()">send selection</button>'
    document.body.insertBefore(activator, document.body.firstChild)
    let opener = `width=700,height=900,top=${window.screenTop},left=${window.screenLeft + window.innerWidth}`
    AnnotationSurveyWindow = window.open( `https://jonudell.info/h/AnnotationPoweredSurvey/index.html?url=${location.href}`, '_annotationSurvey', opener)
  } else {
    AnnotationSurveyWindow.postMessage(params, '*')  // talk to the app
    document.querySelector('#activator').style.visibility = 'hidden'
    document.getSelection().removeAllRanges()
  }
}

gather()

 