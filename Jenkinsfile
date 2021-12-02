@Library('pipeline') _

def version = '22.1000'


node ('controls') {
    checkout_pipeline("22.1000/feature/may/delay-run-tests-021221")
    //checkout_pipeline("rc-${version}")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}