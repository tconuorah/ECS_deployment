pipeline {
    agent any

    environment {
            AWS_REGION      = 'us-east-2'
            AWS_ACCOUNT_ID  = '325204716598'
            ECR_REGISTRY    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
            FRONTEND_REPO   = "${ECR_REGISTRY}/devops-challenge-frontend"
            BACKEND_REPO    = "${ECR_REGISTRY}/devops-challenge-backend"
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
                    sh 'docker build -t frontend:latest ./frontend'
                    sh 'docker build -t backend:latest ./backend'
                }
            }
        }

        stage('Diagnose AWS identity') {
            steps {
            withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-ecr-credentials']]) {
                    sh '''
                        set -e
                        echo "AWS CLI version:" && aws --version
                        echo "Caller identity:"
                        aws sts get-caller-identity
                        echo "ECR registries (region ${AWS_REGION}):"
                        aws ecr describe-registry --region "${AWS_REGION}" || true
                    '''
                    }
                }
             }

            stage('Authenticate to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-ecr-credentials']]) {
                sh '''
                    set -e
                    aws ecr get-login-password --region "${AWS_REGION}" \
                    | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
                '''
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
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: '325204716598']]) {
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
