import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;
jasmine.getEnv().clearReporters()
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayStacktrace: StacktraceOption.NONE
    }
  })
);
