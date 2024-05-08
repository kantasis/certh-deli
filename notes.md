https://www.chartjs.org/docs/latest/charts/radar.html
# TODO:
   put the initialization/deployment snippets in dockerfiles
   puc `grafana cli plugins install volkovlabs-echarts-panel` in the dockerfile


# Initialize deployment
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

## React
```bash
docker exec -it \
   deli_ubuntu_container \
   bash

cd /app
npm create vite@latest deli_react_app -- --template react-ts
cd deli_react_app
npm install

npm run dev -- --host 0.0.0.0


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



radar chart:
```js

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




