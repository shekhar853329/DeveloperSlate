# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Project lives at this path relative to the repo root (build context)
ARG PROJECT_DIR=backend/developerSlate/developerSlate

# Copy csproj and restore first (layer cache)
COPY ${PROJECT_DIR}/developerSlate.csproj .
RUN dotnet restore developerSlate.csproj

# Copy everything else and publish
COPY ${PROJECT_DIR}/. .
RUN dotnet publish developerSlate.csproj -c Release -o /app/publish --no-restore

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Non-root user for security (Debian-based image uses groupadd/useradd)
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser
USER appuser

COPY --from=build /app/publish .

# Fly.io sets PORT; ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "developerSlate.dll"]
