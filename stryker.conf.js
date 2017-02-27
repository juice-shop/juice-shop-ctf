// stryker.conf.js
module.exports = function (config) {
  config.set({
    files: [
      // Add your files here, this is just an example:
      { pattern: 'index.js', mutated: true, included: false },
      { pattern: 'lib/**/*.js', mutated: true, included: false },
      'test/unit/*-spec.js'
    ],
    testRunner: 'mocha',
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    reporter: ['html', 'progress']
  })
}
