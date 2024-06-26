
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

const countries_strLst = getSelections("country_filter")

const queryResult = getQueryResult('deli_lifestyle_query');

console.log("queryResult:   ");
console.log(queryResult);

let dataFrame = {};
dataFrame['data']={};

countries_strLst
   .forEach((country_name, index) => {
      const temp = queryResult['fields']
         .filter((column_dict) => column_dict['name'] !== 'Country')
         .map((column_dict) => {
            return column_dict['values'][index]
         })
      ;
      dataFrame['data'][country_name] = temp;
   })
;

dataFrame['index']=[];
queryResult['fields']
   .filter((column_dict) => column_dict['name'] !== 'Country')
   .forEach((column_dict, index) => {
      dataFrame['index'][index] = column_dict['name'];
   })
;

dataFrame['columns'] = Object.keys(dataFrame['data']);

console.log("dataFrame:   ");
console.log(dataFrame);

const data_opt = [
   [ 'Risk Factor', ...dataFrame['columns'] ],

   ...dataFrame['index']
      .map((index_str, index_int) => {
         let temp=[];
         dataFrame['columns']
            .forEach((column_name, index_int) => {
               temp[index_int] = dataFrame.data[column_name][index_int]
            })
         ;
         return [
            index_str,
            ...temp
         ]
      })
   ,
];

console.log("data_opt:     ");
console.log(data_opt);

option = {
   title: {
      text: 'Lifestyle Data'
   },
   legend: {
      type: 'plain',
      orient: 'vertical',
      left: 'right'
   },
   tooltip: {},
   xAxis: { type: 'category' },
   yAxis: {},

   // Declare several bar series, each will be mapped
   // to a column of dataset.source by default.
   series: dataFrame['columns']
      .map((column_name) => {
         return { type: 'bar' };
      }),
   
   dataset: {
      source: data_opt
   }
};
return option;

