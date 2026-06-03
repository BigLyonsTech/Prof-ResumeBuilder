# ============================================================

# ProfResumeBuilder - Single Container Dockerfile

#

# Stage 1: Build React Frontend

# Stage 2: Build Spring Boot JAR

# Stage 3: Run Application

#

# React + Spring Boot + MongoDB Atlas

# Deployment Target: Render.com

# ============================================================

# ------------------------------------------------------------

# Stage 1: Build React Frontend

# ------------------------------------------------------------

FROM node:20-alpine AS node-builder

WORKDIR /frontend

# Copy package files

COPY frontend/package*.json ./

# Install dependencies

RUN npm install --legacy-peer-deps

# Copy frontend source

COPY frontend/ .

# Build React production bundle

RUN npm run build

# ------------------------------------------------------------

# Stage 2: Build Spring Boot Application

# ------------------------------------------------------------

FROM maven:3.9.9-eclipse-temurin-17-alpine AS java-builder

WORKDIR /app

# Copy Maven configuration first for caching

COPY backend/pom.xml .

# Download dependencies

RUN mvn dependency:go-offline -B

# Copy backend source

COPY backend/src ./src

# Copy React build into Spring Boot static resources

COPY --from=node-builder /frontend/dist ./src/main/resources/static

# Build executable jar

RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------

# Stage 3: Runtime

# ------------------------------------------------------------

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create non-root user

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy application jar

COPY --from=java-builder /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar

USER appuser

# Render uses PORT environment variable

ENV PORT=8080

EXPOSE 8080

# Optional health check

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 
CMD wget -q --spider [http://localhost:${PORT}/api/resumes](http://localhost:${PORT}/api/resumes) || exit 1

# MongoDB Atlas URI should be supplied in Render Environment Variables:

# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

ENTRYPOINT ["java","-jar","app.jar"]
