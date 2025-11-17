pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install') {
      steps {
        sh 'npm ci --legacy-peer-deps'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Optional Lint') {
      steps {
        // Don't fail pipeline if lint isn't configured
        sh 'npm run lint || true'
      }
    }
    stage('Archive') {
      steps {
        archiveArtifacts artifacts: 'public/**, .next/**', allowEmptyArchive: true
      }
    }
  }
  post {
    always {
      echo 'Pipeline finished'
    }
  }
}
