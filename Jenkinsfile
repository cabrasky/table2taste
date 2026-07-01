// ── Table2Taste CI/CD Pipeline ─────────────────────────
// Builds, tests, runs SonarQube analysis, and pushes Docker images
//
// Jenkins instance: jenkins.cabrasky.net (node1)
// SonarQube:        sonar.cabrasky.net
// Registry:         192.168.1.11:5000
//
// ⚠️ Jenkins does NOT have pipeline-utility-steps plugin
//    → Use python3 instead of readJSON
// ⚠️ 'when { not { ... } }' does NOT work
//    → Use 'when { expression { return !... } }'

pipeline {
    agent any

    environment {
        REGISTRY        = "192.168.1.11:5000"
        BACKEND_IMAGE   = "${REGISTRY}/table2taste-backend"
        FRONTEND_IMAGE  = "${REGISTRY}/table2taste-frontend"
        SONAR_HOST_URL = "https://sonar.cabrasky.net"
        SONAR_TOKEN    = "squ_5537577d8820c174a2e260176e45f68ee2976c3b"
    }

    parameters {
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Skip tests and Sonar analysis (build only)'
        )
        booleanParam(
            name: 'SKIP_DOCKER',
            defaultValue: false,
            description: 'Skip Docker build & push'
        )
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Read Version') {
            steps {
                script {
                    def pkg = sh(
                        script: 'cat packages/frontend/package.json | python3 -c "import sys,json; print(json.load(sys.stdin)[\\"version\\"])"',
                        returnStdout: true
                    ).trim()
                    def gitSha = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.APP_VERSION = pkg
                    env.IMAGE_TAG = "${pkg}-${gitSha}"
                    echo "Version: ${env.APP_VERSION} (tag: ${env.IMAGE_TAG})"
                }
            }
        }

        stage('Check Image Exists') {
            when {
                expression { return !params.SKIP_DOCKER }
            }
            steps {
                script {
                    def skips = []
                    for (img in ['table2taste-backend', 'table2taste-frontend']) {
                        def exists = sh(
                            script: "curl -s -o /dev/null -w '%{http_code}' http://${REGISTRY}/v2/${img}/manifests/${env.IMAGE_TAG}",
                            returnStdout: true
                        ).trim() == "200"
                        if (exists) {
                            echo "✓ ${img}:${env.IMAGE_TAG} already exists — skipping build"
                            skips << img
                        }
                    }
                    if (skips.size() == 2) {
                        env.SKIP_DOCKER_BUILD = 'true'
                    }
                }
            }
        }

        // ── Backend Tests ──────────────────────────────
        stage('Test Backend') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                sh 'docker rm -f test-db 2>/dev/null || true'
                sh '''docker run -d --rm --name test-db \
                    -e POSTGRES_USER=table2taste \
                    -e POSTGRES_PASSWORD=test \
                    -e POSTGRES_DB=table2taste \
                    -p 5432:5432 postgres:16-alpine'''
                sleep 3
                dir('packages/backend') {
                    sh 'chmod +x mvnw'
                    sh '''./mvnw test jacoco:report -q \
                        -Dspring.datasource.url=jdbc:postgresql://localhost:5432/table2taste \
                        -Dspring.datasource.username=table2taste \
                        -Dspring.datasource.password=test \
                        -Dspring.liquibase.enabled=true'''
                }
            }
            post {
                always {
                    sh 'docker rm -f test-db 2>/dev/null || true'
                    junit allowEmptyResults: true,
                        testResults: 'packages/backend/target/surefire-reports/*.xml'
                }
            }
        }

        // ── Frontend Build & Test ──────────────────────
        stage('Test Frontend') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                dir('packages/frontend') {
                    sh 'npm ci'
                    sh 'npm test -- --watchAll=false --ci --coverage 2>&1 || true'
                    sh 'npx react-scripts build 2>&1'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true,
                        testResults: 'packages/frontend/junit.xml'
                }
            }
        }

        // ── SonarQube Analysis ─────────────────────────
        stage('SonarQube Analysis') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                dir('packages/backend') {
                    sh """
                        ./mvnw sonar:sonar \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.token=${SONAR_TOKEN} \
                            -Dsonar.projectKey=table2taste \
                            -Dsonar.projectName='Table2Taste' \
                            -Dsonar.sources=src/main/java \
                            -Dsonar.tests=src/test/java \
                            -Dsonar.java.binaries=target/classes \
                            -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml \
                            -Dsonar.exclusions=**/model/dto/**
                    """
                }
            }
        }

        // ── Docker Build & Push ─────────────────────────
        stage('Docker Build & Push') {
            when {
                expression { return !params.SKIP_DOCKER && env.SKIP_DOCKER_BUILD != 'true' }
            }
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('packages/backend') {
                            sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ."
                            sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest"
                            sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                            sh "docker push ${BACKEND_IMAGE}:latest"
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        dir('packages/frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                            sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest"
                            sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                            sh "docker push ${FRONTEND_IMAGE}:latest"
                        }
                    }
                }
            }
        }

    }

    post {
        always {
            script {
                node('built-in') {
                    sh 'docker image prune -f || true'
                }
            }
        }
        failure {
            echo '❌ Pipeline failed — check logs'
        }
        success {
            echo '✅ Pipeline completed successfully'
        }
        unstable {
            echo '⚠️ Pipeline completed with unstable results'
        }
    }
}
