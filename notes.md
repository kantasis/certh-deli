https://www.chartjs.org/docs/latest/charts/radar.html
# TODO:
   put the initialization/deployment snippets in dockerfiles
   puc `grafana cli plugins install volkovlabs-echarts-panel` in the dockerfile

# Columns:
High body-mass index_Percent_DALYs_val
Low physical activity_Percent_DALYs_val
Alcohol use_Percent_DALYs_val
Diet high in processed meat_Percent_DALYs_val
Diet high in red meat_Percent_DALYs_val
Diet low in calcium_Percent_DALYs_val
Diet low in fiber_Percent_DALYs_val
Diet low in milk_Percent_DALYs_val
Diet low in whole grains_Percent_DALYs_val
Smoking_Percent_DALYs_val

## All


# URLs
160.40.53.35

[frontend](http://localhost:9080)
[grafana](http://localhost:3000)
[h2](http://localhost:8081/h2-ui)


http://160.40.53.35:3000/d-solo/edn5ahxrzaw3kc/deli-main-dashboard?orgId=1&from=1716944950967&to=1716966550967&panelId=1
http://160.40.53.35:3000/d-solo/edn5ahxrzaw3kc/deli-main-dashboard?orgId=1&from=1716945974114&to=1716967574114&panelId=2

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
docker cp services/postgres/import.sql deli_db_container:/


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
# General

```bash
docker exec -it \
   deli_ubuntu_container \
   bash

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



# radar chart:
```js
context.panel.data

let averages_flst = [];
let maxes_flst = [];
let countries_slst = [];

data.series.map((s) => {

  // console.log(s)

  values_fLst = s.fields.find((f) =>
    f.name === 'averages'
  ).values;

  maxes_flst = s.fields.find((f) =>
    f.name === 'maxes'
  ).values;

  countries_sLst = s.fields.find((f) =>
    f.name === 'countries'
  ).values;

});


indicator_Lst = [];
max_f = Math.max(...values_fLst);

console.log(maxes_flst);
console.log(countries_sLst);
console.log(max_f);

for (let i in countries_sLst) {
  indicator_Lst[i] = {
    name: countries_sLst[i],
    max: max_f,
  }
};

return {
  title: {
    text: 'Basic Radar Chart'
  },
  // legend: {
  //    data: ['Allocated Budget', 'Actual Spending']
  // },
  radar: {
    // shape: 'circle',
    indicator: indicator_Lst
  },
  series: [
    {
      name: 'Budget vs spending',
      type: 'radar',
      data: [
        {
          value: values_fLst
          // name: 'Allocated Budget'
        }
      ]
    }
  ]
};

```






Get the echarts template from here
https://echarts.apache.org/examples/en/index.html#chart-type-line

return option;

and the query
```sql
SELECT 
   AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5") as averages, 
   MAX("Air Pollution Population Weighted Average [ug/m3]_PM2.5") as maxes,
   "Country" as countries
FROM data_tbl 
GROUP BY countries
HAVING AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5") IS NOT NULL
ORDER BY AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5")
LIMIT 15
```



```sql
SELECT
  "Country",
  "Year",
  "CRC_incidence_val_Rate",
FROM
  data_tbl
GROUP BY "Year", "Coutnry"

```

```sql
SELECT 
   "Year",
   MAX(CASE WHEN "Country" = 'Greece' THEN "CRC_incidence_val_Percent" END) as "Greece",
   MAX(CASE WHEN "Country" = 'France' THEN "CRC_incidence_val_Percent" END) as "France",
   MAX(CASE WHEN "Country" = 'Germany' THEN "CRC_incidence_val_Percent" END) as "Germany"
FROM data_tbl
WHERE age='Age-standardized'
   and "Country" in ( 'Greece', 'France', 'Germany')
group by "Year"
ORDER BY "Year"

```



<iframe src="http://160.40.53.35:3000/d-solo/edn5ahxrzaw3kc/deli-main-dashboard?orgId=1&from=1716948484158&to=1716970084158&panelId=3" width="450" height="200" frameborder="0"></iframe>
http://160.40.53.35:3000/d-solo/edn5ahxrzaw3kc/deli-main-dashboard?orgId=1&theme=light&panelId=3









