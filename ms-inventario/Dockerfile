# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/ms-inventario-0.0.1-SNAPSHOT.jar ./ms-inventario-0.0.1-SNAPSHOT.jar

ENTRYPOINT ["java","-jar","ms-inventario-0.0.1-SNAPSHOT.jar"]