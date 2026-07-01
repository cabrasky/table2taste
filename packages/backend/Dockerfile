FROM maven:3.8.4-openjdk-17 AS builder

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
VOLUME /tmp
COPY defaultData.json .
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java","-Dliquibase.secureParsing=false","-jar","/app.jar"]
EXPOSE 8080
