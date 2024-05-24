
function getSeriesByName(series_name) {
   return context
      .panel
      .data
      .series
      .map((series_dict) => {
         const seriesValues_temp = series_dict
            .fields
            .find((item) => item.name === series_name)
            .values
         return seriesValues_temp.buffer || seriesValues_temp;
      })[0];
}

const averages_arr = getSeriesByName('averages');
const maxes_arr = getSeriesByName('maxes');
const keys_arr = getSeriesByName('countries');

const max_f = Math.max(...maxes_arr);
const indicators_arr = keys_arr.map((key_str) => {
   return {
      name: key_str,
      max: max_f
   }
});

// console.log(averages_arr);
// console.log(maxes_arr);
// console.log(max_f);

return {
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
         data: [
            {
            value: averages_arr
            // name: 'Allocated Budget'
            }
         ]
      }
   ]
};