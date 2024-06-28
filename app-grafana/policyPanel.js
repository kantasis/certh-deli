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

const queryResult = getQueryResult('deli_policy_query')
console.log(queryResult);

const countries_strLst = queryResult
  .find( (column_dict) => column_dict['name'] == 'Country')
  ['values']

const values_intLst = queryResult
  .find( (column_dict) => column_dict['name'] == 'Value')
  ['values']


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
      trigger: 'item'
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
         name: 'Alcohol',
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

