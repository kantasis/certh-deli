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
 
 // const selectedPolicy_name = getVariable('policy_filter');
 
 const queryResult = getQueryResult('deli_predictive_query')
 
 riskFactor_str = 'Alcohol use'
 
 
const data_dict = {};

queryResult.forEach(column_dict => {
   columnName_dict = column_dict['name'];
   columnValues_Lst = column_dict['values'];
   data_dict[columnName_dict] = columnValues_Lst
});

data_dict['LoHi'] = [];
for (var i = 0; i < data_dict['Values'].length; i++) {
   data_dict['LoHi'].push([
      i,
      data_dict['Values'][i] - data_dict['Error'][i],
      data_dict['Values'][i] + data_dict['Error'][i],
   ])
}

console.log(data_dict['Year Lag'])
console.log(data_dict['Values'])
console.log(data_dict['Error'])

option = {
   tooltip: {
      trigger: 'axis',
      axisPointer: {
         type: 'shadow'
      }
   },
   // title: {
   //    text: 'Error bar chart'
   // },
   legend: {
      data: ['Value', 'Error']
   },
   // dataZoom: [
   //    {
   //       type: 'slider',
   //       start: 50,
   //       end: 70
   //    },
   //    {
   //       type: 'inside',
   //       start: 50,
   //       end: 70
   //    }
   // ],
   xAxis: {
      data: data_dict['Year Lag']
   },
   yAxis: {},
   series: [
      {
         type: 'bar',
         name: 'Value',
         data: data_dict['Values'],
         itemStyle: {
            color: '#77bef7'
         }
      },
      {
         type: 'custom',
         name: 'Error',
         itemStyle: {
            borderWidth: 1.5
         },
         renderItem: function (params, api) {
            var xValue = api.value(0);
            var highPoint = api.coord([xValue, api.value(1)]);

            var lowPoint = api.coord([xValue, api.value(2)]);
            var halfWidth = api.size([1, 0])[0] * 0.1;
            var style = api.style({
               stroke: api.visual('color'),
               // stroke: 'red',
               lineWidth: 2,
               fill: undefined
            });
            
            console.log('---------')
            console.log(api.value(0))
            console.log(api.value(1))
            console.log(api.value(2))

            return {
               type: 'group',
               children: [
                  {
                     type: 'line',
                     transition: ['shape'],
                     shape: {
                     x1: highPoint[0] - halfWidth,
                     y1: highPoint[1],
                     x2: highPoint[0] + halfWidth,
                     y2: highPoint[1]
                     },
                     style: style
                  },
                  {
                     type: 'line',
                     transition: ['shape'],
                     shape: {
                     x1: highPoint[0],
                     y1: highPoint[1],
                     x2: lowPoint[0],
                     y2: lowPoint[1]
                     },
                     style: style
                  },
                  {
                     type: 'line',
                     transition: ['shape'],
                     shape: {
                     x1: lowPoint[0] - halfWidth,
                     y1: lowPoint[1],
                     x2: lowPoint[0] + halfWidth,
                     y2: lowPoint[1]
                     },
                     style: style
                  }
               ]
            };
         },
         encode: {
            x: 0,
            y: [1, 2]
         },
         data: data_dict['LoHi'],
         z: 100
      }
   ]
};

return option;
 