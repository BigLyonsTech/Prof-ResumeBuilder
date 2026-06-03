# ============================================================
# ProfResumeBuilder - Single Container Dockerfile
#
# Stage 1: Build React Frontend
# Stage 2: Build Spring Boot JAR
# Stage 3: Runtime Container
#
# Result:
# - One container
# - One exposed port (8080)
# - Spring Boot serves both API and React frontend
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

# Build React app
RUN npm run build


# ------------------------------------------------------------
# Stage 2: Build Spring Boot Application
# ------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-17-alpine AS java-builder

WORKDIR /app

# Copy pom.xml first for Docker cache
COPY backend/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY backend/src ./src

# Copy React build into Spring Boot static resources
COPY --from=node-builder /frontend/dist ./src/main/resources/static

# Build executable JAR
RUN mvn clean package -DskipTests -B


# ------------------------------------------------------------
# Stage 3: Runtime Container
# ------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy generated JAR
COPY --from=java-builder /app/target/*.jar app.jar

# Set permissions
RUN chown appuser:appgroup app.jar

USER appuser

# Render / Cloud port
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:${PORT}/api/resumes || exit 1

# MongoDB Atlas URI is provided through environment variables:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ProfResumeBuilder

ENTRYPOINT ["java", "-jar", "app.jar"]