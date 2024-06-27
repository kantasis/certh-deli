
function getSelections(multiSelectVar_name) {
   // Get the variable
   const multiSelect_var = context.grafana.replaceVariables("${" + multiSelectVar_name + "}");
   // Parse it if its multiselect
   result = multiSelect_var.replace(/{/, '').replace(/}/, '').split(',');
   return result;
 }
 
function getSeriesByName(series_name) {
   return context
      .panel
      .data
      .series
      .map((series_dict) => {
         
         const series_temp = series_dict
            .fields
            .find((item) => item.name === series_name)
         ;

         if (series_temp === undefined) {
            console.log(`ERROR (getSeriesByName()): Could not find series by name: ${series_name}`)
            return null;
         }

         const seriesValues_temp = series_temp.values
         return seriesValues_temp.buffer || seriesValues_temp;
      })[0];
}

const countries_strLst = getSelections("country_filter")
const series_lst = countries_strLst.map((country_name) => getSeriesByName(country_name))
const xaxis_ser = getSeriesByName("Year");
const seriesOptions_lst = series_lst.map((data_series, index) => {
   return {
      data: data_series,
      type: 'line',
      name: countries_strLst[index]
   }
});

option = {
   title: {
      text: "Age-Standardised CRC Incidence",
   },
   legend: {
      type: 'plain',
      orient: 'vertical',
      left: 'right'
   },
   tooltip: {},
   xAxis: {
      name: 'Year',
      nameLocation: 'center',
      nameGap: 30,
      type: 'category',
      data: xaxis_ser
   },
   yAxis: {
      name: 'CRC incidence per 100000',
      nameLocation: 'center',
      nameGap: 60,
      type: 'value'
   },

   series: seriesOptions_lst
};

return option;
