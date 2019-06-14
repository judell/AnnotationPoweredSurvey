// inspired by https://github.com/joewalnes/jstinytest
// promisified for this project

const red =  '#ff9999';

let testName

const testGroup = '4mBXKB2X'

localStorage.setItem('h_group', testGroup)

function logError(msg) {
  document.body.innerHTML += `<div>${msg}</div`
  document.body.style.backgroundColor = red
}

function log(msg) {
  document.body.innerHTML += `<div class="logMessage">${msg}</div>`
}

window.alert = function(str) {
  localStorage.setItem('h_alert', str)
}

async function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

const TinyTest = {

  run: async function(tests) {

  await delay(3)

  const testNames = Object.keys(tests)

  for (i = 0; i < testNames.length; i++) {
    const testName = testNames[i]
    log(testName)
    await tests[testName]()
  }

  log('done')

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