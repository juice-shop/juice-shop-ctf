module.exports = function (config) {
  config.set({
    files: [
      { pattern: 'index.js', mutated: false, included: false },
      { pattern: 'lib/**/*.js', mutated: true, included: false },
      'test/unit/*-spec.js'
    ],
    testRunner: 'mocha',
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    reporter: ['html', 'progress']
  })
}
