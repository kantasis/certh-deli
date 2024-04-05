let values_fLst = [];
let countries_sLst = [];

data.series.map((s) => {

  console.log("ASD: "+s.refId)
   if (s.refId != 'main_query')
      return;
      

   values_fLst = s.fields.find((f) =>
      f.name === 'values_f'
   ).values;

   countries_sLst = s.fields.find((f) =>
      f.name === 'country_str'
   ).values;

});

return {
   tooltip: {
      trigger: 'item'
   },
   xAxis: {
      type: 'category',
      data: countries_sLst
   },
   yAxis: {
      type: 'value'
   },
   series: [
      {
         data: values_fLst,
         type: 'bar'
      }
   ]
};