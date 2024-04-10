def app
pipeline {
    agent any
    environment {
        ENV_TYPE = "production"
        PORT = 3300
        NAMESPACE = "instagram-api"
        REGISTRY_HOSTNAME = "gamayunov10"
        PROJECT = "instagram-api"
        SERVICE="instagram-api"
        REGISTRY = "registry.hub.docker.com"
        DEPLOYMENT_NAME = "instagram-api-deployment"
        IMAGE_NAME = "${env.BUILD_ID}_${env.ENV_TYPE}_${env.GIT_COMMIT}"
        DOCKER_BUILD_NAME = "${env.REGISTRY_HOSTNAME}/${env.PROJECT}:${env.IMAGE_NAME}"
    }

    stages {
        stage('Clone repository') {
            steps {
                checkout scm
            }
        }
        stage('Unit tests') {
            steps {
                script {
                    sh "pnpm install"
                    sh "pnpm run test"
                }
            }
        }
        stage('e2e tests') {
            steps {
                script {
                    sh "pnpm run test:e2e"
                }
            }
        }
        stage('Build docker image') {
            steps {
                echo "Build image started..."
                    script {
                       app = docker.build("${env.DOCKER_BUILD_NAME}", "--build-arg service=${env.SERVICE} --build-arg port=${env.PORT} -f ./apps/${env.SERVICE}/Dockerfile ./")
                    }
                echo "Build image finished..."
            }
        }
        stage('Push docker image') {
             steps {
                 echo "Push image started..."
                     script {
                        docker.withRegistry("https://${env.REGISTRY}", 'inctagram-org') {
                            app.push("${env.IMAGE_NAME}")
                        }
                     }
                 echo "Push image finished..."
             }
       }
       stage('Delete image local') {
             steps {
                 script {
                    sh "docker rmi -f ${env.DOCKER_BUILD_NAME}"
                 }
             }
        }
        stage('Preparing deployment') {
             steps {
                 echo "Preparing started..."
                     sh 'ls -ltr'
                     sh 'pwd'
                     sh "chmod +x ./apps/${env.SERVICE}/preparingDeploy.sh"
                     sh "./apps/${env.SERVICE}/preparingDeploy.sh ${env.REGISTRY_HOSTNAME} ${env.PROJECT} ${env.IMAGE_NAME} ${env.DEPLOYMENT_NAME} ${env.PORT} ${env.NAMESPACE}"
                     sh "cat ./apps/${env.SERVICE}/deployment.yaml"
             }
        }
        stage('Deploy to Kubernetes') {
             steps {
                 withKubeConfig([credentialsId: 'prod-kubernetes']) {
                    sh "kubectl apply -f ./apps/${env.SERVICE}/deployment.yaml"
                    sh "kubectl rollout status deployment/${env.DEPLOYMENT_NAME} --namespace=${env.NAMESPACE}"
                    sh "kubectl get services -o wide"
                 }
             }
        }
    }
}
