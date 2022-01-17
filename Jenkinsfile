@Library('pipeline') _

def version = '22.1000'


node ('test-autotest86') {
    checkout_pipeline("22.1000/kua/change_controls_other")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}