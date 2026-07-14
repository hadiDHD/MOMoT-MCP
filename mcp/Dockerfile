# Stage 1: Build stage with Maven and JDK 21
FROM maven:3.9-eclipse-temurin-21 AS builder

# Install curl, Node.js 20, and other build utilities
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /src
# Copy the entire workspace
COPY . .

# Set maven opts as in original build
ENV MAVEN_OPTS="-Djdk.xml.maxGeneralEntitySizeLimit=0 -Djdk.xml.totalEntitySizeLimit=0"

# Build and setup all 4 validators
RUN node tools/henshin-validator/validate.mjs --setup
RUN node tools/momot-validator/validate.mjs --setup
RUN node tools/ecore-validator/validate.mjs --setup
RUN node tools/xmi-validator/validate.mjs --setup

# Install MCP server dependencies
WORKDIR /src/mcp
RUN npm install

# Stage 2: Clean runtime stage with Node and JDK 21
FROM node:20-bookworm-slim

ENV MOMOT_WORKBENCH_ENV=container

# Install Temurin JDK 21 from Adoptium (required for compiling/executing Java 21)
RUN apt-get update && apt-get install -y wget gnupg && \
    mkdir -p /etc/apt/keyrings && \
    wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor > /etc/apt/keyrings/adoptium.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb bookworm main" > /etc/apt/sources.list.d/adoptium.list && \
    apt-get update && apt-get install -y temurin-21-jdk && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the MCP server and pre-built tools
COPY --from=builder /src/mcp /app/mcp
COPY --from=builder /src/tools /app/tools

# Set the active workdir to mcp to start the server
WORKDIR /app/mcp
EXPOSE 7878

# Start MCP server
CMD ["node", "server.js"]
