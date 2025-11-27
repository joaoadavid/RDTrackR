# ===========================
# Stage 1 — Build
# ===========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia todo o backend (context será ../backend)
COPY . .

# Agora a solution está visível aqui:
# /src/RDTrackR-BackEnd/API/RDTrackR.sln
WORKDIR /src/RDTrackR-BackEnd/API

RUN dotnet restore RDTrackR.sln

RUN dotnet publish src/Backend/RDTrackR.API/RDTrackR.API.csproj -c Release -o /app/publish

# ===========================
# Stage 2 — Runtime
# ===========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "RDTrackR.API.dll"]
