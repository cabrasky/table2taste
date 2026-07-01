// ── Table2Taste CI/CD + Auto-Preview Pipeline ────────────
// Jenkins: jenkins.cabrasky.net
// Registry: 192.168.1.11:5000
//
// 🎯 main      → CI + production deploy (namespace: table2taste)
// 🎯 any branch → CI + preview deploy (namespace: table2taste-preview-<subdomain>)
// 🧹 branch deleted → auto-cleanup by Jenkins orphaned item strategy
//
// ⚠️ No pipeline-utility-steps plugin → use python3 instead of readJSON
// ⚠️ 'when { not { ... } }' doesn't work → use expression { return !... }

pipeline {
    agent any

    environment {
        REGISTRY        = "192.168.1.11:5000"
        BACKEND_IMAGE   = "${REGISTRY}/table2taste-backend"
        FRONTEND_IMAGE  = "${REGISTRY}/table2taste-frontend"
        KUBECONFIG      = "/var/lib/jenkins/.kube/config"
        SONAR_HOST_URL  = "https://sonar.cabrasky.net"
        SONAR_TOKEN     = "squ_5537577d8820c174a2e260176e45f68ee2976c3b"
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
        booleanParam(
            name: 'SKIP_DEPLOY',
            defaultValue: false,
            description: 'Skip K8s deploy (CI only)'
        )
    }

    stages {

        // ── 1. Checkout ─────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ── 2. Read Version + Compute Subdomain ──────────
        stage('Resolve Metadata') {
            steps {
                script {
                    // Read version from frontend package.json
                    def pkg = sh(
                        script: 'cat packages/frontend/package.json | python3 -c "import sys,json; print(json.load(sys.stdin)[\"version\"])"',
                        returnStdout: true
                    ).trim()
                    def gitSha = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.APP_VERSION = pkg
                    env.IMAGE_TAG = "${pkg}-${gitSha}"

                    // Compute subdomain from branch name
                    // Rules:
                    //   - main → no preview (production)
                    //   - redesign/<subdomain> → use <subdomain> directly
                    //   - PR-# → pr-#
                    //   - preview/<name> → <name>
                    //   - other → sanitized branch name
                    def branch = env.BRANCH_NAME
                    def subdomain = ""

                    if (branch == "main") {
                        subdomain = "main"
                    } else if (branch ==~ /^redesign\/(.+)$/) {
                        subdomain = (branch =~ /^redesign\/(.+)$/)[0][1]
                        // Remove trailing .table2taste.cabrasky.net if present
                        subdomain = subdomain.replaceAll(/\.table2taste\.cabrasky\.net$/, '')
                        // Also remove table2taste.cabrasky.net
                        subdomain = subdomain.replaceAll(/\.?table2taste\.cabrasky\.net$/, '')
                    } else if (branch ==~ /^preview\/(.+)$/) {
                        subdomain = (branch =~ /^preview\/(.+)$/)[0][1]
                    } else if (branch ==~ /^PR-(\d+)$/) {
                        subdomain = "pr-${(branch =~ /^PR-(\d+)$/)[0][1]}"
                    } else {
                        // Fallback: sanitize branch name
                        subdomain = branch.toLowerCase()
                            .replaceAll(/[^a-z0-9\/-]/, '-')
                            .replaceAll(/\/+/, '-')
                            .replaceAll(/^-+|-+$/, '')
                            .take(40)
                    }

                    // Validate subdomain is DNS-safe
                    subdomain = subdomain.toLowerCase()
                        .replaceAll(/[^a-z0-9-]/, '-')
                        .replaceAll(/^-+|-+$/, '')
                        .take(40)

                    if (subdomain == "" || subdomain == null) { subdomain = "preview" }

                    env.SUBDOMAIN = subdomain
                    env.IS_PRODUCTION = (branch == "main").toString()
                    env.PREVIEW_NAMESPACE = "table2taste-preview-${subdomain}"

                    echo "Branch: ${branch}"
                    echo "Subdomain: ${subdomain}.table2taste.cabrasky.net"
                    echo "Production: ${env.IS_PRODUCTION}"
                    echo "Namespace: ${env.PREVIEW_NAMESPACE}"
                    echo "Image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        // ── 3. Check Image Exists ────────────────────────
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
                        echo "✅ Both images exist — skipping Docker build"
                    }
                }
            }
        }

        // ── 4. Backend Tests ─────────────────────────────
        stage('Test Backend') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                sh 'docker rm -f test-db 2>/dev/null || true'
                sh '''docker run -d --rm --name test-db \
                    -e POSTGRES_USER=table2taste \
                    -e POSTGRES_PASSWORD=1234test \
                    -e POSTGRES_DB=table2taste \
                    -p 15432:5432 postgres:16-alpine'''
                sleep 3
                dir('packages/backend') {
                    sh 'chmod +x mvnw'
                    sh '''./mvnw test jacoco:report -q \
                        -Dspring.datasource.url=jdbc:postgresql://localhost:15432/table2taste \
                        -Dspring.datasource.username=table2taste \
                        -Dspring.datasource.password=1234test \
                        -Dspring.liquibase.enabled=true \
                        -Dliquibase.secureParsing=false \
                        -Dspring.jpa.hibernate.ddl-auto=none'''
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

        // ── 5. Frontend Build & Test ──────────────────────
        stage('Test Frontend') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                dir('packages/frontend') {
                    sh 'npm ci'
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

        // ── 6. SonarQube Analysis ─────────────────────────
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

        // ── 7. Docker Build & Push ─────────────────────────
        stage('Docker Build & Push') {
            when {
                expression { return !params.SKIP_DOCKER && env.SKIP_DOCKER_BUILD != 'true' }
            }
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('packages/backend') {
                            sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ."
                            sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        dir('packages/frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                            sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        // ── 8. Deploy to Kubernetes ───────────────────────
        stage('Deploy to Kubernetes') {
            when {
                expression { return !params.SKIP_DEPLOY }
            }
            steps {
                script {
                    if (env.IS_PRODUCTION == "true") {
                        // ── Production deploy (main branch) ──
                        deployToNamespace("table2taste", "table2taste.cabrasky.net")
                    } else {
                        // ── Preview deploy ──
                        deployPreview(env.SUBDOMAIN)
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
            // Clean up preview namespace on failure so we don't leave dead pods
            script {
                if (env.IS_PRODUCTION != "true" && env.PREVIEW_NAMESPACE && !params.SKIP_DEPLOY) {
                    sh """
                        export KUBECONFIG=/var/lib/jenkins/.kube/config
                        kubectl delete namespace ${env.PREVIEW_NAMESPACE} --ignore-not-found --wait=false || true
                    """
                }
            }
        }
        success {
            script {
                def url = env.IS_PRODUCTION == "true" 
                    ? "https://table2taste.cabrasky.net" 
                    : "https://${env.SUBDOMAIN}.table2taste.cabrasky.net"
                echo "✅ Deployed: ${url}"
            }
        }
    }
}

// ── Helper: Deploy to an existing production namespace ──
def deployToNamespace(namespace, host) {
    sh """
        export KUBECONFIG=/var/lib/jenkins/.kube/config

        # Update image tags in production deployment files
        sed -i 's|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${IMAGE_TAG}|g' k8s/backend.yaml
        sed -i 's|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${IMAGE_TAG}|g' k8s/frontend.yaml

        # Apply production manifests
        kubectl apply -f k8s/namespace.yaml --validate=false
        kubectl apply -f k8s/secrets.yaml --validate=false
        kubectl apply -f k8s/configmap.yaml --validate=false
        kubectl apply -f k8s/db.yaml
        kubectl apply -f k8s/backend.yaml
        kubectl apply -f k8s/frontend.yaml
        kubectl apply -f k8s/ingress.yaml

        # Wait for rollout
        kubectl rollout status deployment/postgres -n ${namespace} --timeout=120s || true
        kubectl rollout status deployment/table2taste-backend -n ${namespace} --timeout=300s
        kubectl rollout status deployment/table2taste-frontend -n ${namespace} --timeout=300s
    """
}

// ── Helper: Deploy a preview (ephemeral namespace) ──
def deployPreview(subdomain) {
    def ns = "table2taste-preview-${subdomain}"
    sh """
        export KUBECONFIG=/var/lib/jenkins/.kube/config

        # Create rendered preview manifests from templates
        mkdir -p /tmp/k8s-preview-${subdomain}

        for f in k8s/preview/*.yaml; do
            sed \\
                -e 's|__SUBDOMAIN__|${subdomain}|g' \\
                -e 's|__IMAGE_TAG__|${IMAGE_TAG}|g' \\
                -e 's|__NAMESPACE__|${ns}|g' \\
                "\$f" > /tmp/k8s-preview-${subdomain}/\$(basename "\$f")
        done

        # Deploy preview
        kubectl apply -f /tmp/k8s-preview-${subdomain}/namespace.yaml
        sleep 2
        kubectl apply -f /tmp/k8s-preview-${subdomain}/db.yaml
        kubectl apply -f /tmp/k8s-preview-${subdomain}/backend.yaml
        kubectl apply -f /tmp/k8s-preview-${subdomain}/frontend.yaml
        kubectl apply -f /tmp/k8s-preview-${subdomain}/ingress.yaml

        # Wait for rollout
        kubectl rollout status deployment/postgres -n ${ns} --timeout=120s || true
        kubectl rollout status deployment/table2taste-backend -n ${ns} --timeout=300s
        kubectl rollout status deployment/table2taste-frontend -n ${ns} --timeout=300s

        echo "Preview URL: https://${subdomain}.table2taste.cabrasky.net"

        # Cleanup temp files
        rm -rf /tmp/k8s-preview-${subdomain}
    """
}
