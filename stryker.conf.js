module.exports = function (config) {
  config.set({
    mutate: ['lib/**/*.js'],
    files: ['index.js', 'lib/**/*.js', 'test/unit/*-spec.js'],
    mochaOptions: {
      files: ['test/unit/**/*-spec.js']
    },
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
