FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
# Copiamos el jar generado (asegúrate de hacer mvn clean package primero)
COPY ./target/ms-ventas-0.0.1-SNAPSHOT.jar ./ms-ventas-0.0.1-SNAPSHOT.jar
ENTRYPOINT ["java","-jar","ms-ventas-0.0.1-SNAPSHOT.jar"]