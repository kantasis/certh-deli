import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import ReactECharts from "echarts-for-react";
import { Accordion, Modal, Button, Card } from 'react-bootstrap';
import { useSearchParams } from "react-router-dom";
import Comments from "./Comments.tsx";
import { useLocation } from "react-router-dom";
import { helper } from "echarts";

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
    const location = useLocation();
    const isPopulationGroups = location.pathname.includes("lip2-population-groups");
    const [showGraph, setShowGraph] = useState(false);


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

    const accordionContentAggregation_dictLst = [
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

    const accordionContentPopulation_dictLst = [
        {
            title: 'Data Sources',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>
                    <p>
                        <li><strong>Source: </strong>ONCODIR’s project prospective data, collected through the NELI mobile application (T4.2) during the Living Lab Integration Test (LIT-02). LIT-02 was designed as a technology acceptance study conducted with external citizens to evaluate both the technical functionality of NELI and its capacity for reliable data collection.
                        </li><br />
                        <li><strong>Data collection: </strong>Preparations for citizen enrollment began in September 2024, and the main study period ran from October to December 2024. By late November 2024, 46 participants were enrolled, exceeding the target of 40, with distribution across countries as follows: 40 in Greece, 3 in Lithuania, 1 in Luxembourg, and 2 in Romania. Only Greek participants were used in this analysis.
                        </li><br />
                        <li><strong>Variables: </strong> The dataset includes both <strong>static variables</strong>, obtained from initial questionnaires, and <strong>non-static variables</strong>, collected bi-weekly.<br></br>
                            <br></br>      <strong>  •	Static variables</strong> cover demographics (e.g., age, biological sex, BMI, ethnicity, country), lifestyle choices (e.g., smoking, daily activity), socioeconomic status (e.g., employment/occupational status, living area, type of housing), education level (e.g., primary education) and clinical history (e.g., family history of CRC, metabolic syndromes).<br></br>
                            <br></br>   <strong>  •	Non-static variables</strong> include nutritional habits (e.g., frequency and portion size of red meat, vegetables, and fruits), and CRC risk assessment scores (evaluated using the <strong>Risk-Stratification Engine</strong>, <strong>PYRAMID</strong>).

                        </li><br />


                    </p>
                </div>

            </>)
        },
        {
            title: 'Methodology',
            content: (<>
                <p>

                    <strong>Categorization of numerical variables</strong><br></br><br></br>
                    Age was grouped into &lt;40, 40-70, 70+, while BMI was classified as underweight (&lt;18.5), normal (18.5–24.9), overweight (25–29.9), and obese (&ge;30).<br /><br />
                    <strong>Non-static variable transformation</strong><br></br><br></br>
                    Dietary intake (frequency × portion size) was standardized to grams/day. Due to limited bi-weekly data, non-static variables were transformed to static by being summarized as participant means (numerical) or medians (categorical). Participants with &lt;40% missing data were excluded, while remaining missing values were imputed/filled (mean for numerical, “Missing” or “Not answered” for categorical).<br></br><br></br>
                    <strong>Clustering</strong><br></br><br></br>
                    Hierarchical clustering with Gower distance was applied. Twelve clusters (k=12) were predefined. Cluster centroids were calculated using means for numerical variables and medians or the most frequent non-missing categories for categorical variables, enabling the identification of each cluster’s unique characteristics.
                    <br></br><br></br> Clustering analysis was based on an optimized 10-feature set provided by the MoHGR and restricted to Greek citizens (n=40), resulting in 12 distinct and interpretable subgroups

                </p>
            </>)
        },



    ];


    // ✅ Get query params using React Router's hook
    const [searchParams] = useSearchParams();
    const country = searchParams.get("country");
    console.log(country)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `https://oncodir-datapi.catalink.eu/v1/data-fusion/extra/aggregation?country=${encodeURIComponent(country)}`
                );

                console.log(response.data);

                if (Array.isArray(response.data.results)) {
                    setData(response.data.results);
                } else {
                    setData([]);
                }
            } catch (error) {
                setError("Error fetching data. Please try again later.");
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [country]); // ✅ Re-run when variable or query param changes


    useEffect(() => {
        setSelectedVariable("");
        setSelectedPeriodType("");
        setSelectedTimePeriod("");
        setCurrentPage(1);
    }, [country]);
    // Empty array ensures this effect runs only once when the component mounts

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
    }, [data, selectedVariable, selectedPeriodType, selectedTimePeriod, country]);



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

        const rows = filteredData.map((row) => {
            // Mutate Category for "50-60" to "40-70"
            const displayCategory = row.Category === "50-60" ? "40-70" : row.Category;

            return [
                row.Variable,
                displayCategory, // Use mutated category here
                row.Frequency != null ? row.Frequency.toString() : "-",
                row["Percentage of Total"] != null ? row["Percentage of Total"].toFixed(2).replace(".", ",") : "-",
                row.Mean != null ? row.Mean.toFixed(2).replace(".", ",") : "-",
                row.Median != null ? (typeof row.Median === "number" ? row.Median.toFixed(2).replace(".", ",") : row.Median) : "-",
                row["Std. Dev."] != null ? row["Std. Dev."].toFixed(2).replace(".", ",") : "-",
                row.Min != null ? row.Min.toString().replace(".", ",") : "-",
                row.Max != null ? row.Max.toString().replace(".", ",") : "-",
            ];
        });

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
            "The resulting age is then categorized as: <40, 40-70, 70+.<br /><br />" +
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

        const seriesData = dataSorted.map((d) => {
            const displayName =
                selectedVariable === "Age" && d.Category === "50-60" ? "40-70" : d.Category;

            return {
                name: displayName,        // displayed in tooltip & legend
                value: d["Percentage of Total"] ?? 0,
                itemStyle: { color: colorMapping[selectedVariable]?.[d.Category] || "#ccc" },
                raw: d,                   // keep the original raw data (Category still "50-60")
            };
        });


        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const entry = params.data?.raw || {};

                    // Show display name for 50-60 → 40-70
                    const categoryDisplay =
                        selectedVariable === "Age" && entry.Category === "50-60" ? "40-70" : entry.Category;

                    return `
      <strong>${categoryDisplay}</strong><br/>
      <strong>Frequency: </strong>${entry.Frequency ?? "-"}<br/>
      <strong>Percentage of Total: </strong>${entry["Percentage of Total"]?.toFixed(2) ?? "-"}%<br/>
      ${typeof entry.Mean === "number" ? `<strong>Mean: </strong>${entry.Mean.toFixed(2)}<br/>` : ""}
      ${typeof entry.Median === "number" ? `<strong>Median: </strong>${entry.Median.toFixed(2)}<br/>` : ""}
      ${typeof entry["Std. Dev."] === "number" ? `<strong>Std. Dev.: </strong>${entry["Std. Dev."].toFixed(2)}<br/>` : ""}
      ${typeof entry.Min === "number" ? `<strong>Min: </strong>${entry.Min.toFixed(2)}<br/>` : ""}
      ${typeof entry.Max === "number" ? `<strong>Max: </strong>${entry.Max.toFixed(2)}<br/>` : ""}
    `;
                },
            },

            legend: { top: 20 },
            series: [{ type: "pie", radius: "60%", data: seriesData }],
        };
    };
    // helper function to map your custom colors to bootstrap table classes
    // const getBootstrapRowClass = (variable: string, category: string) => {
    //     const color = colorMapping[variable]?.[category];

    //     switch (color) {
    //         case "green":
    //         case "#91cc75":
    //         case "lightgreen":
    //             return "table-success";
    //         case "red":
    //             return "table-danger";
    //         case "yellow":
    //         case "orange":
    //         case "#fac858":
    //             return "table-warning";
    //         case "blue":
    //         case "lightblue":
    //         case "#5470c6":
    //             return "table-info";
    //         case "gray":
    //         case "lightgray":
    //             return "table-secondary";
    //         default:
    //             return "";
    //     }
    // };



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
    const populationGroupsScatterData = [
        { X: 0.806140985, Y: 0.663293783, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
        { X: 0.601444065, Y: 1.147868221, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
        { X: 0.504394982, Y: 1.367235465, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
        { X: 0.310943742, Y: 1.275045535, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
        { X: 0.504394982, Y: 1.367235465, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
        { X: 0.740383451, Y: 1.302743695, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
        { X: 0.633460778, Y: 0.71635909, cluster: 2, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Not active at all/Sedentary, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
        { X: 0.36853148, Y: 1.364731766, cluster: 2, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Not active at all/Sedentary, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
        { X: 0.261533619, Y: 1.034579777, cluster: 2, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Not active at all/Sedentary, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
        { X: 0.768539364, Y: 0.232646995, cluster: 3, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: University education (Bachelor’s degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
        { X: 0.42612985, Y: 0.777297508, cluster: 3, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: University education (Bachelor’s degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
        { X: 0.758819255, Y: 0.543060221, cluster: 3, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: University education (Bachelor’s degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
        { X: 1.836561987, Y: -0.855670276, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
        { X: 1.826439, Y: -0.596198075, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
        { X: 1.807412296, Y: -0.934443639, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
        { X: 1.400750568, Y: -0.593957907, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
        { X: 1.744328232, Y: -0.641550062, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
        { X: 1.429900259, Y: -0.515184543, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
        { X: -1.032482269, Y: -0.413268741, cluster: 5, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I am currently a regular smoker, Activity level: Somewhat active, Education: University education (Bachelor’s degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Missing','Professional']", score: 2 },
        { X: -0.231431663, Y: -1.846214624, cluster: 5, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I am currently a regular smoker, Activity level: Somewhat active, Education: University education (Bachelor’s degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Missing','Professional']", score: 2 },
        { X: -0.21157701, Y: -0.477852742, cluster: 6, variables: "Age_group: Not answered, BMI_group: Normal, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Active, Education: Elementary education (Basic reading and writing), Employment: Part-time / Seasonal employment, Region: Suburban, Occupation: Skilled agricultural, forestry and fishery worker", score: 2 },
        { X: 1.129342273, Y: -1.324870669, cluster: 7, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Suburban, Occupation: Missing", score: 2 },
        { X: 0.1437820547, Y: -0.43863981, cluster: 7, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Suburban, Occupation: Missing", score: 2 },
        { X: -0.600396094, Y: 1.156112978, cluster: 8, variables: "Age_group: 40-70, BMI_group: Obese, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Suburban, Occupation: Professional", score: 3 },
        { X: -0.204859086, Y: 0.905417971, cluster: 8, variables: "Age_group: 40-70, BMI_group: Obese, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Suburban, Occupation: Professional", score: 3 },
        { X: -0.857377682, Y: 0.644102379, cluster: 8, variables: "Age_group: 40-70, BMI_group: Obese, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Suburban, Occupation: Professional", score: 3 },
        { X: -1.971381667, Y: 0.377195941, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
        { X: -1.596747939, Y: -0.480512399, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
        { X: -2.146889435, Y: 0.170351389, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
        { X: -1.785797068, Y: -0.113437321, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
        { X: -1.509775688, Y: -0.002401828, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
        { X: -1.419098314, Y: 0.067641457, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
        { X: -1.78019068, Y: 0.351430167, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master’s degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
        { X: 0.132278324, Y: -0.817953453, cluster: 10, variables: "Age_group: <40, BMI_group: Abnormal weight, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Don't know / No answer','Elementary occupation','Service and sales worker']", score: 3 },
        { X: 0.062844003, Y: -0.47281406, cluster: 10, variables: "Age_group: <40, BMI_group: Abnormal weight, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Don't know / No answer','Elementary occupation','Service and sales worker']", score: 3 },
        { X: 0.52546068, Y: -0.268178732, cluster: 10, variables: "Age_group: <40, BMI_group: Abnormal weight, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Don't know / No answer','Elementary occupation','Service and sales worker']", score: 3 },
        { X: 0.294452287, Y: -1.541422178, cluster: 11, variables: "Age_group: 70+, BMI_group: Obese, Biological Sex: Female, Smoking status: I am currently a regular smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Retired, Region: Urban, Occupation: Don't know / No answer", score: 4 },
        { X: -1.390369091, Y: -1.072594112, cluster: 12, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Postgraduate education (Master’s degree, PhD), Employment: Retired, Region: Suburban, Occupation: ['Don't know / No answer','Manager','Professional']", score: 4 },
        { X: -1.95478712, Y: -0.875884183, cluster: 12, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Postgraduate education (Master’s degree, PhD), Employment: Retired, Region: Suburban, Occupation: ['Don't know / No answer','Manager','Professional']", score: 4 },
        { X: -1.619146205, Y: -1.181300452, cluster: 12, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Postgraduate education (Master’s degree, PhD), Employment: Retired, Region: Suburban, Occupation: ['Don't know / No answer','Manager','Professional']", score: 4 },
    ];
    const populationGroupsScatterDataWithId = populationGroupsScatterData.map((d, idx) => ({
        ...d,
        id: idx, // unique ID for React keys
    }));
    const riskScoreColor = {
        2: "#28a745", // green
        3: "#ffc107", // yellow
        4: "#dc3545", // red
    };
    const clusterColors = [
        "#1f77b4", "#aec7e8", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#9edae5"
    ];
    // const parseNumeric = (val) => {
    //     if (typeof val === "number") return val;
    //     if (!val) return 0;
    //     // Remove all dots used as thousands separators
    //     return Number(val.toString().replace(/\./g, ""));
    // };
    const scatterOptions = useMemo(() => {
        // Group by cluster
        const grouped = {};
        populationGroupsScatterDataWithId.forEach(d => {
            if (!grouped[d.cluster]) grouped[d.cluster] = [];
            grouped[d.cluster].push({
                value: [d.X, d.Y],  // required for scatter
                variables: d.variables,
                score: d.score,
                id: d.id
            });
        });

        const series = Object.entries(grouped).map(([cluster, data]) => ({
            name: `Cluster ${cluster}`,
            type: "scatter",
            data, // array of objects
            symbolSize: 12,
            itemStyle: { color: clusterColors[cluster - 1] || "#ccc" },
        }));

        return {
            tooltip: {
                trigger: 'item',
                extraCssText: 'max-width: 700px; white-space: normal;',
                formatter: (params) => {
                    const { value, variables, score } = params.data;
                    const [x, y] = value;
                    const shortVariables = variables?.replace(/, /g, "<br/>");
                    return `
                    <strong>${params.seriesName}</strong><br/>
                    X: ${x.toFixed(2)}<br/>
                    Y: ${y.toFixed(2)}<br/>
                    <strong>CRC Risk Score:</strong> ${score}<br/>
                    <strong>Variables:</strong><br/>${shortVariables}
                `;
                }
            },
            xAxis: { name: "PCA 1", type: "value", nameLocation: "middle", nameGap: 50 },
            yAxis: { name: "PCA 2", type: "value", nameLocation: "middle", nameRotate: 90, nameGap: 50 },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center',
                data: series.map(s => s.name),
                textStyle: { fontSize: 12 },
                itemWidth: 12,
                itemHeight: 12,
                padding: 5,
            },
            series,
        };
    }, [populationGroupsScatterDataWithId]);

    const downloadCSV = () => {
        const headers = ["Cluster", "Variables", "CRC Risk Score"];

        const rows = populationGroupsScatterDataWithId.map(row => [
            row.cluster,
            row.variables,
            row.score
        ]);

        const csvContent =
            "\uFEFF" + // Excel UTF-8 fix
            [
                headers.join(";"),
                ...rows.map(r =>
                    r.map(value =>
                        `"${String(value).replace(/"/g, '""')}"`
                    ).join(";")
                )
            ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "crc_population_groups.csv";
        link.click();
        URL.revokeObjectURL(url);
    };




    return (
        <div className="container-fluid mt-3">
            {!isPopulationGroups && (
                <h3>Aggregation Analysis - {country}</h3>
            )}
            <div className="row">
                {/* ================= LEFT COLUMN ================= */}
                {!isPopulationGroups && (
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
                                <small
                                    className="form-control mt-1"
                                    dangerouslySetInnerHTML={{
                                        __html: variableDescription[selectedVariable] ?? "",
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ================= MAIN COLUMN ================= */}
                {isPopulationGroups && (
                    <div className={isPopulationGroups ? "col-2 mt-5" : "col-2 mt-5"}>
                        {isPopulationGroups && (
                            <>
                                <Card>
                                    <div><strong>CRC incidence population groups</strong> represent distinct and interpretable subgroups based on shared demographic, lifestyle, and health-related characteristics. These groups support tailored policy decisions and targeted interventions within  <strong> LiP-02</strong>. Their analysis is based on data collected in <strong>Greece</strong> through the <strong>NELI mobile application</strong> during Living Lab Integration Test 02 (<strong>LIT-02</strong>).<br></br><br></br>
                                        Clustering analysis was performed using an optimized set of 10 variables: age group, BMI group, biological sex, smoking status, activity level, education, employment, region, occupation, and CRC Risk Score.<br></br><br></br>
                                        Hierarchical clustering with Gower distance identified <strong>12 population groups</strong> in accordance with project KPIs, distributed as follows:<br></br>
                                        <br></br> •	7 groups with CRC risk score 2
                                        <br></br>  •	3 groups with CRC risk score 3
                                        <br></br>  •	2 groups with CRC risk score 4
                                    </div>
                                </Card>

                            </>
                        )}
                    </div>
                )}
                <div className={isPopulationGroups ? "col-8 mt-5" : "col-8 mt-5"}>
                    {isPopulationGroups && (
                        <>
                            <h3 className="mb-3">CRC Incidence Population Groups</h3>
                            <Button className="mb-3" onClick={() => setShowGraph(prev => !prev)}>
                                {showGraph ? "Show Table" : "Show Graph"}
                            </Button>
                            <span className="m-2"></span>
                            {!showGraph && (
                            
                                <Button className="my-auto mb-3"
                                    variant="success"
                                    onClick={downloadCSV}
                                >
                                    Download CSV
                                </Button>
                            )}
                        </>

                    )}
                    {/* 👉 POPULATION GROUPS TABLE */}
                    {!showGraph && isPopulationGroups && (
                            
                        <div className="table-responsive">

                            <table className="table table-bordered table-striped align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Color</th>
                                        <th>Cluster</th>
                                        <th>Variables</th>
                                        <th>CRC Risk Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {populationGroupsScatterDataWithId.map(row => (
                                        <tr key={row.id}>
                                            <td className="text-center">
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        width: "14px",
                                                        height: "14px",
                                                        borderRadius: "50%",
                                                        backgroundColor: riskScoreColor[row.score] || "#ccc",
                                                    }}
                                                    title={`Risk Score ${row.score}`}
                                                />
                                            </td>
                                            <td>{row.cluster}</td>
                                            <td style={{ whiteSpace: "pre-wrap" }}>{row.variables}</td>
                                            <td>{row.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showGraph && isPopulationGroups && (
                        <><h3>PCA Scatterplot of Clustered CRC Incidence Population Groups</h3>

                            <ReactECharts option={scatterOptions} style={{ height: 500 }} />
                        </>
                    )}


                    {/* {isPopulationGroups && !showGraph && (

                        <div className="table-responsive">

                            <table className="table table-bordered table-striped align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Color</th>
                                        <th>Cluster</th>
                                        <th>Variables</th>
                                        <th>CRC Risk Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {populationGroupsData.map((row) => (
                                        <tr key={row.cluster}>
                                            <td className="text-center">
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        width: "14px",
                                                        height: "14px",
                                                        borderRadius: "50%",
                                                        backgroundColor: riskScoreColor[row.score] || "#ccc",
                                                    }}
                                                    title={`Risk Score ${row.score}`}
                                                />
                                            </td>
                                            <td>{row.cluster}</td>
                                            <td style={{ whiteSpace: "pre-wrap" }}>{row.variables}</td>
                                            <td>{row.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )} */}


                    {/* 👉 DEFAULT TEXT */}
                    {!isPopulationGroups && !selectedVariable && country === "Greece" && (
                        <p>
                            Through this tab, users can explore insights from <strong>LIT2</strong> (Greece).
                            <br /><br />
                            The <strong>Aggregation Analysis</strong> summarizes data from the NELI mobile app (T4.2),
                            providing population-level insights across <strong>Greece</strong>.
                            <br /><br />
                            Please select a variable from the dropdown menu on the left.
                        </p>
                    )}

                    {!isPopulationGroups && !selectedVariable && country === "Romania" && (
                        <p>
                            Through this tab, users can explore insights from <strong>LIP1</strong> (Romania).
                            <br /><br />
                            The <strong>Aggregation Analysis</strong> summarizes data from the NELI mobile app (T4.2),
                            providing population-level insights across <strong>Romania</strong>.
                            <br /><br />
                            Please select a variable from the dropdown menu on the left.
                        </p>
                    )}

                    {/* 👉 LOADING */}
                    {loading && (
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary" />
                            <div className="fw-bold mt-2">Loading...</div>
                        </div>
                    )}

                    {/* 👉 CHARTS */}
                    {!isPopulationGroups && selectedVariable && !loading && filteredData.length > 0 && (

                        <>
                            <h3>{selectedVariable}</h3>
                            {chartType === "pie-detailed" && (
                                <ReactECharts
                                    key={`${selectedVariable}-pie-detailed`}
                                    option={getPieOptions(true)}
                                    style={{ height: 400 }}
                                />
                            )}

                            {chartType === "pie-simple" && (
                                <ReactECharts
                                    key={`${selectedVariable}-pie-simple`}
                                    option={getPieOptions(false)}
                                    style={{ height: 400 }}
                                />
                            )}

                            {chartType === "bar" && (
                                <ReactECharts
                                    key={`${selectedVariable}-bar`}
                                    option={getBarOptions()}
                                    style={{ height: 400 }}
                                />

                            )}<Button className="mt-3" onClick={() => setShowModal(true)}>View Table</Button>

                            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                                <Modal.Header closeButton> <Modal.Title>{selectedVariable}</Modal.Title>
                                    <Button variant="success" className="ms-auto" onClick={handleDownloadCSV}>Download CSV</Button>
                                </Modal.Header>
                                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-200 rounded-lg shadow-md">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Color</th>
                                                    {["Variable", "Category", "Frequency", "% of Total", "Mean", "Median", "Std. Dev.", "Min", "Max"].map((header, i) => (
                                                        <th key={i} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentData.map((row, idx) => {
                                                    const color = colorMapping[row.Variable]?.[row.Category] || "#ccc";

                                                    // Mutate Category for "50-60" to "40-70"
                                                    const displayCategory = row.Category === "50-60" ? "40-70" : row.Category;

                                                    return (
                                                        <tr key={idx} style={{ height: "50px" }}>
                                                            <td className="px-4 py-2 text-center">
                                                                <div
                                                                    style={{
                                                                        width: "16px",
                                                                        height: "16px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: color,
                                                                        display: "inline-block",
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">{row.Variable}</td>
                                                            <td className="px-4 py-2">{displayCategory}</td> {/* Display the mutated category */}
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

                                <Modal.Footer> <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button> <span className="mx-2">Page {currentPage} of {totalPages}</span>
                                    <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
                </div>

                {/* ================= RIGHT COLUMN ================= */}
                <div className={isPopulationGroups ? "col-2" : "col-2 mt-5"} style={{ margin: "130px 0px 0px 0px" }} >
                    <Accordion defaultActiveKey="-1">
                        {(!isPopulationGroups ? accordionContentAggregation_dictLst : accordionContentPopulation_dictLst).map((item, idx) => (
                            <Accordion.Item eventKey={idx.toString()} key={idx}>
                                <Accordion.Header>{item.title}</Accordion.Header>
                                <Accordion.Body className="text-start" style={{ height: "340px", overflow: "scroll" }}>
                                    {item.content}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>

                    <Comments />
                </div>
            </div>
        </div>
    );
}
export default AggregationAnalysis;
