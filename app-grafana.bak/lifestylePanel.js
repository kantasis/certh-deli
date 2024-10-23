
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

const selectedCountries_strLst = getSelections("country_filter")

const queryResult = getQueryResult('deli_lifestyle_query');
const allCountries_strLst = queryResult['fields']
   .find((column_dict) => column_dict['name'] === 'Country')
   ['values'];

let dataFrame = {};
dataFrame['data']={};

// console.log(queryResult);
selectedCountries_strLst
   .forEach((country_name, selectedCountry_idx) => {

      country_idx = allCountries_strLst.indexOf(country_name);

      // console.log(country_name)
      // console.log(queryResult['fields']
      //    .filter((column_dict) => column_dict['name'] !== 'Country')
      //    .map((column_dict) => column_dict['values'][country_idx])
      // );

      const countryValues_arr = queryResult['fields']
         .filter((column_dict) => column_dict['name'] !== 'Country')
         .map((column_dict) => {
            return column_dict['values'][country_idx]
         })
      ;
      dataFrame['data'][country_name] = countryValues_arr;

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

// console.log(dataFrame);

const data_opt = [
   [ 'Risk Factor', ...dataFrame['columns'] ],

   ...dataFrame['index']
      .map((index_str, index_idx) => {
         let temp=[];
         dataFrame['columns']
            .forEach((column_name, column_idx) => {
               temp[column_idx] = dataFrame.data[column_name][index_idx]
            })
         ;
         return [
            index_str,
            ...temp
         ]
      })
   ,
];

// console.log(data_opt);


option = {
   title: {
      text: 'Lifestyle Data'
   },
   legend: {
      type: 'plain',
      orient: 'vertical',
      left: 'right'
   },
   tooltip: {
      valueFormatter: (value) => parseFloat(value).toFixed(2)
   },
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

