https://www.chartjs.org/docs/latest/charts/radar.html
# TODO:

# URLs
160.40.53.35

[frontend](http://localhost:9080)
[grafana](http://localhost:3000)
[h2](http://localhost:8081/h2-ui)
   jdbc:h2:/data/spreact_db

http://160.40.53.35:3000/d-solo/edn5ahxrzaw3kc/deli-main-dashboard?orgId=1&from=1716944950967&to=1716966550967&panelId=1
http://160.40.53.35:3000/d-solo/edn5ahxrzaw3kc/deli-main-dashboard?orgId=1&from=1716945974114&to=1716967574114&panelId=2

# Desc 

- docker
   maintenance
   scalability
   loose coupling
   deployment

- spring boot
   authentication 
   data retrieval from the data warehouse
   will listen to kafka

- react.js
   the front-end component
   user interface
   panels
   filters

- grafana
   responsible for communicating with the database

- postgresql
   storing data from the data warehouse
   query performance
   users
   roles
   
- apache ECharts
   the graphics
   dynamic and interactive dashboards

# Guides:
https://nightingaledvs.com/how-to-in-grafana%E2%80%8A-%E2%80%8Apart-2-creating-interactive-dashboards/

# React snippets
```ts
// reload the page and navigate somewhere else
import { NavigateFunction, useNavigate } from 'react-router-dom';

   let navigate: NavigateFunction = useNavigate();
   navigate("/login");
   window.location.reload();

```
# Initialize deployment

## Initialize react
```bash
docker exec -it \
   deli_ubuntu_container \
   bash

cd /app-react
npm create vite@latest spreact_react_app -- --template react-ts
cd spreact_react_app
# Lovely bootstrap
npm install bootstrap 
npm install react-bootstrap
npm install bootstrap-multiselect
npm install react-bootstrap-multiselect
# Lib for requests
npm install axios
npm install @types/react-router-dom
npm install react-router-dom
npm install http-proxy-middleware
# Library for form validation
npm install react-validation validator
npm install formik yup



npm install react-auth-kit
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome@latest

sudo chown george:george -R *

npm install

npm run dev -- --host 0.0.0.0

```

## Init H2
[h2](http://localhost:8081/h2-ui)

jdbc:h2:/data/spreact_db

```sql
INSERT INTO ROLES_TBL(LABEL) VALUES('ROLE_USER');
INSERT INTO ROLES_TBL(LABEL) VALUES('ROLE_MODERATOR');
INSERT INTO ROLES_TBL(LABEL) VALUES('ROLE_ADMIN');

```
## Initialize postgres
```bash
# Copy the init script to the container
docker cp services/postgres/init.sql deli_db_container:/
# Copy the data
docker cp shared/Fused_european_only_new.csv deli_db_container:/tmp/dataset.csv
# Copy the loading script
docker cp services/postgres/import_data.sql deli_db_container:/
# Copy the policy import script
docker cp services/postgres/import_policies.sql deli_db_container:/

# Run the init script
docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -f init.sql

# Run the import script
docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -d deli_db \
      -f import.sql

```

## Initialize Grafana:

Variables:
minyear_filter
maxyear_filter
country_filter
factor_filter

# General


```bash
docker exec -it \
   deli_ubuntu_container \
   bash

docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -d deli_db 

docker restart deli_spring_container && docker logs --follow deli_spring_container 

```


```bash
# REST api for data sources

USER=admin
PASS=adminadmin
HOST=localhost
PORT=3000

mkdir -p datasources
# Export datasources
curl -s \
   "http://$HOST:$PORT/api/datasources" \
   -u $USER:$PASS \
   | jq -c -M '.[]' \
   | split -l 1 - datasources/


# Import all datasources located in the “datasources” directory.

for datasource_rfile in datasources/*; do
   curl -X "POST" "http://$HOST:$PORT/api/datasources" \
      -H "Content-Type: application/json" \
      --user "$USER":"$PASS" \
      --data-binary @$datasource_rfile
done


```

## Snippets:

To change the schema you need to update the following files:
- services/postgres/init.sql
- services/postgres/import.sql
- app-spring/src/main/java/com/tutorials/spring_react/datarepo/DataUpdateService.java

```bash
# Find the columns with too long names
cat columns.txt \
   | sed 's/Percentage of total/%/' \
   | sed 's/_Percentage/%/' \
   | sed 's/_Summary exposure value/_SEV/' \
   | sed 's/colorectal cancer/CRC/' \
   | sed 's:dollar per person per day_Cost:\$/person/day:' \
   | sed 's/million No_Number of //' \
   | sed 's/ (PPP dollar per person per day)//' \
   | sed 's/ (percent)//' \
   | grep -E -e '.{60,}' 

# columns for the init.sql file
cat shared/columns.txt \
   | sed 's/Percentage of total/%/' \
   | sed 's/_Percentage/%/' \
   | sed 's/_Summary exposure value/_SEV/' \
   | sed 's/colorectal cancer/CRC/' \
   | sed 's:dollar per person per day_Cost:\$/person/day:' \
   | sed 's/million No_Number of //' \
   | sed 's/ (PPP dollar per person per day)//' \
   | sed 's/ (percent)//' \
   | xargs -I {} echo "   \"{}\" DOUBLE PRECISION," \
   | cpy

# columns for the import.sql file
cat shared/columns.txt \
   | sed 's/Percentage of total/%/' \
   | sed 's/_Percentage/%/' \
   | sed 's/_Summary exposure value/_SEV/' \
   | sed 's/colorectal cancer/CRC/' \
   | sed 's:dollar per person per day_Cost:\$/person/day:' \
   | sed 's/million No_Number of //' \
   | sed 's/ (PPP dollar per person per day)//' \
   | sed 's/ (percent)//' \
   | xargs -I {} echo "   \"{}\","
   | cpy


```

# radar chart:

Get the echarts template from here
https://echarts.apache.org/examples/en/index.html#chart-type-line

# 


The map information will be in a much more granular level
   will this be able to show more granular data than country level?

fix the lifestyle data
fix the country looltips
share the link and credentials to the partners by thursday
change password
retrieve password


give a granularity of what can be done by policy makers
   give somethign actionable






