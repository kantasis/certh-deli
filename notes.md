https://www.chartjs.org/docs/latest/charts/radar.html
# GTD:

## Inbox
Integration

    Data Warehouse. DELI to get GBD data and post results of predictive analytics to DWH. Other data could be stored locally. 

ICCS Predictive Analytics

   Discussion to re-open early next year. Need feedback from clinicians to re-run models with updated data (GBD 2021, DALYs etc.) and parameters (year lags, risk factors). GD to organize workshop end of Jan/beginning of Feb under T2.2/T4.4 [DOA]
   Develop predictions
   Spatial correlation analysis on Spanish regional data to support LIT-03 under discussion   


## TODO: 
| A/A | [UR](! "User Requirements") | Who | [TR](! "Technical Requirements")  | Status | [DoD](! "Definition of Done") | Importance | Urgency | 
|-|-|-|-|-|-|-|-|
| 0 | UR | | TR | Open | ? | | |
| 1 | Further implementation of policy data provided by **Marilly** (MoHGR) | | Update the Policy Analytics panel with the new data from MoHGR | Open | ? | Main feedback from Vienna plenary, high priority | Next |
| 2 | Implementation of interactive regression graphs on Grafana (to replace images) using csv files provided by Dimitris | | Get the dataset from Dimitris | Open | ? | High priority, will help end users provide better feedback | Next |
| 3 | Implementation of interactive regression graphs on Grafana (to replace images) using csv files provided by Dimitris | | Create the panels for the predictive analytics | Open | ? | | |
| 4 | Cater to power users | AM | Create a pivot table for each dataset? | Open | ? | |  |
| 5 | Regional data from Spain provided by URIOJA for LIT-03  | **Marino** | Extract the CSV from Marino's files | Open | ? | | probably after review meeting |
| 6 | Regional data from Spain provided by URIOJA for LIT-03  | **Marino** | Create a panel with geo data for spain like the policy analytics panel | Open | ? | | probably after review meeting |
| 7 | APPO. Bias info to be added on regression graphs using JSON provided by Panos. Also details to be added in Glossary. Kafka to be used later if data changes | | TR | Open | ? | | (High priority as results are ready, tested in LIT-01 and implemented in DEPO) |
| 9 | Deployment on EXUS servers. Front end first. Predictive analytics to follow (probably after review meeting) | | TR | Open | ? | | After Review Meeting |
| 10 | Data Warehouse Integration. To discuss further. Predictive analytics and fusion results to be posted and stored to DWH? LIT-03, policy data etc. to be added on central DWH?  | | Ask for a DoD | Open | ? | | Early 2025 |
| 11 | Discussion to re-open early next year. Need feedback from clinicians to re-run models with updated data (GBD 2021, DALYs etc.) and parameters (year lags, risk factors) | | TR | Open | ? | | After LIT-3 |
| 12 | Develop predictions | | TR | Open | ? | | |
| 13 | Video or slider to be added on Homepage | | TR | Open | ? | | Next |
| 14 | Additional logos to be added. Help from SYNYO. | | TR | Open | ? | | Next |
| 14 | Fix Marily's recommendations | | TR | Open | ? | |  |
| 14 | Fusion | Add sex filter to the visualizations | TR | Open | ? | |  |
| 14 | Fusion | Add age group filter to the visualizations | TR | Open | ? | |  |
| 14 | Fusion | Spider plot and bar chart need to be modified, perhaps using different charts, to exclude year range.| TR | Open | ? | |  |
| 14 | Fusion | Data for 2020-21 to be added for country-level.  | TR | Open | ? | |  |
| 14 | Fusion | Additional data used in Fusion to be discussed (e.g. comorbidities, socioeconomic). | TR | Open | ? | |  |
| 14 | Fusion | For all these country-level and sub-group datasets need to be fused into a single one. | TR | Open | ? | |  |
| 14 | Fusion | Check how data collected in LIT-02 (NELI, PYRAMID) can be aggregated for DELI. | TR | Open | ? | |  |


Fusion. 
   UPDATE: Male/Female and Age Group incidence and risk factor exposure to be integrated in existing plots.
   Spider plot and bar chart need to be modified, perhaps using different charts, to include year range. 
   Data for 2020-21 to be added for country-level. 
   
   For all these country-level and sub-group datasets need to be fused into a single one. Check how data collected in LIT-02 (NELI, PYRAMID) can be aggregated for DELI. Feedback from end users. Mainly preparation for LIP-03 but useful to visualise for LIP-02. Can start now but full implementation can wait until after DELI workshop.



<!-- - Policy data visualisations – GK  -->
- Regression visualisations – GK
- APPO results visualisations – GK 
- EU Logo – GK 
- Spider plot and bar chart to be fixed – GK 
- 

let euCountries_strLst = {
   "Cyprus",
   "Italy",
   "Hungary",
   "Czech Republic",
   "Sweden",
   "Netherlands",
   "Romania",
   "Austria",
   "Country",
   "Luxemburg",
   "Ireland",
   "Germany",
}


let countryPolicies_dict = {}

euCountries_strLst.forEach(key => {
  countryPolicies_dict[key] = [];
});

[
]



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
      -f import_data.sql

# Import the policies
docker cp services/postgres/import_policies.sql deli_db_container:/
docker cp services/postgres/policies.csv deli_db_container:/tmp/policies.csv
docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -d deli_db \
      -f import_policies.sql

```


Initialize the user database
```bash
# Enter the postgres prompt
docker exec -it \
   deli_db_container \
   psql \
      -h localhost \
      -U postgres \
      -d deli_db \
```


```sql
-- 
INSERT INTO ROLES_TBL(LABEL) VALUES('ROLE_USER');
INSERT INTO ROLES_TBL(LABEL) VALUES('ROLE_MODERATOR');
INSERT INTO ROLES_TBL(LABEL) VALUES('ROLE_ADMIN');

```

## Initialize Grafana:

Variables:
minyear_filter
maxyear_filter
country_filter
factor_filter

## Initialize shared directories
Make sure the containers have access to the locally shared directories
`sudo chmod 744 shared/grafana/main`
etc


# General
```bash

# Update the .private directory
rsync -avzPh .private/*.env certh:oncodir/deli/.private


docker cp default.yaml deli_grafana_container:/etc/grafana/provisioning

GF_PATHS_PROVISIONING=/etc/grafana/provisioning/


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

## Grafana api
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


# Parse Policy excel

```python

import pandas as pd
import re

file_name='crc.xlsx'


excel_file = pd.ExcelFile(file_name)

sheetNames_strLst = excel_file.sheet_names
# Display the first few rows

result_df = pd.DataFrame()

for sheet_name in sheetNames_strLst:
   print(f"--------------------")
   print(f"Sheet: {sheet_name}")

   sheet_df = pd.read_excel(
      file_name,
      sheet_name=sheet_name,
      header=1
   )

   # Rename the policies column to countries
   sheet_df.rename(columns={sheet_df.columns[0]: 'Country'}, inplace=True)

   # Set the countries to be the index
   sheet_df.set_index('Country', inplace=True)

   # drop the rows with nan
   dataColumns_idx = sheet_df.columns

   nanRow_mask = sheet_df[dataColumns_idx[0]].isnull()
   for column_name in dataColumns_idx[1:]:
      nanRow_mask = nanRow_mask & sheet_df[column_name].isnull()
   sheet_df = sheet_df[~nanRow_mask]

   for column_name in dataColumns_idx:
      if re.search("^Unnamed: ", column_name):
         continue
      if re.search("^Best Practice", column_name):
         continue
      print(f"Column: {column_name}")

      nan_mask = sheet_df[column_name].isnull()
      temp_idx = sheet_df[~nan_mask].index
      temp_df = pd.DataFrame(
         index=temp_idx,
      )
      temp_df['Policy'] = sheet_name
      temp_df['Type'] = column_name
      temp_df['Comment'] = sheet_df[column_name]

      result_df = pd.concat([result_df,temp_df])

   print(result_df['Type'].str.match("^Best Practice").isnull().any())

result_df
```

Next steps:
- save the data to a csv file
- create a table to store that data
- upload the data to the database
- create a good visualization

# Funding Logos

Please find attached the EU funding logo. Different sizes of the ONCODIR logo you can find on the PWS on the [subpage media][1] and also on the [ONCODIR share point][2].

[1]:https://www.oncodir.eu/oncodir-media/
[2]:https://itigr.sharepoint.com/sites/ONCODIR2/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FONCODIR2%2FShared%20Documents%2FGeneral%2F5%2ETemplates%20and%20Logos&viewid=1600021e%2Dc251%2D4a37%2Daca2%2D9f6bb995f961





Psychotropic Substances
R&D
Health Education
Environmental Factors 
Alcohol Consumption
Health Literacy
Governance
Diabetes
Personalized Medicine
Health Promotion
Nutrition
Occupational Risk Factors 
Physical Activity
Mental Health
Vaccinations & Communicable Di 
Smoking




