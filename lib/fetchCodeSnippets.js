const Promise = require('bluebird')
const request = require('request-promise')

function fetchCodeSnippets (juiceShopUrl) {
  return new Promise((resolve, reject) => {
    request({ url: juiceShopUrl + '/snippets', json: true }).then(({ challenges }) => {
      const snippets = {}
      if (challenges) {
        for (let i=0; i < challenges.length; i++) {
          request({ url: juiceShopUrl + '/snippets/' + challenges[i], json: true }).then(({ snippet }) => {
            snippets[challenges[i]] = snippet
          }).catch(({ message }) => {
            reject(new Error('Failed to fetch snippet from API! ' + message))
          })
        }
      }
      resolve(snippets)
    }).catch(({ message }) => {
      reject(new Error('Failed to fetch snippet challenges from API! ' + message))
    })
  })
}

module.exports = fetchCodeSnippets
