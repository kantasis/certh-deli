# DELI

## Links

- [frontend](http://localhost:9080)  
- [grafana](http://localhost:3000)  

## Shared directories

Several directories in the repository are shared with the containers. 

`shared`: This directory holds dynamic data of the containers therefore not tracked by version control.
   - `shared/tomcat-logs`, `shared/spring-logs`: Shared with the spring container storing the logs of the spring application.
   - `shared/data`: Shared with the postgres container to hold the data directory
   - `shared/grafana`: Shared with the grafana container to hold the grafana configuration. Perhaps it's redundant with the new feature of provisioning. **IMPORTANT**: when first creating the project, change the permissions for this directory (`chmod 777 shared/grafana`)
   - `shared/input`: This is not a shared directory but holds the csv data to be sent to postgres using the `import_*.sh` scripts (see below)
`app-grafana`: This directory holds the provisioned data for grafana, namely the postgres datasource and the main dashboard. Changes here are reflected almost immediately through grafana
`app-react`: This directory holds the react application for the front-end of DELI. 

## Scripts:

### deploy.sh

This script restarts all the containers. It also recompiles the spring boot application in case some code there changed.

When you change the environment variables you need to restart the containers to load the new values.

### container.sh

If you want to quickly open a CLI on one of the containers, use this script.
Example:
```bash
# Opens an `sh` terminal to the `spring` container
./container.sh spring sh

# Opens a `psql` terminal to the `db` container
./container.sh db psql
```

### scripts/init.sh

This script is used to initialize the database with project data. This means dropping all tables and creating them anew. It executes the SQL commands written in `services/postgres/init.sql`.

So if you need to change the schema of a table, you change it in the `services/postgres/init.sql` file and run this script. Don't forget to import all the relevant data again.

### scripts/import*.sh

These scripts are used to import data to postgres (the db container). 
They each need a corresponding file in `shared/input/` and an SQL statement in `services/postgres/` 

## .private

This directory holds keys, passwords, configurations and generally protected values. Those are set as the `.env` files for each container. The entire directory is ignored by git.
- `.private/host.env`: Symlinked to `.env` sets environment variables for the `docker-compose.yaml` file and the ones that should be shared between containers (e.g. credentials for postgres)
   - **PROJECT_NAME**: The name of the project. Used in many places, most notably as a prefix of the container names
   - **NODE_PORT**: Not reall important but that's the port node.js runs in the container
   - **HOST_NODE_PORT**: The port exposed for the react.js
   - **SPRING_PORT**: Not really important but that's the port spring boot runs in the container
   - **HOST_SPRING_PORT**: The port exposed for the spring boot application
   - **HOST_GRAFANA_PORT**: The port exposed for grafana
   - **GLOBAL_GF_PATHS_PROVISIONING**: The path in the container where the provisioning files are kept
   - **GLOBAL_POSTGRES_USER**: postgres container variables
   - **GLOBAL_POSTGRES_PASSWORD**: postgres container variables
   - **GLOBAL_PGPORT**: postgres container variables
   - **GLOBAL_POSTGRES_DB**: postgres container variables
   - **GLOBAL_PGDATA**: postgres container variables
   - **RESTART_POLICY**: restart policy for th econtainers
- `.private/spring.env`: Symlinked to `services/spring/.env`. 
   - **DATAREPO_PORT**: Credentials for ONCODIR data warehouse API
   - **DATAREPO_USER**: Credentials for ONCODIR data warehouse API
   - **DATAREPO_PASS**: Credentials for ONCODIR data warehouse API
   - **POSTGRES_URL**: Credentials for postgres. Referenced by the host.env file
   - **POSTGRES_USER**: Credentials for postgres. Referenced by the host.env file
   - **POSTGRES_PASSWORD**: Credentials for postgres. Referenced by the host.env file
- `.private/node.env`: Symlinked to `services/node/.env`. 
   - **VITE_GRAFANA_PORT**: The port where graphana listens to in its container
   - **VITE_GRAFANA_DASHBOARD**: The name of the main dashboard
   - **VITE_AUTHENTICATION_PORT**: The exposed port of spring boot
   - **VITE_GRAFANA_PATH**: The unique id of the dashboard
   - **VITE_AUTHENTICATION_HOST**: The IP where the authentication API call should be sent to
   - **VITE_GRAFANA_HOST**: The IP where grafana requests should be sent to
- `.private/grafana.env`: Symlinked to `services/grafana/.env`. 
   - **GF_SECURITY_ALLOW_EMBEDDING**: set this to true to allow embedded panels
   - **GF_AUTH_ANONYMOUS_ENABLED**: set this to true to allow anonymous users to see the panels
   - **GF_SECURITY_ADMIN_USER**: Admin credentials
   - **GF_SECURITY_ADMIN_PASSWORD**: Admin credentials
   - **GF_PATHS_PROVISIONING**: The path where the provisioning files are kept
   - **POSTGRES_USER**: Credentials for the database. Referenced by the host.env file
   - **POSTGRES_PASSWORD**: Credentials for the database. Referenced by the host.env file
   - **POSTGRES_DB**: Credentials for the database. Referenced by the host.env file
   - **PGPORT**: Credentials for the database. Referenced by the host.env file
   - **GF_INSTALL_PLUGINS**: Plugins to be installed (volkovlabs-echarts-panel,grafana-worldmap-panel)
- `.private/postgres.env`: Symlinked to `services/postgres/.env`. 
   - **POSTGRES_USER**: Credentials for the database. Referenced by the host.env file
   - **POSTGRES_PASSWORD**: Credentials for the database. Referenced by the host.env file
   - **POSTGRES_DB**: Credentials for the database. Referenced by the host.env file
   - **PGDATA**: Credentials for the database. Referenced by the host.env file
   - **PGPORT**: Credentials for the database. Referenced by the host.env file


## React Structure

## Spring

The spring boot application is there to provide the authentication capabilities

Endpoints:
- `api/v1/auth/login`: Send a request here to login and get the JWT. The request should look something like this:
```bash
curl --location 'localhost:8081/api/v1/auth/login' \
   --header 'Content-Type: application/json' \
   --data '{
      "username": "testuser",
      "password": "testpass"
   }'
```
- `api/v1/auth/register`: Send a request to create a new user. 
The request should look something like this:
```bash
curl --location 'localhost:8081/api/v1/auth/register' \
   --header 'Content-Type: application/json' \
   --data-raw '{
      "username": "testuser",
      "email": "testuser@gmail.gr",
      "password": "testpass",
      "role": ["user"]
}'
```
## Grafana 

Grafana handles the connection with the postgres database and the embedding the panels to the react iframes

### Provisioning

Provisioning is for defining the layout of the grafana dashboard and the panels. The `app-grafana/` directory is shared with the container and stores the definitions of the dashboard and the postgres datasource. Provisioning is used to have the visualizations in-code and handled by git

### Echarts

A grafana plugin which allows for better visualizations.  
[Examples of ECharts](https://echarts.apache.org/examples/en/index.html)
[ECharts documentation](https://echarts.apache.org/en/option.html#radar.indicator)

## Postgres

This is the main database to store the data shown in the dashboard.  
You can access the SQL with the following command:
```bash
./container.sh db psql
```

