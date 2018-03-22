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
    mutator: 'javascript',
    reporter: ['html', 'progress'],
    htmlReporter: {
      baseDir: 'build/reports/mutation'
    }
  })
  if (process.env.TRAVIS_BUILD_NUMBER) {
    config.reporter = ['clear-text', 'progress']
  }
}
