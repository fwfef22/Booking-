FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Kopiowanie pliku rozwiązania
COPY ["RentalApp.sln", "./"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["Application/Application.csproj", "Application/"]
COPY ["Api/Api.csproj", "Api/"]

RUN dotnet restore "RentalApp.sln"

# Kopiowanie całego kodu źródłowego
COPY ["Domain/", "Domain/"]
COPY ["Infrastructure/", "Infrastructure/"]
COPY ["Application/", "Application/"]
COPY ["Api/", "Api/"]
COPY ["Templates/", "Templates/"]

WORKDIR "/src/Api"
RUN dotnet build "Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=build /src/Templates ./Templates   
ENTRYPOINT ["dotnet", "Api.dll"]