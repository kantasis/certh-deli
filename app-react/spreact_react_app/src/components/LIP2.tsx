import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import ReactECharts from "echarts-for-react";
import { Accordion, Modal, Button } from 'react-bootstrap';
import Comments from "./Comments.tsx";

const AggregationAnalysis = () => {
    const [selectedVariable, setSelectedVariable] = useState("");
    const [selectedPeriodType, setSelectedPeriodType] = useState("");
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]); // State to hold fetched data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const rowsPerPage = 10;

    const variables = useMemo(() => [...new Set(data.map((d) => d.Variable))], [data]);
    const periodTypes = ["Week", "Month"];

    const pieChartVarsDetailed = ["Age", "BMI"];
    const pieChartVarsSimple = [
        "Biological Sex",
        "Smoking status",
        "Activity level",
        "CRC Family history",
        "Diabetes",
        "Education",
        "Employment",
        "Ethnicity",
        "Housing",
        "IBD",
        "Metabolic syndrome",
        "Occupation",
        "Region",
        "Relationship status",
    ];
    const barChartVarsTime = [
        "Alcohol grams/day",
        "Cheese grams/day",
        "Cooked vegetables grams/day",
        "Diary-plant based products mL/day",
        "Fruits grams/day",
        "Large fatty fish grams/day",
        "Legumes grams/day",
        "Nuts seeds grams/day",
        "Processed meat grams/day",
        "Raw vegetables grams/day",
        "Red meat grams/day",
        "Small fatty fish grams/day",
        "Wholegrains grams/day",
        "CRC Risk Assessment Score (PYRAMID)",
    ];

    const accordionContent_dictLst = [
        {
            title: 'Data Sources',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>
                    <p>
                        <li><strong>Source: </strong> ONCODIR’s project prospective data, collected through the NELI mobile application (T4.2) during the Living Lab Integration Test (LIT-02).
                            LIT-02 was designed as a technology acceptance study conducted with external citizens to evaluate both the technical functionality of NELI and its capacity for reliable data collection.
                        </li><br />
                        <li><strong>Data collection: </strong>Preparations for citizen enrollment began in September 2024, and the main study period ran from October to December 2024.
                            By late November 2024, 46 participants were enrolled, exceeding the target of 40, with distribution across countries as follows: 40 in Greece, 3 in Lithuania, 1 in Luxembourg, and 2 in Romania. Only Greek participants were used in this analysis.
                        </li><br />
                        <li><strong>Variables: </strong> The dataset includes both <strong>static variables</strong>, obtained from initial questionnaires, and <strong>non-static variables</strong>, collected bi-weekly.<br></br>
                            <strong>  •	Static variables</strong> cover demographics (e.g., age, biological sex, BMI, ethnicity, country), lifestyle choices (e.g., smoking, daily activity), socioeconomic status (e.g., employment/occupational status, living area, type of housing), education level (e.g., primary education) and clinical history (e.g., family history of CRC, metabolic syndromes).<br></br>
                            <strong>  •	Non-static variables</strong> include nutritional habits (e.g., frequency and portion size of red meat, vegetables, and fruits), and CRC risk assessment scores (evaluated using the <strong>Risk-Stratification Engine</strong>, <strong>PYRAMID</strong>).

                        </li><br />


                    </p>
                </div>

            </>)
        },
        {
            title: 'Methodology',
            content: (<>
                <p>
                    <strong>Preprocessing</strong><br></br>

                    <strong>Daily Nutritional Intake transformation</strong><br></br><br></br>
                    Nutritional habits, assessed by consumption frequency and portion size, were standardized as grams per day for analysis, following the recommendations and feedback from ONCODIR’s WP2 (led by INCLIVA).<br></br>
                    Categorical frequencies were converted to daily servings using a predefined mapping, with weekly and monthly intakes scaled to daily equivalents. Portion sizes were standardized across food and beverage types (e.g., alcoholic beverages: volume in mL converted to grams of ethanol).<br></br>
                    Daily intake was calculated as: quantity per day = daily frequency × portion size (quantity).<br></br><br></br>

                    <strong>Categorization of Daily Nutritional Intake</strong><br></br><br></br>
                    To improve interpretability for non-clinical users, daily nutritional intake (quantity per day) was categorized into meaningful intake groups: Low, Standard, High consumption. Thresholds were defined with input from ONCODIR’s nutritional specialist partner, FoodOxys, guided by public dietary recommendations. Specifically, guidance from the World Health Organization (WHO) [1], the Food and Agriculture Organization of the United Nations (FAO) [2], the U.S. Department of Health and Human Services (HHS) and U.S. Department of Agriculture (USDA) [3], the EAT–Lancet Commission [4], the National Health Service (NHS) [5], and Mediterranean dietary models such as the Global Mediterranean Health (GMH) [6] index was used to establish quantitative cut-offs for each food group.<br></br><br></br>
                    These references provide evidence-based intake ranges for major dietary components (e.g., fruits, vegetables, legumes, wholegrains, dairy, and animal products), ensuring that the categorization reflects both public health targets and current scientific consensus on diet quality and chronic disease prevention.<br></br><br></br>
                    <strong>Transformation of the monthly aggregation of non-static variables</strong><br></br><br></br>
                    Non-static variables collected bi-weekly were aggregated into monthly measurements to ensure a more comparable temporal scale. For each participant, the median value of each non-static variable within a given month was computed, as all non-static variables are categorical.
                    <br></br><br></br>
                    <strong>Aggregation</strong><br></br><br></br>
                    Following preprocessing, both static and non-static variables were aggregated to reflect the overall representation and distribution of the collected variables within the Greek study population. For numerical variables, descriptive statistics were calculated, including the mean, median, standard deviation, minimum, and maximum values. For categorical variables, aggregation was performed by computing the frequency and the percentage of total responses within each category. This analysis was conducted for both the bi- weekly and monthly measurements of the non-static variables.

                </p>
            </>)
        },
        {
            title: 'References',
            content: (<>
                <p>
                    1.	Food and Agriculture Organization of the United Nations, & World Health Organization. (2019). Sustainable healthy diets – Guiding principles.<br></br><br></br>
                    2.	Food and Agriculture Organization of the United Nations. (2016). Plates, pyramids and planets: Developments in national healthy and sustainable dietary guidelines.<br></br><br></br>
                    3.	U.S. Department of Health and Human Services (HHS), & U.S. Department of Agriculture (USDA). (2025). Scientific report of the 2025 Dietary Guidelines Advisory Committee. Washington, DC: HHS and USDA.<br></br><br></br>
                    4.	Willett Walter et al., (2019). Food in the Anthropocene: The EAT–Lancet Commission on healthy diets from sustainable food systems. The Lancet, 393(10170), 447–492.<br></br><br></br>
                    5.	National Health Service (NHS). (2018). The Eatwell Guide. London: Public Health England.<br></br><br></br>
                    6.	Trichopoulou, A., Martínez-González, M.A., Tong, T.Y. et al. Definitions and potential health benefits of the Mediterranean diet: views from experts around the world. BMC Med 12, 112 (2014). https://doi.org/10.1186/1741-7015-12-112.<br></br><br></br>
                </p>
            </>)
        },


    ];



    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // Set loading to true when fetching starts
                const response = await axios.get(
                    "https://oncodir-datapi.catalink.eu/v1/data-fusion/extra/aggregation?country=Greece"
                );
                console.log(response.data); // Inspect the response to confirm its structure

                // Access the results array and set it to data
                if (Array.isArray(response.data.results)) {
                    setData(response.data.results);
                } else {
                    setData([]);  // In case the results aren't an array, set it to an empty array
                }
                setLoading(false); // Set loading to false after data is fetched
            } catch (error) {
                setError("Error fetching data. Please try again later.");
                setLoading(false); // Set loading to false even if there's an error
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [selectedVariable]); // Empty array ensures this effect runs only once when the component mounts

    // Time periods, only relevant for bar variables
    const timePeriods = useMemo(() => {
        if (!barChartVarsTime.includes(selectedVariable)) return [];
        const periods = data
            .filter((d) => d.Variable === selectedVariable)
            .filter((d) =>
                selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : selectedPeriodType === "Month"
                        ? d["Time-Period"] && !d["Time-Period"].includes("/")
                        : true
            )
            .map((d) => d["Time-Period"])
            .filter((v, i, a) => v != null && a.indexOf(v) === i);

        return periods.sort((a, b) => a.toString().localeCompare(b.toString()));
    }, [selectedVariable, selectedPeriodType, data]);

    // Ensure selectedTimePeriod is valid
    useEffect(() => {
        if (barChartVarsTime.includes(selectedVariable)) {
            // ✅ Only reset if it's not one of Week, Month, or "" (All)
            if (
                selectedPeriodType !== "" &&
                !periodTypes.includes(selectedPeriodType)
            ) {
                setSelectedPeriodType("");
            }

            // reset time period if invalid
            if (selectedTimePeriod && !timePeriods.includes(selectedTimePeriod)) {
                setSelectedTimePeriod("");
            }
        } else {
            setSelectedPeriodType("");
            setSelectedTimePeriod("");
        }
    }, [selectedVariable, timePeriods, selectedPeriodType, selectedTimePeriod]);





    const chartType = useMemo(() => {
        if (pieChartVarsDetailed.includes(selectedVariable)) return "pie-detailed";
        if (pieChartVarsSimple.includes(selectedVariable)) return "pie-simple";
        if (barChartVarsTime.includes(selectedVariable)) return "bar";
        return null;
    }, [selectedVariable]);

    useEffect(() => {
        if (selectedTimePeriod === undefined && timePeriods.length > 0) {
            setSelectedTimePeriod("");
        }
    }, [timePeriods]);

    useEffect(() => {
        setSelectedTimePeriod("");
    }, [selectedPeriodType]);

    // Reset or set defaults when selectedVariable changes
    useEffect(() => {
        if (barChartVarsTime.includes(selectedVariable)) {
            // ✅ only set default if user hasn’t chosen anything
            if (selectedPeriodType === undefined) {
                setSelectedPeriodType(""); // default to All
            }

            // reset time period if invalid
            if (selectedTimePeriod && !timePeriods.includes(selectedTimePeriod)) {
                setSelectedTimePeriod("");
            }
        } else {
            setSelectedPeriodType("");
            setSelectedTimePeriod("");
        }
    }, [selectedVariable, timePeriods]);


    const formatTimePeriod = (tp) => {
        if (!tp) return "";
        if (tp.includes("/")) {
            const [start, end] = tp.split("/");
            const [startY, startM, startD] = start.split("-");
            const [endY, endM, endD] = end.split("-");
            return `${startD}-${startM}-${startY} - ${endD}-${endM}-${endY}`;
        }
        if (tp.includes("-")) {
            const [year, month] = tp.split("-");
            return `${month}-${year}`;
        }
        return tp;
    };

    const filteredData = useMemo(() => {
        return data.filter((d) => {
            // Always filter by variable
            const matchesVariable = selectedVariable ? d.Variable === selectedVariable : true;

            // Period type filter (only for bar variables, and only if explicitly chosen)
            let matchesPeriodType = true;
            if (barChartVarsTime.includes(selectedVariable) && selectedPeriodType) {
                matchesPeriodType = selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : d["Time-Period"] && !d["Time-Period"].includes("/");
            }

            // Time period filter (only if chosen and exists in valid list)
            let matchesTimePeriod = true;
            if (barChartVarsTime.includes(selectedVariable) && selectedTimePeriod) {
                matchesTimePeriod = d["Time-Period"] === selectedTimePeriod;
            }

            return matchesVariable && matchesPeriodType && matchesTimePeriod;
        });
    }, [selectedVariable, selectedPeriodType, selectedTimePeriod]);



    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData]);

    const handleDownloadCSV = () => {
        const header = [
            "Variable",
            "Category",
            "Frequency",
            "% of Total",
            "Mean",
            "Median",
            "Std. Dev.",
            "Min",
            "Max",
        ];
        const rows = filteredData.map((row) => [
            row.Variable,
            row.Category,
            row.Frequency != null ? row.Frequency.toString() : "-",
            row["Percentage of Total"] != null ? row["Percentage of Total"].toFixed(2).replace(".", ",") : "-",
            row.Mean != null ? row.Mean.toFixed(2).replace(".", ",") : "-",
            row.Median != null ? (typeof row.Median === "number" ? row.Median.toFixed(2).replace(".", ",") : row.Median) : "-",
            row["Std. Dev."] != null ? row["Std. Dev."].toFixed(2).replace(".", ",") : "-",
            row.Min != null ? row.Min.toString().replace(".", ",") : "-",
            row.Max != null ? row.Max.toString().replace(".", ",") : "-",
        ]);


        const csvArray = [header, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(";"));
        const csvContent = "\uFEFF" + csvArray.join("\n");
        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aggregation_${selectedVariable || "data"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // --- Color Mapping ---
    const colorMapping = {
        "Activity level": { "Very active": "green", Active: "blue", "Somewhat active": "yellow", "Not active at all/Sedentary": "red" },
        Age: { "<40": "green", "50-60": "yellow", "70+": "red", Missing: "gray" },
        BMI: { Normal: "green", Underweight: "yellow", Overweight: "blue", Obese: "red", Missing: "gray" },
        "Biological Sex": { Male: "blue", Female: "yellow", Missing: "gray" },
        "CRC Family history": { No: "green", Yes: "red" },
        "Region": { Urban: "#fac858", Rural: "#5470c6", Suburban: "#91cc75" },
        Diabetes: { No: "green" },
        Education: { "Elementary education (Basic reading and writing)": "yellow", "Secondary education or vocational training": "orange", "University education (Bachelor’s degree)": "blue", "Postgraduate education (Master’s degree, PhD)": "lightblue" },
        Employment: { "Still studying": "yellow", "Part-time / Seasonal employment": "orange", "Full-time / Self-employed": "lightblue", Retired: "blue" },
        Ethnicity: { Caucasian: "yellow", Other: "orange" },
        Housing: { Apartment: "yellow", Duplex: "green", "Single-family house": "orange", "Studio Apartment": "blue", Townhouse: "purple" },
        IBD: { No: "green", Yes: "red" },
        "Metabolic syndrome": { No: "green", Yes: "red" },
        Occupation: { "Elementary occupation": "lightblue", Manager: "yellow", Professional: "orange", "Service and sales worker": "green", "Skilled agricultural, forestry and fishery worker": "purple", "Technician and associate professional": "darkgreen", "Don't know / No answer": "lightgray", Missing: "gray" },
        "Relationship status": { "Living with a partner": "blue", "Living without a partner": "yellow" },
        "Smoking status": { "I have never smoked": "green", "I am a former smoker": "orange", "I am currently a regular smoker": "red" },
        "Alcohol grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "CRC Risk Assessment Score (PYRAMID)": { Missing: "gray", 2: "green", 3: "yellow", 4: "red" },
        "Cheese grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Cooked vegetables grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Diary-plant based products mL/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Fruits grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Large fatty fish grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Legumes grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Nuts seeds grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "Processed meat grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "Raw vegetables grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Red meat grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "Small fatty fish grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Wholegrains grams/day": { Missing: "gray", Low: "red", Standard: "green" },
    };

    const pieCategoryOrder = {
        "Activity level": ["Very active", "Active", "Somewhat active", "Not active at all/Sedentary"],
        Age: ["<40", "50-60", "70+", "Missing"],
        BMI: ["Normal", "Underweight", "Overweight", "Obese", "Missing"],
        "Biological Sex": ["Male", "Female", "Missing"],
        "CRC Family history": ["No", "Yes"],
        Diabetes: ["No"],
        Education: [
            "Elementary education (Basic reading and writing)",
            "Secondary education or vocational training",
            "University education (Bachelor’s degree)",
            "Postgraduate education (Master’s degree, PhD)"
        ],
        Employment: ["Still studying", "Part-time / Seasonal employment", "Full-time / Self-employed", "Retired"],
        Ethnicity: ["Caucasian", "Other"],
        Housing: ["Apartment", "Duplex", "Single-family house", "Studio Apartment", "Townhouse"],
        IBD: ["No", "Yes"],
        "Metabolic syndrome": ["No", "Yes"],
        Occupation: [
            "Elementary occupation",
            "Manager",
            "Professional",
            "Service and sales worker",
            "Skilled agricultural, forestry and fishery worker",
            "Technician and associate professional",
            "Don't know / No answer",
            "Missing"
        ],
        Region: null, // keep original order
        "Relationship status": ["Living with a partner", "Living without a partner"],
        "Smoking status": ["I have never smoked", "I am a former smoker", "I am currently a regular smoker"]
    };


    const variableDescription: Record<string, string> = {
        "Activity level": "Participant’s self-reported activity level from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Very active, Active, Somewhat active, Somewhat active, Not active at all/Sedentary.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Age": "Age is calculated from the participant’s year of birth reported in the Health and Lifestyle questionnaire (NELI app) and the year the data was recorded.<br /><br />" +
            "The resulting age is then categorized as: <40, 50-60, 70+.<br /><br />" +
            "(Static variable – does not change over time.)",

        "BMI": "Body Mass Index (BMI) is calculated from the participant’s weight (kg) and height (cm) reported in the Health and Lifestyle questionnaire (NELI app), using the formula: BMI = weight / (height/100)^2.<br /><br />" +
            "The results are then categorized as follows: Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), Obese (≥30).<br /><br />" +
            "(Static variable – does not change over time.)",

        "Biological Sex": "Participant’s biological sex from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Male, Female.<br /><br />" +
            "(Static variable – does not change over time.)",

        "CRC Family history": "Participant’s self-reported CRC family history from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Yes, No.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Diabetes": "Participant’s self-reported diabetes from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Yes, No.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Education": "Participant’s self-reported education from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Elementary education (Basic reading and writing), Secondary education or vocational training, University education (Bachelor’s degree), Postgraduate education (Master’s degree, PhD).<br /><br />" +
            "(Static variable – does not change over time.)",

        "Employment": "Participant’s self-reported employment status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
            "Options: Still studying, Part-time/Seasonal employment, Full-time/Self-employed, Retired.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Ethnicity": "Participant’s self-reported ethnicity from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Caucasian, Asian, African, Hispanic/Latino, Jewish, Romani, Other.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Housing": "Participant’s self-reported housing status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
            "Options: Apartment, Duplex, Single-family house, Studio Apartment, Townhouse.<br /><br />" +
            "(Static variable – does not change over time.)",

        "IBD": "Participant’s self-reported Inflammatory Bowel Disease (IBD) from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Yes, No.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Metabolic syndrome": "Participant’s self-reported metabolic syndrome from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: Yes, No.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Occupation": "Participant’s self-reported occupational status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
            "Options: Elementary occupation, Manager, Professional, Service and sales worker, Skilled agricultural, forestry and fishery worker, Technician and associate professional, Don't know / No answer.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Region": "Participant’s self-reported region status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
            "Options: Rural, Suburban, Urban.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Relationship status": "Participant’s self-reported relationship status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
            "Options: Living with a partner, Living without a partner.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Smoking status": "Participant’s self-reported smoking status from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
            "Options: I have never smoked, I am a former smoker, I am currently a regular smoker.<br /><br />" +
            "(Static variable – does not change over time.)",

        "Alcohol grams/day": "Alcohol consumption is defined based on the self-reported wine, beer, and distilled frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Alcohol quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "Alcohol grams/day was then categorized according to sex: for Men, Standard (≤30 g/day) and High (>30 g/day); for Women, Standard (≤15 g/day) and High (>15 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "CRC Risk Assessment Score (PYRAMID)": "CRC risk assessment score is evaluated using PYRAMID, a risk assessment tool developed within the ONCODIR project, which takes multiple factors from NELI data as input to stratify participants into five risk levels (1–5) for CRC.<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Cheese grams/day": "Cheese consumption is defined based on the self-reported cheese consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Cheese quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<60 g/day) and Standard (>= 60 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Cooked vegetables grams/day": "Cooked vegetable consumption is defined based on the self-reported cooked vegetable consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Cooked vegetable quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<150 g/day) and Standard (>= 150 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Diary-plant based products mL/day": "Diary-plant based products consumption is defined based on the self-reported milk (ml) or yogurt frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in mL) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (mL/day) was then categorized as follows: Low (<480 mL/day) and Standard (>= 480 mL/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Fruits grams/day": "Fruit consumption is defined based on the self-reported fruit consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Fruit quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<120 g/day) and Standard (>= 120 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Large fatty fish grams/day": "Large fatty fish consumption is defined based on the self-reported large fatty fish consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<43 g/day) and Standard (>= 43 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Legumes grams/day": "Legume consumption is defined based on the self-reported legume consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<64 g/day) and Standard (>= 64 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Nuts seeds grams/day": "Nuts consumption is defined based on the self-reported nuts consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Standard (<=30 g/day) and High (>30 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Processed meat grams/day": "Processed meat consumption is defined based on the self-reported processed meat consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Standard (<=7 g/day) and High (>7 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Raw vegetables grams/day": "Raw vegetables consumption is defined based on the self-reported raw vegetables consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<150 g/day) and Standard (>=150 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Red meat grams/day": "Red meat consumption is defined based on the self-reported red meat consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Standard (<=21 g/day) and High (>21 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Small fatty fish grams/day": "Small fatty fish consumption is defined based on the self-reported small fatty fish consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<43 g/day) and Standard (>=43 g/day).<br /><br />" +
            "(Non-Static variable – measured biweekly.)",

        "Wholegrains grams/day": "Wholegrain consumption is defined based on the self-reported wholegrain or potato consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
            "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
            "The resulting intake (grams/day) was then categorized as follows: Low (<350 g/day) and Standard (>=350 g/day).<br />" +
            "(Non-Static variable – measured biweekly.)"
    };


    // --- Pie Chart Options ---
    const getPieOptions = (detailed = false) => {
        const order = pieCategoryOrder[selectedVariable];

        // Sort data according to custom order
        let dataSorted;
        if (order) {
            dataSorted = order
                .map(cat => filteredData.find(d => d.Category === cat))
                .filter(Boolean); // remove missing categories
        } else {
            dataSorted = [...filteredData]; // original order if no custom order
        }

        const seriesData = dataSorted.map((d) => ({
            name: d.Category,
            value: d["Percentage of Total"] ?? 0,
            itemStyle: { color: colorMapping[selectedVariable]?.[d.Category] || "#ccc" },
        }));

        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const row = filteredData.find((r) => r.Category === params.name);
                    if (!row) return '';
                    const pct = row["Percentage of Total"] != null ? row["Percentage of Total"].toFixed(2) : "-";
                    const freq = row.Frequency != null ? row.Frequency : "-";

                    return `
                    <strong>${params.name}</strong><br/>
                    <strong>Percentage of Total:</strong> ${pct}%<br/>
                    <strong>Frequency:</strong> ${freq}<br/>
                    ${detailed
                            ? `<strong>Mean:</strong> ${row.Mean?.toFixed(2) ?? "-"}<br/>
                           <strong>Median:</strong> ${row.Median?.toFixed(2) ?? "-"}<br/>
                           <strong>Std. Dev.:</strong> ${row["Std. Dev."]?.toFixed(2) ?? "-"}<br/>
                           <strong>Min:</strong> ${row.Min?.toFixed(2) ?? "-"}<br/>
                           <strong>Max:</strong> ${row.Max?.toFixed(2) ?? "-"}`
                            : ""}
                `;
                },
            },
            legend: { top: 20 },
            series: [{ type: "pie", radius: "60%", data: seriesData }],
        };
    };
    // helper function to map your custom colors to bootstrap table classes
    const getBootstrapRowClass = (variable: string, category: string) => {
        const color = colorMapping[variable]?.[category];

        switch (color) {
            case "green":
            case "#91cc75":
            case "lightgreen":
                return "table-success";
            case "red":
                return "table-danger";
            case "yellow":
            case "orange":
            case "#fac858":
                return "table-warning";
            case "blue":
            case "lightblue":
            case "#5470c6":
                return "table-info";
            case "gray":
            case "lightgray":
                return "table-secondary";
            default:
                return "";
        }
    };



    // --- Bar Chart Options ---
    const getBarOptions = () => {
        let allCategories =
            selectedVariable === "CRC Risk Assessment Score (PYRAMID)"
                ? [2, 3, 4, "Missing"]
                : ["Low", "Standard", "High", "Missing"];

        // Keep only categories present in the filtered data
        const existingCategories = allCategories.filter(cat =>
            filteredData.some(d => d.Category === cat)
        );

        const timePeriods = [...new Set(filteredData.map(d => d["Time-Period"]))];

        const dataMap = {};
        filteredData.forEach(d => {
            const key = `${d.Category}||${d["Time-Period"]}`;
            dataMap[key] = d;
        });

        const series = existingCategories.map(cat => ({
            name: cat,
            type: "bar",
            stack: "total",
            emphasis: { focus: "series" },
            itemStyle: { color: colorMapping[selectedVariable]?.[cat] || "#ccc" },
            data: timePeriods.map(tp => {
                const entry = dataMap[`${cat}||${tp}`];
                return {
                    value: entry?.Frequency ?? 0,
                    raw: entry || { Frequency: 0 }
                };
            })
        }));

        const safeNum = (val) => (typeof val === "number" && !isNaN(val) ? val.toFixed(2) : "-");

        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const entry = params.data?.raw || {};
                    return `
                        <strong>${params.seriesName}</strong><br/>
                        <strong>Time Period: </strong>${params.name}<br/>
                        <strong>Frequency: </strong>${params.value}
                        ${typeof entry.Mean === "number" ? `<br/><strong>Mean: </strong>${entry.Mean.toFixed(2)}` : ""}
                        ${typeof entry.Median === "number" ? `<br/><strong>Median: </strong>${entry.Median.toFixed(2)}` : ""}
                        ${typeof entry["Std. Dev."] === "number" ? `<br/><strong>Std. Dev.: </strong>${entry["Std. Dev."].toFixed(2)}` : ""}
                        ${typeof entry.Min === "number" ? `<br/><strong>Min: </strong>${entry.Min.toFixed(2)}` : ""}
                        ${typeof entry.Max === "number" ? `<br/><strong>Max: </strong>${entry.Max.toFixed(2)}` : ""}
                    `;

                }
            },
            legend: { top: 20 },
            xAxis: { type: "category", data: timePeriods.map(tp => formatTimePeriod(tp)) },
            yAxis: { type: "value", name: "Frequency" },
            series
        };
    };

    return (

        <div className="container-fluid mt-3">

            <div className="row">
                <h3>Aggregation Analysis</h3>
                {/* Left Column */}
                <div className="col-2">
                    <label className="fw-bold mb-1">Select Variable</label>
                    <select
                        className="form-control mb-3"
                        value={selectedVariable}
                        onChange={(e) => setSelectedVariable(e.target.value)}
                    >
                        <option value="">-- Select Variable --</option>
                        {variables.map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                        ))}
                    </select>

                    {barChartVarsTime.includes(selectedVariable) && (
                        <>
                            <label><strong>Period Type</strong></label>
                            <select
                                className="form-control mb-3"
                                value={selectedPeriodType}
                                onChange={(e) => setSelectedPeriodType(e.target.value)}
                            >
                                <option value="">-- All Period Types --</option>
                                {periodTypes.map((pt, i) => (
                                    <option key={i} value={pt}>{pt}</option>
                                ))}
                            </select>

                            <label><strong>Time Period</strong></label>
                            <select
                                className="form-control mb-3"
                                value={selectedTimePeriod}
                                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                disabled={!selectedPeriodType}
                            >
                                <option value="">-- All Time Periods --</option>
                                {timePeriods.map((tp, i) => (
                                    <option key={i} value={tp}>{formatTimePeriod(tp)}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {selectedVariable && (
                        <div className="mb-3">
                            <strong>Description</strong>
                            <small className="form-control mt-1"
                                dangerouslySetInnerHTML={{ __html: variableDescription[selectedVariable] ?? "" }} />
                        </div>
                    )}

                </div>

                {/* Main Column */}
                <div className="col-8 mt-5">

                    <h5 className="">{selectedVariable}</h5>
                    {!selectedVariable && <p>Through this tab, users can explore insights from <strong>LIP2</strong> (Greece).<br></br><br></br>
                        The <strong>Aggregation Analysis </strong>summarizes data from the NELI mobile app (T4.2),<br></br> providing population-level insights across <strong>Greece.</strong> <br></br><br></br>Please select a variable from the dropdown menu on the left.
                    </p>}
                    {loading && (
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 10,
                            }}
                        >
                            <div
                                className="spinner-border text-primary"
                                role="status"
                                style={{ width: "3rem", height: "3rem" }}
                            ></div>
                            <div
                                style={{
                                    marginTop: "1rem",
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    color: "#333",
                                }}
                            >
                                Loading...
                            </div>
                        </div>
                    )}
                    {selectedVariable && !loading && filteredData.length > 0 && (
                        <>
                            {chartType === "pie-detailed" && <ReactECharts key={selectedVariable} option={getPieOptions(true)} style={{ height: 400 }} />}
                            {chartType === "pie-simple" && <ReactECharts key={selectedVariable} option={getPieOptions(false)} style={{ height: 400 }} />}
                            {chartType === "bar" && <ReactECharts key={selectedVariable} option={getBarOptions()} style={{ height: 400 }} />}

                            <Button className="mt-3" onClick={() => setShowModal(true)}>View Table</Button>

                            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>{selectedVariable}</Modal.Title>
                                    <Button variant="success" className="ms-auto" onClick={handleDownloadCSV}>Download CSV</Button>
                                </Modal.Header>
                                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-200 rounded-lg shadow-md">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Color</th>
                                                    {[
                                                        "Variable",
                                                        "Category",
                                                        "Frequency",
                                                        "% of Total",
                                                        "Mean",
                                                        "Median",
                                                        "Std. Dev.",
                                                        "Min",
                                                        "Max",
                                                    ].map((header, i) => (
                                                        <th
                                                            key={i}
                                                            className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                                                        >
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentData.map((row, idx) => {
                                                    const color = colorMapping[row.Variable]?.[row.Category] || "#ccc";

                                                    return (
                                                        <tr key={idx} style={{ height: "50px" }}>
                                                            <td className="px-4 py-2 text-center">
                                                                <div
                                                                    style={{
                                                                        width: "16px",
                                                                        height: "16px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: colorMapping[row.Variable]?.[row.Category] || "#ccc",
                                                                        display: "inline-block",
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">{row.Variable}</td>
                                                            <td className="px-4 py-2">{row.Category}</td>
                                                            <td className="px-4 py-2">{row.Frequency ?? "-"}</td>
                                                            <td className="px-4 py-2">{row["Percentage of Total"]?.toFixed(2) ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Mean?.toFixed(2) ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Median ?? "-"}</td>
                                                            <td className="px-4 py-2">{row["Std. Dev."]?.toFixed(2) ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Min ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Max ?? "-"}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                    </div>
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                                    <span className="mx-2">Page {currentPage} of {totalPages}</span>
                                    <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
                </div>
                {/* Right column */}
                <div className="col-sm-2">
                    {/* <h5>Glossary</h5> */}
                    <Accordion defaultActiveKey="-1">
                        {accordionContent_dictLst.map((accordionContent_dict, itemIndex_int) => {

                            return (
                                <Accordion.Item
                                    eventKey={itemIndex_int.toString()}
                                    key={itemIndex_int}
                                >
                                    <Accordion.Header>

                                        {accordionContent_dict.title}
                                    </Accordion.Header>


                                    <Accordion.Body className="text-start" style={{ height: "340px", overflow: "scroll" }}>
                                        {accordionContent_dict.content}
                                    </Accordion.Body>

                                </Accordion.Item>
                            );
                        })}
                    </Accordion>

                    <Comments />

                </div>

            </div>
        </div>
    );
};

export default AggregationAnalysis;
