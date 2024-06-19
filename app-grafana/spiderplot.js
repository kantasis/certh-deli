
function getSelections(multiSelectVar_name) {
   // Get the variable
   const multiSelect_var = context.grafana.replaceVariables("${" + multiSelectVar_name + "}");
   // Parse it if its multiselect
   result = multiSelect_var.replace(/{/, '').replace(/}/, '').split(',');
   return result;
}

function getQueryResult(query_name) {
   return context
      .panel
      .data
      .series
      .find((series_dict) =>
         series_dict['refId'] === query_name
      )
   ;
}

const queryResult = getQueryResult('A');

const indicators_arr = queryResult['fields']
   .filter((column_dict) => column_dict['name'] !== 'Country')
   .map((column_dict) => {
      return {
         name: column_dict['name'],
         max: Math.max(...column_dict['values'])
      }
   }
);

console.log("indicators_arr:   ");
console.log(indicators_arr);

let dataFrame = {};
queryResult['fields']
   .find((column_dict) => column_dict['name'] === 'Country')
   .values
   .forEach((country_name, index) => {
   const temp = queryResult['fields']
      .filter((column_dict) => column_dict['name'] !== 'Country')
      .map((column_dict) => {
         return column_dict['values'][index]
      })
      // .values
      ;

   // console.log(`Temp: ${temp}`);
   dataFrame[country_name] = temp;

   })
   ;

const columns_strLst = Object.keys(dataFrame);

const data_opt = columns_strLst
   .map((column_name) => {
   return {
      value: dataFrame[column_name],
      name: column_name
   };
   })

console.log("dataFrame: ");
console.log(dataFrame);

option = {
   title: {
      text: 'Basic Radar Chart'
   },
   // legend: {
   //    data: ['Allocated Budget', 'Actual Spending']
   // },
   radar: {
      // shape: 'circle',
      indicator: indicators_arr
   },
   series: [
      {
         name: 'Budget vs spending',
         type: 'radar',
         data: data_opt
      }
   ]
};
return option;

