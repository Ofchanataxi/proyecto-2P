FROM eclipse-temurin:21-jdk-alpine
VOLUME /app
# Copiamos el jar generado (asegúrate de hacer mvn clean package primero)
COPY ./target/ms-catalogo-0.0.1-SNAPSHOT.jar ./ms-catalogo-0.0.1-SNAPSHOT.jar

ENTRYPOINT ["java","-jar","ms-catalogo-0.0.1-SNAPSHOT.jar"]