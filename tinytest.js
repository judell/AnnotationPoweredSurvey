// inspired by https://github.com/joewalnes/jstinytest
// promisified for this project

const green = '#99ff99';

const red =  '#ff9999';

let testName

let testMode = true

function logError(msg) {
  document.body.innerHTML += `<div>${msg}</div`
  document.body.style.backgroundColor = red
}

window.alert = function(str) {
  localStorage.setItem('h_alert', str)
}

const TinyTest = {

  run: function(tests) {

    testName = 'init'
    tests[testName]()
    .then( () => {
    testName = 'publicGroupIsGone'
    tests[testName]()
    .then( () => {
    testName = 'postFirstAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postSecondAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postThirdAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postFourthAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postFifthAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postSixthAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postSeventhAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postEighthAnswer'
    tests[testName]()
    .then ( () => {
    testName = 'postNinthAnswerWithUnchangedSelectionPopsAlert'
    tests[testName]()
    .then ( () => {
    testName = 'postNinthAnswerWithChangedSelection'
    tests[testName]()
    .then ( () => {
    testName = 'endRepeat'
    tests[testName]()
    .then ( () => {
    testName = 'cleanup'
    tests[testName]()
    }) }) }) }) }) }) }) }) }) }) }) }) })

  setTimeout(function() { // Give document a chance to complete
    if (window.document && document.body) {
      document.body.style.backgroundColor = green
    }
  }, 0)

 },

  assert: function(value) {
    if (!value) {
      let msg = `${testName}: 'no value'`
      console.error(msg)
      logError(msg)
    }
  },

  assertEquals: function(expected, actual) {
    if (expected != actual) {
      let msg = `${testName}: expected ${expected}, actual ${actual}`
      console.error(msg)
      logError(msg)
    }
  },

  assertNotEquals: function(expected, actual) {
    if (expected == actual) {
      let msg = `${testName}: expected ${expected} !== ${actual}`
      console.error(msg)
      logError(msg)
    }
  },

  
};

const fail                = TinyTest.fail,
      assert              = TinyTest.assert,
      assertEquals        = TinyTest.assertEquals,
      eq                  = TinyTest.assertEquals, // alias for assertEquals
      assertNotEquals     = TinyTest.assertNotEquals,
      assertStrictEquals  = TinyTest.assertStrictEquals,
      tests               = TinyTest.run;