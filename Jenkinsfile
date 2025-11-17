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
        sh '''
          docker run --rm \
            -v ${WORKSPACE}:${WORKSPACE} \
            -w ${WORKSPACE} \
            node:18-alpine \
            sh -c "npm ci --legacy-peer-deps"
        '''
        sh 'npm run lint || true'
      }
    }
    stage('Archive') {
      steps {
        sh '''
          docker run --rm \
            -v ${WORKSPACE}:${WORKSPACE} \
            -w ${WORKSPACE} \
            node:18-alpine \
            sh -c "npm run build"
        '''
        archiveArtifacts artifacts: 'public/**, .next/**', allowEmptyArchive: true
      }
    }
  }
  post {
    always {
      sh '''
        docker run --rm \
          -v ${WORKSPACE}:${WORKSPACE} \
          -w ${WORKSPACE} \
          node:18-alpine \
          sh -c "npm run lint || true"
      '''
      echo 'Pipeline finished'
    }
  }
}