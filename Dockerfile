FROM maven:3.9-eclipse-temurin AS build
WORKDIR /src
COPY . .
ENV MAVEN_OPTS="-Djdk.xml.maxGeneralEntitySizeLimit=0 -Djdk.xml.totalEntitySizeLimit=0"
RUN mvn -pl plugins/at.ac.tuwien.big.momot.runner -am -Declipse.release=latest -DskipTests=true -Dxtend.skip=true package
RUN mkdir -p /app/repository/plugins && find /src -path '*/target/*.jar' ! -name 'original-*' ! -name '*-sources.jar' ! -name '*-javadoc.jar' -exec cp {} /app/repository/plugins/ \;

FROM eclipse-temurin:21-jre
WORKDIR /work
EXPOSE 8080
VOLUME ["/work", "/out"]
COPY --from=build /app/repository /app/repository
ENTRYPOINT ["java", "-cp", "/app/repository/plugins/*", "at.ac.tuwien.big.momot.runner.RestServerMain"]
