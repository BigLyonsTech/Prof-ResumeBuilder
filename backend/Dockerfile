# ============================================================
#   ProfResumeBuilder — Single Container Dockerfile
#
#   Stage 1 (node-builder)  → builds the React frontend
#   Stage 2 (java-builder)  → copies React output + compiles Spring Boot JAR
#   Stage 3 (runtime)       → runs only the final JAR
#
#   Result: ONE container, ONE port (8080)
#   Spring Boot serves both the API (/api/**) and the
#   React app (everything else via /static/index.html)
# ============================================================


# ── Stage 1: Build React Frontend ───────────────────────────
FROM node:20-alpine AS node-builder

WORKDIR /frontend

# Copy package files and install dependencies
COPY frontend/package.json .
RUN npm install --legacy-peer-deps

# Copy source and build production bundle
COPY frontend/ .
RUN npm run build
# Output: /frontend/dist/


# ── Stage 2: Build Spring Boot JAR ──────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS java-builder

WORKDIR /app

# Copy Maven wrapper
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

# Download dependencies (cached layer — only re-runs if pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy backend source
COPY backend/src ./src

# Copy React build output into Spring Boot static resources
# Spring Boot will serve these files at the root URL
COPY --from=node-builder /frontend/dist ./src/main/resources/static

# Build the JAR (skip tests for Docker build speed)
RUN ./mvnw clean package -DskipTests -B
# Output: /app/target/prof-resume-builder-0.0.1-SNAPSHOT.jar


# ── Stage 3: Runtime ────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the JAR — no build tools, no source code
COPY --from=java-builder /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar
USER appuser

# Expose Spring Boot port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/resumes || exit 1

# Pass MONGODB_URI as environment variable at runtime:
# docker run -e MONGODB_URI="mongodb+srv://..." prof-resume-builder
ENTRYPOINT ["java", "-jar", "app.jar"]
