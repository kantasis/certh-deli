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

function getVariable(variable_name) {
   return context.grafana.replaceVariables(`\${${variable_name}}`);
}

const selectedPolicy_name = getVariable('policy_filter');

const queryResult = getQueryResult('deli_policy_query')

const drilldownResult = getQueryResult('deli_policy2_query');

let countryPolicies_dict={}
const policyTypes_strLst = drilldownResult
   .find( (element_dict) => element_dict['name'] === 'Type')
   ['values'];

drilldownResult
   .find( (element_dict) => element_dict['name'] === 'Country')
   ['values']
   .forEach( (country_name, index_int) => {
      if ( ! (country_name in countryPolicies_dict))
         countryPolicies_dict[country_name] = []
      countryPolicies_dict[country_name].push(policyTypes_strLst[index_int])
   })
;

function tooltipFormatter_fun(params_dict, ticket, callback){
   const country_name = params_dict['name'];
   const policies_cnt = params_dict['value'];
   if (! (country_name in countryPolicies_dict))
      return `<p>Policies:Unknown</p>`;

   const policies_strLst = countryPolicies_dict[country_name];
   let tooltip_html = policies_strLst
   .map( (policyType_str) => `<li>${policyType_str}</li>`)
   .join('')
   ;

   return `
      <p>Policies:${policies_cnt}</p>
      <ul>${tooltip_html}</ul>
   `;
   // return countryPolicies_dict[params_dict['name']]
   // ;
   // return "<ul>fool!</ul>";
}



const countries_strLst = queryResult
  .find( (column_dict) => column_dict['name'] == 'Country')
  ['values']
;

const values_intLst = queryResult
  .find( (column_dict) => column_dict['name'] == 'Value')
  ['values']
;

let data_opt = []

countries_strLst
   .forEach((country_name, index_int) => {
      data_opt[index_int] = { name: country_name, value: values_intLst[index_int] };
   })
;

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
      max: Math.max(...values_intLst),
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

