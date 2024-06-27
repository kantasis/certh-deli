function getVariable(variable_name) {
   return context.grafana.replaceVariables("${" + variable_name + "}");
}

dataset_dict = {
   "Physical Activity": {
      "Belgium": 4,
      "Greece": 3,
      "Italy": 5,
      "Lithuania": 2,
      "Romania": 0,
      "Spain": 4,
      "Grand Total": 18
   },
   "Smoking": {
      "Belgium": 3,
      "Greece": 7,
      "Italy": 8,
      "Lithuania": 4,
      "Romania": 5,
      "Spain": 11,
      "Grand Total": 38
   },
   "Environment": {
      "Belgium": 9,
      "Greece": 0,
      "Italy": 19,
      "Lithuania": 13,
      "Romania": 4,
      "Spain": 12,
      "Grand Total": 57
   },
   "Alcohol": {
      "Belgium": 4,
      "Greece": 6,
      "Italy": 5,
      "Lithuania": 5,
      "Romania": 3,
      "Spain": 7,
      "Grand Total": 30
   },
   "Nutrition": {
      "Belgium": 6,
      "Greece": 5,
      "Italy": 6,
      "Lithuania": 4,
      "Romania": 0,
      "Spain": 2,
      "Grand Total": 23
   },
   "Health Literacy": {
      "Belgium": 0,
      "Greece": 0,
      "Italy": 3,
      "Lithuania": 0,
      "Romania": 3,
      "Spain": 4,
      "Grand Total": 10
   },
   "Health Promotion": {
      "Belgium": 1,
      "Greece": 0,
      "Italy": 6,
      "Lithuania": 2,
      "Romania": 2,
      "Spain": 4,
      "Grand Total": 15
   },
   "Health Education": {
      "Belgium": 0,
      "Greece": 0,
      "Italy": 3,
      "Lithuania": 1,
      "Romania": 2,
      "Spain": 1,
      "Grand Total": 7
   }
};


const policyFilter_str = getVariable('policy_filter');
const slice_dict = dataset_dict[policyFilter_str]
const countries_strLst = Object.keys(slice_dict);
const data_opt = [];

countries_strLst
   .forEach((country_name, index_int) => {
      const result = { name: country_name, value: slice_dict[country_name] };
      data_opt[index_int] = result;
   })
;

option = {
   title: {
      text: 'Alcohol Consumption by Country',
      left: 'center'
   },
   tooltip: {
      trigger: 'item'
   },
   visualMap: {
      min: 0,
      max: 10,
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

