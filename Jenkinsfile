pipeline {
  agent {
    docker {
      image 'node:18-alpine'
      args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
  }
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
