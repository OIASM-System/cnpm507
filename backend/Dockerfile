# Giai đoạn 1: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/ ./backend/

RUN dotnet restore backend/src/OISM.WebAPI/OISM.WebAPI.csproj

RUN dotnet publish backend/src/OISM.WebAPI/OISM.WebAPI.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Giai đoạn 2: Chạy Backend
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "OISM.WebAPI.dll"]