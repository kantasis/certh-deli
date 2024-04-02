https://www.chartjs.org/docs/latest/charts/radar.html


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




