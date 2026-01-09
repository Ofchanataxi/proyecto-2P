# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
WORKDIR /app
# Asegúrate de que el nombre del JAR coincida con el artifactId y version de tu pom.xml
COPY --from=build /app/target/gateway-0.0.1-SNAPSHOT.jar ./app.jar

ENTRYPOINT ["java","-jar","/app/app.jar"]