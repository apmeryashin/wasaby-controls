@Library('pipeline') _

def version = '22.1100'


node ('controls') {
    checkout_pipeline("22.1100/pea/un-parallele")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}