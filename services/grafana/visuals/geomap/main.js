// Auxiliary function to get a query
function getQueryResult(query_name) {
   const result = context
      .panel
      .data
      .series
      .find((series_dict) =>
         series_dict['refId'] === query_name
      )
      ;
   if (!result)
      console.log(`Error: Query with name ${query_name} not found`)
   return result['fields'];
}

// Auxiliary function to get a variable value
function getVariable(variable_name) {
   return context.grafana.replaceVariables(`\${${variable_name}}`);
}

// Get the policy filter variable value
const selectedPolicy_name = getVariable('policy_filter');

// Get Query A
const data_QueryResult = getQueryResult('A');

const dataTypeColumn_dict = data_QueryResult
   .find((element_dict) => element_dict['name'] === 'Type')
const policyTypes_strLst = dataTypeColumn_dict['values'];

const dataCountriesColumn_dict = data_QueryResult
   .find((element_dict) => element_dict['name'] === 'Country')
const dataCountries_strLst = dataCountriesColumn_dict['values'];

// Get Query B
const euCountries_QueryResult = getQueryResult('B');
const euCoutriesColumn_dict = euCountries_QueryResult
   .find((column_dict) => column_dict['name'] === 'Country');
const euCountries_strLst = euCoutriesColumn_dict['values']

// Get Query C
const bestPractices_QueryResult = getQueryResult('C');
let bestPractices_dict = {}
if (!bestPractices_QueryResult) {
   const bestPracticesCountriesColumn_dict = bestPractices_QueryResult
      .find((column_dict) => column_dict['name'] === 'Country');
   const bestPracticesCountriesColumn_strLst = bestPracticesCountriesColumn_dict['values']

   const bestPracticesCommentsColumn_dict = bestPractices_QueryResult
      .find((column_dict) => column_dict['name'] === 'Comment');
   const bestPracticesCommentsColumn_strLst = bestPracticesCommentsColumn_dict['values']

   bestPracticesCountriesColumn_strLst
      .forEach((country_name, index_int) => {
         bestPractices_dict[country_name] = bestPracticesCommentsColumn_strLst[index_int];
      })
   ;
}

// Initialize the countryPolicies_dict var
let countryPolicies_dict = {}
euCountries_strLst
   .forEach(country_str => {
      countryPolicies_dict[country_str] = [];
   })
;

// Add the policies for each country
dataCountries_strLst
   .forEach((country_name, index_int) => {
      countryPolicies_dict[country_name].push(policyTypes_strLst[index_int])
   })
;

// onclick event to pass from the iframe to the window
context.panel.chart.on('click',function (params_dict) {
   // console.log(params_dict);
   const country_name = params_dict['name'];
   const clickData = { 
      'type': 'click-message',
      'Country': country_name,
      "Best Practices": bestPractices_dict[country_name],
      "Policies": countryPolicies_dict?countryPolicies_dict[country_name]:[],
   };
   console.log(clickData);
   window.parent.postMessage(clickData, "*"); // Sends data to parent iframe
});

// Function to format the tooltip
function tooltipFormatter_fun(params_dict, ticket, callback) {
   const country_name = params_dict['name'];
   const policies_cnt = params_dict['value'];

   if (!(country_name in countryPolicies_dict))
      return `<p>Policies: Unknown</p>`;

   const policies_strLst = countryPolicies_dict[country_name];

   if (policies_strLst.length == 0)
      return `<p>Policies: None</p>`;

   let tooltip_html = policies_strLst
      .map((policyType_str) => `<li>${policyType_str}</li>`)
      .join('')
      ;

   return `
      <p>Policies:${policies_cnt}</p>
      <ul style='list-style-type: none; padding:0;'>${tooltip_html}</ul>
   `;
}

// This section is for the legend
let maxPolicies_f = 0;

let data_opt = []
for (const key in countryPolicies_dict) {
   data_opt.push({
      "name": key,
      "value": countryPolicies_dict[key].length
   });
   maxPolicies_f = Math.max(maxPolicies_f, countryPolicies_dict[key].length);
}

// The echarts option
option = {
   title: {
      text: 'Number of CRC Prevention Policies per Country',
      left: 'center'
   },
   tooltip: {
      trigger: 'item',
      formatter: tooltipFormatter_fun,
   },
   visualMap: {
      min: 0,
      max: maxPolicies_f,
      left: 'left',
      top: 'bottom',
      text: ['High', 'Low'],
      calculable: true
   },
   series: [
      {
         name: selectedPolicy_name,
         type: 'map',
         mapType: 'world', // Use 'world' map type, or you can use specific region map type if available
         center: [15, 50], // Center the map on Europe
         zoom: 6,
         roam: false,
         label: {
            show: false
         },
         data: data_opt
      }
   ]
};

return option;

