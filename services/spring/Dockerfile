# FROM eclipse-temurin:17-jdk-alpine

# # Bezkoder suggests this:
# # FROM maven:3.8.5-openjdk-17

# COPY target/spring_react-0.0.1-SNAPSHOT.jar app.jar

# ENTRYPOINT ["java","-jar","/app.jar"]

# ----

# FROM maven:3.8.5-openjdk-17
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app-spring
# COPY . .
# RUN ./mvnw clean install

CMD ./mvnw spring-boot:run
