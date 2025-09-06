pipeline {
  agent any

  options {
    // Fail fast if a command fails
    skipDefaultCheckout(true)
    timestamps()
  }

  environment {
    // Using Docker-in-Docker sidecar exposed on the internal network
    DOCKER_HOST = 'tcp://dind:2375'

    // ---- EDIT THESE ----
    AWS_REGION   = 'us-east-2'                 // set your region
    ACCOUNT_ID   = '325204716598'              // 12-digit account ID (no dashes)
    ECS_CLUSTER  = 'devops-challenge-cluster'     // ECS cluster name
    FRONTEND_SVC = 'devops-challenge-frontend-service'// ECS service name (frontend)
    BACKEND_SVC  = 'devops-challenge-backend-service' // ECS service name (backend)

    // Derived ECR repo URIs
    FRONTEND_REPO = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/frontend"
    BACKEND_REPO  = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/backend"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
stage('Discover DinD IP') {
  steps {
    script {
      def ip = sh(
        script: "getent hosts dind | awk '{print \$1}'",
        returnStdout: true
      ).trim()
      if (!ip) { error 'Could not resolve DinD IP' }
      env.DOCKER_HOST = "tcp://${ip}:2375"
      sh "echo Using DOCKER_HOST=${env.DOCKER_HOST}"
    }
  }
}

    stage('Docker sanity') {
      steps {
        sh '''
          set -e
          echo "DOCKER_HOST=$DOCKER_HOST"
          docker version
          docker ps
        '''
      }
    }

    stage('Build Docker images') {
      steps {
        sh '''
          set -e
          docker build -t frontend:latest ./frontend
          docker build -t backend:latest  ./backend
        '''
      }
    }

    stage('Login to AWS & ECR') {
      environment {
        // Jenkins credential of type "AWS Credentials"
        // Change to your real credentialsId
        AWS_CREDS = credentials('aws-cred')
      }
      steps {
        sh '''
          set -e
          aws --version
          aws configure set default.region "$AWS_REGION"

          # Create repos if they don't exist (idempotent)
          aws ecr describe-repositories --repository-names frontend  >/dev/null 2>&1 || \
            aws ecr create-repository --repository-name frontend
          aws ecr describe-repositories --repository-names backend   >/dev/null 2>&1 || \
            aws ecr create-repository --repository-name backend

          # Login to ECR
          aws ecr get-login-password --region "$AWS_REGION" | \
            docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        '''
      }
    }

    stage('Tag & Push images') {
      steps {
        sh '''
          set -e
          docker tag frontend:latest "$FRONTEND_REPO:latest"
          docker tag backend:latest  "$BACKEND_REPO:latest"
          docker push "$FRONTEND_REPO:latest"
          docker push "$BACKEND_REPO:latest"
        '''
      }
    }

    stage('Deploy - force new ECS deployments') {
      steps {
        sh '''
          set -e
          # Force rolling deploys of both services
          aws ecs update-service --cluster "$ECS_CLUSTER" --service "$FRONTEND_SVC" --force-new-deployment --region "$AWS_REGION"
          aws ecs update-service --cluster "$ECS_CLUSTER" --service "$BACKEND_SVC"  --force-new-deployment --region "$AWS_REGION"
        '''
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
