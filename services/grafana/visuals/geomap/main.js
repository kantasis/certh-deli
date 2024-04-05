const requests = data.series.map((s) => {
   const names =
      s.fields.find((f) => f.name === "country_str").values.buffer ||
      s.fields.find((f) => f.name === "country_str").values;
   const values =
      s.fields.find((f) => f.name === "values_f").values.buffer ||
      s.fields.find((f) => f.name === "values_f").values;

   return names.map((name, i) => {
      console.log("x: " + name + " / " + i);
      return {
         name: name,
         value: values[i]
      };
   });
})[0];

const min = Math.min(...requests.map((o) => o.value));
const max = Math.max(...requests.map((o) => o.value));
const labelValue = (max - min) / 4;

// console.log("y: " + min + " / " + max);

return {
   animation: true,
   backgroundColor: "transparent",
   tooltip: {
      trigger: "item",
   },
   visualMap: {
      bottom: "bottom",
      type: "piecewise",
      orient: "horizontal",
      min,
      max,
      text: ["High", "Low"],
      calculable: true,
      inRange: {
         color: ["#e4d8fd", "#c1a4fb", "#b593fa", "#9d70f9"],
      },
   },
   series: [
      {
         type: "map",
         map: "world",
         name: "Requests",
         left: 0,
         right: 0,
         roam: true,
         label: {
            show: true,
            formatter: function (d) {

               if (!d.data || d.data.value <= labelValue) {
                  return "";
               }

               return d.name;
            },
         },
         emphasis: {
            label: {
               show: true,
            },
         },
         data: requests,
      },
   ],
};

