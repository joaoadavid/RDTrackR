# ===== Stage 1 — Build =====
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia tudo a partir do contexto do repositório
# (o Dockerfile está em src/Backend/RDTrackR.API, então precisamos voltar no caminho relativo)
COPY ../../../ ./

# Agora a solution existe em:
# /src/RDTrackR/backend/RDTrackR-BackEnd/API/RDTrackR.sln

WORKDIR /src/RDTrackR/backend/RDTrackR-BackEnd/API

# Restaura dependências
RUN dotnet restore RDTrackR.sln

# Publica a API
RUN dotnet publish src/Backend/RDTrackR.API/RDTrackR.API.csproj -c Release -o /app/publish


# ===== Stage 2 — Runtime =====
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "RDTrackR.API.dll"]
