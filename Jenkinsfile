pipeline {
  agent any
  
  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh '''
          docker run --rm \
            -v ${WORKSPACE}:${WORKSPACE} \
            -w ${WORKSPACE} \
            node:18-alpine \
            sh -c "npm ci --legacy-peer-deps"
        '''
      }
    }
    
    stage('Build') {
      steps {
        sh '''
          docker run --rm \
            -v ${WORKSPACE}:${WORKSPACE} \
            -w ${WORKSPACE} \
            node:18-alpine \
            sh -c "npm run build"
        '''
      }
    }
    
    stage('Optional Lint') {
      steps {
        sh '''
          docker run --rm \
            -v ${WORKSPACE}:${WORKSPACE} \
            -w ${WORKSPACE} \
            node:18-alpine \
            sh -c "npm run lint || true"
        '''
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