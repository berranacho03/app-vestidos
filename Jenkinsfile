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
          any
        sh 'npm ci --legacy-peer-deps'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Optional Lint') {
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
