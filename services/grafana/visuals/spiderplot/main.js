
let values_fLst = [];
let countries_sLst = [];

data.series.map((s) => {

   if (s.refId != 'main_query')
      return;

   values_fLst = s.fields.find((f) =>
      f.name === 'values_f'
   ).values;

   countries_sLst = s.fields.find((f) =>
      f.name === 'country_str'
   ).values;

});

indicator_Lst = []
for (let i in countries_sLst) {
   indicator_Lst[i] = {
      name: countries_sLst[i],
      max: 30,
   }
}

return {
   title: {
      text: 'Basic Radar Chart'
   },
   tooltip: {
      trigger: 'item'
   },
   // legend: {
   //    data: ['Allocated Budget', 'Actual Spending']
   // },
   radar: {
      // shape: 'circle',
      indicator: indicator_Lst
   },
   series: [
      {
         name: 'Budget vs spending',
         type: 'radar',
         data: [
            {
               value: values_fLst
               // name: 'Allocated Budget'
            }
         ]
      }
   ]
};
