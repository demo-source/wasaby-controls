@Library('pipeline') _

def version = '20.6000'


node ('controls1') {
    checkout_pipeline("rc-${version}")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}