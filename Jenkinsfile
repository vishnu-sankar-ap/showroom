pipeline {
  agent any

  options { timestamps() }

  triggers { pollSCM('H/2 * * * *') }

  environment {
    AWS_DEFAULT_REGION = 'ap-south-1'
    ACCOUNT_ID         = '805909320592'
    REGISTRY           = "${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
    TAG                = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build images') {
      steps {
        sh '''
          docker build -t $REGISTRY/showroom-backend:$TAG ./backend
          docker build -t $REGISTRY/showroom-frontend:$TAG ./frontend
        '''
      }
    }

    stage('Smoke test') {
      steps {
        sh 'docker run --rm $REGISTRY/showroom-backend:$TAG python -c "import app.main; print(\'backend imports OK\')"'
      }
    }

    stage('Security scan (Trivy)') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          sh '''
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL --exit-code 0 $REGISTRY/showroom-backend:$TAG
          '''
        }
      }
    }

    stage('Push to ECR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          sh '''
            aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $REGISTRY
            docker push $REGISTRY/showroom-backend:$TAG
            docker push $REGISTRY/showroom-frontend:$TAG
          '''
        }
      }
    }

    stage('Deploy to k3s') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
          file(credentialsId: 'k3s-kubeconfig', variable: 'KUBECONFIG')
        ]) {
          sh '''
            kubectl apply -f k8s/00-namespace.yaml

            kubectl -n showroom create secret docker-registry ecr-secret \
              --docker-server=$REGISTRY --docker-username=AWS \
              --docker-password="$(aws ecr get-login-password --region $AWS_DEFAULT_REGION)" \
              --dry-run=client -o yaml | kubectl apply -f -
            kubectl -n showroom patch serviceaccount default -p '{"imagePullSecrets":[{"name":"ecr-secret"}]}'

            rm -rf deploy && cp -r k8s deploy
            sed -i "s|image: showroom-backend:1.0|image: $REGISTRY/showroom-backend:$TAG|" deploy/03-backend.yaml
            sed -i "s|image: showroom-frontend:1.0|image: $REGISTRY/showroom-frontend:$TAG|" deploy/04-frontend.yaml

            kubectl apply -f deploy/
            kubectl -n showroom rollout status deployment/backend --timeout=240s
            kubectl -n showroom rollout status deployment/frontend --timeout=240s
          '''
        }
      }
    }
  }

  post {
    success { echo "Deployed build ${BUILD_NUMBER}" }
    always  { sh 'docker logout $REGISTRY || true' }
  }
}