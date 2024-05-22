console.log("asdf:");

var myChart = echarts.init(document.getElementById('main'));
var option = {
    title: {
        text: "疫情地图: 2020-03-09",
        subtext: "作者：@librabyte"
    },
    tooltip: {
        triggerOn: "click",
    },
    toolbox: {
        feature: {
            dataView: {show: true, readOnly: true},
            restore: {show: true},
            saveAsImage: {show: true}
        }
    },
    visualMap: {
        min: 0,
        max: 100000,
        left: 26,
        bottom: 40,
        showLabel: !0,
        text: ["高", "低"],
        pieces: [{
            gt: 10000,
            label: "&gt; 10000",
            color: "#7f1100"
        }, {
            gte: 1000,
            lte: 10000,
            label: "1000 - 9999",
            color: "#cf1e06"
        }, {
            gte: 100,
            lt: 1000,
            label: "100 - 999",
            color: "#ff5428"
        }, {
            gte: 10,
            lt: 100,
            label: "10 - 99",
            color: "#ff8c71"
        }, {
            gte: 1,
            lt: 10,
            label: "1 - 9",
            color: "#ffd768"
        }, {
            value: 0,
            color: "#ffffff"
        }],
        show: !0
    },
    geo: {
        map: "china",
        roam: !1,
        scaleLimit: {
            min: 1,
            max: 2
        },
        zoom: 1.23,
        top: 120,
        label: {
            normal: {
                show: !0,
                fontSize: "14",
                color: "rgba(0,0,0,0.7)"
            }
        },
        itemStyle: {
            normal: {
                borderColor: "rgba(0, 0, 0, 0.2)"
            },
            emphasis: {
                areaColor: "#f2d5ad",
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                borderWidth: 0
            }
        }
    },
    series: [{
        name: "确诊病例",
        type: "map",
        geoIndex: 0,
        data: dataList = [
            { name: "南海诸岛", value: 0 }, { name: '北京', value: 105 }, 
            { name: '天津', value: 3 }, { name: '上海', value: 24 }, 
            { name: '重庆', value: 42 }, { name: '河北', value: 5 }, 
            { name: '河南', value: 3 }, { name: '云南', value: 2 }, 
            { name: '辽宁', value: 15 }, { name: '黑龙江', value: 45 }, 
            { name: '湖南', value: 35 }, { name: '安徽', value: 0 }, 
            { name: '山东', value: 52 }, { name: '新疆', value: 0 }, 
            { name: '江苏', value: 10 }, { name: '浙江', value: 38 }, 
            { name: '江西', value: 11 }, { name: '湖北', value: 18248 }, 
            { name: '广西', value: 20 }, { name: '甘肃', value: 35 }, 
            { name: '山西', value: 6 }, { name: '内蒙古', value: 4 }, 
            { name: '陕西', value: 17 }, { name: '吉林', value: 2 }, 
            { name: '福建', value: 0 }, { name: '贵州', value: 21 }, 
            { name: '广东', value: 84 }, { name: '青海', value: 0 }, 
            { name: '西藏', value: 0 }, { name: '四川', value: 70 }, 
            { name: '宁夏', value: 4 }, { name: '海南', value: 3 }, 
            { name: '台湾', value: 29 }, { name: '香港', value: 53 }, 
            { name: '澳门', value: 0 },
        ]
    }]
};
myChart.setOption(option);