FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
# Copiamos el jar generado (asegúrate de hacer mvn clean package primero)
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]