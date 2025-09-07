pipeline {
    agent any

    environment {
    DOCKER_BUILDKIT = '1'
            DOCKER_HOST = 'tcp://dind:2375'
            AWS_DEFAULT_REGION = 'us-east-2'   // change if needed
            ACCOUNT_ID = '325204716598'
            FRONTEND_REPO = "${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/frontend"
            BACKEND_REPO  = "${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/backend"
    }
    stages {
        stage('Checkout code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker images') {
            steps {
                script {
                    retry(3) {
      sh 'docker build -t frontend:latest ./frontend'
    }
                    sh 'docker build -t backend:latest ./backend'
                }
            }
        }

        stage('Authenticate to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'e1512144-f4d0-405b-bde5-98ff3edba713']]) {
                    script {
                        sh '''
                            aws --version
                            aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $FRONTEND_REPO
                            aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $BACKEND_REPO
                        '''
                    }
                }
            }
        }

        stage('Tag and Push images to ECR') {
            steps {
                script {
                    sh '''
                        docker tag frontend:latest $FRONTEND_REPO:latest
                        docker tag backend:latest $BACKEND_REPO:latest

                        docker push $FRONTEND_REPO:latest
                        docker push $BACKEND_REPO:latest
                    '''
                }
            }
        }

        stage('Update ECS services') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'e1512144-f4d0-405b-bde5-98ff3edba713']]) {
                    script {
                        sh '''
                            aws ecs update-service --cluster devops-challenge-cluster --service devops-challenge-frontend-service --force-new-deployment --region $AWS_REGION
                            aws ecs update-service --cluster devops-challenge-cluster --service devops-challenge-backend-service --force-new-deployment --region $AWS_REGION
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
