import { useState, useMemo, useEffect } from "react";
import Unauthorized from './Unauthorized';
import axios from "axios";
import ReactECharts from "echarts-for-react";
import { Accordion, Modal } from 'react-bootstrap';
import { useSearchParams } from "react-router-dom";
import Comments from "./Comments.tsx";
import { useLocation } from "react-router-dom";
import * as AuthService from "../services/auth.service.tsx";

// ─── Accordion content ────────────────────────────────────────────────────────

const accordionContentAggregation_dictLst = [
    {
        title: 'Data Sources',
        content: (
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                <ul className="ps-3" style={{ margin: 0 }}>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Source:</strong> ONCODIR's project prospective data, collected through the NELI mobile application (T4.2) during the Living Lab Integration Test (LIT-02). LIT-02 was designed as a technology acceptance study conducted with external citizens to evaluate both the technical functionality of NELI and its capacity for reliable data collection.
                    </li>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Data collection:</strong> Preparations for citizen enrollment began in September 2024, and the main study period ran from October to December 2024. By late November 2024, 46 participants were enrolled (40 in Greece, 3 in Lithuania, 1 in Luxembourg, 2 in Romania). Only Greek participants were used in this analysis.
                    </li>
                    <li>
                        <strong>Variables:</strong> The dataset includes both <strong>static variables</strong> (demographics, lifestyle, socioeconomic status, clinical history) and <strong>non-static variables</strong> (nutritional habits, CRC risk assessment scores via PYRAMID), collected bi-weekly.
                    </li>
                </ul>
            </div>
        ),
    },
    {
        title: 'Methodology',
        content: (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <p style={{ margin: 0 }}>
                    <strong>Daily Nutritional Intake transformation</strong><br />
                    Nutritional habits were standardized as grams per day. Categorical frequencies were converted to daily servings and portion sizes standardized across food types.<br /><br />
                    <strong>Categorization of Daily Nutritional Intake</strong><br />
                    Intake was categorized into Low / Standard / High using thresholds from WHO, FAO, HHS/USDA, EAT–Lancet, NHS, and Mediterranean dietary models.<br /><br />
                    <strong>Monthly aggregation</strong><br />
                    Non-static variables collected bi-weekly were aggregated into monthly measurements using the median value per participant per month.<br /><br />
                    <strong>Aggregation</strong><br />
                    Static and non-static variables were aggregated to reflect overall distribution. For numerical variables: mean, median, std, min, max. For categorical: frequency and percentage.
                </p>
            </div>
        ),
    },
    {
        title: 'References',
        content: (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <ol className="ps-3" style={{ margin: 0, fontSize: 13 }}>
                    <li style={{ marginBottom: 8 }}>FAO & WHO. (2019). Sustainable healthy diets – Guiding principles.</li>
                    <li style={{ marginBottom: 8 }}>FAO. (2016). Plates, pyramids and planets.</li>
                    <li style={{ marginBottom: 8 }}>HHS & USDA. (2025). Scientific report of the 2025 Dietary Guidelines Advisory Committee.</li>
                    <li style={{ marginBottom: 8 }}>Willett W et al. (2019). Food in the Anthropocene. The Lancet, 393(10170), 447–492.</li>
                    <li style={{ marginBottom: 8 }}>NHS. (2018). The Eatwell Guide.</li>
                    <li>Trichopoulou A et al. (2014). Definitions and potential health benefits of the Mediterranean diet. BMC Med 12, 112.</li>
                </ol>
            </div>
        ),
    },
];

const accordionContentPopulation_dictLst = [
    {
        title: 'Data Sources',
        content: (
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                <ul className="ps-3" style={{ margin: 0 }}>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Source:</strong> ONCODIR's prospective data via NELI app (T4.2), LIT-02 study.
                    </li>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Data collection:</strong> October–December 2024. 46 participants enrolled (40 in Greece). Only Greek participants used.
                    </li>
                    <li>
                        <strong>Variables:</strong> Static (demographics, lifestyle, socioeconomic, clinical) and non-static (nutritional habits, PYRAMID CRC risk scores), collected bi-weekly.
                    </li>
                </ul>
            </div>
        ),
    },
    {
        title: 'Methodology',
        content: (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <p style={{ margin: 0 }}>
                    <strong>Categorization of numerical variables</strong><br />
                    Age: &lt;40, 40–70, 70+. BMI: Underweight (&lt;18.5), Normal (18.5–24.9), Overweight (25–29.9), Obese (≥30).<br /><br />
                    <strong>Non-static variable transformation</strong><br />
                    Dietary intake standardized to grams/day. Non-static variables summarized as participant means (numerical) or medians (categorical). Participants with &lt;40% missing data excluded.<br /><br />
                    <strong>Clustering</strong><br />
                    Hierarchical clustering with Gower distance, k=12. Centroids calculated using means for numerical and most frequent category for categorical variables. Based on a 10-feature optimized set restricted to Greek citizens (n=40).
                </p>
            </div>
        ),
    },
];

// ─── Variable data ────────────────────────────────────────────────────────────

const pieChartVarsDetailed = ["Age", "BMI"];
const pieChartVarsSimple = [
    "Biological Sex", "Smoking status", "Activity level", "CRC Family history",
    "Diabetes", "Education", "Employment", "Ethnicity", "Housing", "IBD",
    "Metabolic syndrome", "Occupation", "Region", "Relationship status",
];
const barChartVarsTime = [
    "Alcohol grams/day", "Cheese grams/day", "Cooked vegetables grams/day",
    "Diary-plant based products mL/day", "Fruits grams/day", "Large fatty fish grams/day",
    "Legumes grams/day", "Nuts seeds grams/day", "Processed meat grams/day",
    "Raw vegetables grams/day", "Red meat grams/day", "Small fatty fish grams/day",
    "Wholegrains grams/day", "CRC Risk Assessment Score (PYRAMID)",
];

const colorMapping: Record<string, Record<string | number, string>> = {
    "Activity level": { "Very active": "green", Active: "blue", "Somewhat active": "yellow", "Not active at all/Sedentary": "red" },
    Age: { "<40": "green", "50-60": "yellow", "70+": "red", Missing: "gray" },
    BMI: { Normal: "green", Underweight: "yellow", Overweight: "blue", Obese: "red", Missing: "gray" },
    "Biological Sex": { Male: "blue", Female: "yellow", Missing: "gray" },
    "CRC Family history": { No: "green", Yes: "red" },
    Region: { Urban: "#fac858", Rural: "#5470c6", Suburban: "#91cc75" },
    Diabetes: { No: "green" },
    Education: { "Elementary education (Basic reading and writing)": "yellow", "Secondary education or vocational training": "orange", "University education (Bachelor's degree)": "blue", "Postgraduate education (Master's degree, PhD)": "lightblue" },
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

const pieCategoryOrder: Record<string, string[] | null> = {
    "Activity level": ["Very active", "Active", "Somewhat active", "Not active at all/Sedentary"],
    Age: ["<40", "50-60", "70+", "Missing"],
    BMI: ["Normal", "Underweight", "Overweight", "Obese", "Missing"],
    "Biological Sex": ["Male", "Female", "Missing"],
    "CRC Family history": ["No", "Yes"],
    Diabetes: ["No"],
    Education: ["Elementary education (Basic reading and writing)", "Secondary education or vocational training", "University education (Bachelor's degree)", "Postgraduate education (Master's degree, PhD)"],
    Employment: ["Still studying", "Part-time / Seasonal employment", "Full-time / Self-employed", "Retired"],
    Ethnicity: ["Caucasian", "Other"],
    Housing: ["Apartment", "Duplex", "Single-family house", "Studio Apartment", "Townhouse"],
    IBD: ["No", "Yes"],
    "Metabolic syndrome": ["No", "Yes"],
    Occupation: ["Elementary occupation", "Manager", "Professional", "Service and sales worker", "Skilled agricultural, forestry and fishery worker", "Technician and associate professional", "Don't know / No answer", "Missing"],
    Region: null,
    "Relationship status": ["Living with a partner", "Living without a partner"],
    "Smoking status": ["I have never smoked", "I am a former smoker", "I am currently a regular smoker"],
};

const variableDescription: Record<string, string> = {
    "Activity level": "Participant's self-reported activity level from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Very active, Active, Somewhat active, Somewhat active, Not active at all/Sedentary.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Age": "Age is calculated from the participant's year of birth reported in the Health and Lifestyle questionnaire (NELI app) and the year the data was recorded.<br /><br />" +
        "The resulting age is then categorized as: <40, 40-70, 70+.<br /><br />" +
        "(Static variable – does not change over time.)",
    "BMI": "Body Mass Index (BMI) is calculated from the participant's weight (kg) and height (cm) reported in the Health and Lifestyle questionnaire (NELI app), using the formula: BMI = weight / (height/100)^2.<br /><br />" +
        "The results are then categorized as follows: Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), Obese (≥30).<br /><br />" +
        "(Static variable – does not change over time.)",
    "Biological Sex": "Participant's biological sex from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Male, Female.<br /><br />" +
        "(Static variable – does not change over time.)",
    "CRC Family history": "Participant's self-reported CRC family history from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Yes, No.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Diabetes": "Participant's self-reported diabetes from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Yes, No.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Education": "Participant's self-reported education from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Elementary education (Basic reading and writing), Secondary education or vocational training, University education (Bachelor's degree), Postgraduate education (Master's degree, PhD).<br /><br />" +
        "(Static variable – does not change over time.)",
    "Employment": "Participant's self-reported employment status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
        "Options: Still studying, Part-time/Seasonal employment, Full-time/Self-employed, Retired.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Ethnicity": "Participant's self-reported ethnicity from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Caucasian, Asian, African, Hispanic/Latino, Jewish, Romani, Other.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Housing": "Participant's self-reported housing status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
        "Options: Apartment, Duplex, Single-family house, Studio Apartment, Townhouse.<br /><br />" +
        "(Static variable – does not change over time.)",
    "IBD": "Participant's self-reported Inflammatory Bowel Disease (IBD) from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Yes, No.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Metabolic syndrome": "Participant's self-reported metabolic syndrome from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
        "Options: Yes, No.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Occupation": "Participant's self-reported occupational status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
        "Options: Elementary occupation, Manager, Professional, Service and sales worker, Skilled agricultural, forestry and fishery worker, Technician and associate professional, Don't know / No answer.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Region": "Participant's self-reported region status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
        "Options: Rural, Suburban, Urban.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Relationship status": "Participant's self-reported relationship status from the Socioeconomic factors questionnaire (NELI app).<br /><br />" +
        "Options: Living with a partner, Living without a partner.<br /><br />" +
        "(Static variable – does not change over time.)",
    "Smoking status": "Participant's self-reported smoking status from the Health and Lifestyle questionnaire (NELI app).<br /><br />" +
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
        "Legume quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
        "The resulting intake (grams/day) was then categorized as follows: Low (<64 g/day) and Standard (>= 64 g/day).<br /><br />" +
        "(Non-Static variable – measured biweekly.)",
    "Nuts seeds grams/day": "Nuts consumption is defined based on the self-reported nuts consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
        "Nuts quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
        "The resulting intake (grams/day) was then categorized as follows: Standard (<=30 g/day) and High (>30 g/day).<br /><br />" +
        "(Non-Static variable – measured biweekly.)",
    "Processed meat grams/day": "Processed meat consumption is defined based on the self-reported processed meat consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
        "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
        "The resulting intake (grams/day) was then categorized as follows: Standard (<=7 g/day) and High (>7 g/day).<br /><br />" +
        "(Non-Static variable – measured biweekly.)",
    "Raw vegetables grams/day": "Raw vegetables consumption is defined based on the self-reported raw vegetables consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
        "Raw vegetables quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
        "The resulting intake (grams/day) was then categorized as follows: Low (<150 g/day) and Standard (>=150 g/day).<br /><br />" +
        "(Non-Static variable – measured biweekly.)",
    "Red meat grams/day": "Red meat consumption is defined based on the self-reported red meat consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
        "Red meat quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
        "The resulting intake (grams/day) was then categorized as follows: Standard (<=21 g/day) and High (>21 g/day).<br /><br />" +
        "(Non-Static variable – measured biweekly.)",
    "Small fatty fish grams/day": "Small fatty fish consumption is defined based on the self-reported small fatty fish consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
        "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
        "The resulting intake (grams/day) was then categorized as follows: Low (<43 g/day) and Standard (>=43 g/day).<br /><br />" +
        "(Non-Static variable – measured biweekly.)",
    "Wholegrains grams/day": "Wholegrain consumption is defined based on the self-reported wholegrain or potato consumption frequency and portion size provided in the Food Consumption questionnaire (NELI app).<br /><br />" +
        "Quantity/day (in grams) was calculated using the reported frequency and portion size, following the methodology described in the dictionary.<br /><br />" +
        "The resulting intake (grams/day) was then categorized as follows: Low (<350 g/day) and Standard (>=350 g/day).<br />" +
        "(Non-Static variable – measured biweekly.)",
};

// ─── Population groups scatter data ──────────────────────────────────────────

const populationGroupsScatterData = [
    { X: 0.806140985, Y: 0.663293783, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
    { X: 0.601444065, Y: 1.147868221, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
    { X: 0.504394982, Y: 1.367235465, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
    { X: 0.310943742, Y: 1.275045535, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
    { X: 0.504394982, Y: 1.367235465, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
    { X: 0.740383451, Y: 1.302743695, cluster: 1, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Female, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Technician and associate professional", score: 2 },
    { X: 0.633460778, Y: 0.71635909, cluster: 2, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Not active at all/Sedentary, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
    { X: 0.36853148, Y: 1.364731766, cluster: 2, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Not active at all/Sedentary, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
    { X: 0.261533619, Y: 1.034579777, cluster: 2, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Not active at all/Sedentary, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
    { X: 0.768539364, Y: 0.232646995, cluster: 3, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: University education (Bachelor's degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
    { X: 0.42612985, Y: 0.777297508, cluster: 3, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: University education (Bachelor's degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
    { X: 0.758819255, Y: 0.543060221, cluster: 3, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: University education (Bachelor's degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 2 },
    { X: 1.836561987, Y: -0.855670276, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
    { X: 1.826439, Y: -0.596198075, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
    { X: 1.807412296, Y: -0.934443639, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
    { X: 1.400750568, Y: -0.593957907, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
    { X: 1.744328232, Y: -0.641550062, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
    { X: 1.429900259, Y: -0.515184543, cluster: 4, variables: "Age_group: <40, BMI_group: Normal, Biological Sex: Both, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: Missing", score: 2 },
    { X: -1.032482269, Y: -0.413268741, cluster: 5, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I am currently a regular smoker, Activity level: Somewhat active, Education: University education (Bachelor's degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Missing','Professional']", score: 2 },
    { X: -0.231431663, Y: -1.846214624, cluster: 5, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I am currently a regular smoker, Activity level: Somewhat active, Education: University education (Bachelor's degree), Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Missing','Professional']", score: 2 },
    { X: -0.21157701, Y: -0.477852742, cluster: 6, variables: "Age_group: Not answered, BMI_group: Normal, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Active, Education: Elementary education (Basic reading and writing), Employment: Part-time / Seasonal employment, Region: Suburban, Occupation: Skilled agricultural, forestry and fishery worker", score: 2 },
    { X: 1.129342273, Y: -1.324870669, cluster: 7, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Suburban, Occupation: Missing", score: 2 },
    { X: 0.1437820547, Y: -0.43863981, cluster: 7, variables: "Age_group: <40, BMI_group: Overweight, Biological Sex: Male, Smoking status: I am a former smoker, Activity level: Active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Suburban, Occupation: Missing", score: 2 },
    { X: -0.600396094, Y: 1.156112978, cluster: 8, variables: "Age_group: 40-70, BMI_group: Obese, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Suburban, Occupation: Professional", score: 3 },
    { X: -0.204859086, Y: 0.905417971, cluster: 8, variables: "Age_group: 40-70, BMI_group: Obese, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Suburban, Occupation: Professional", score: 3 },
    { X: -0.857377682, Y: 0.644102379, cluster: 8, variables: "Age_group: 40-70, BMI_group: Obese, Biological Sex: Male, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Suburban, Occupation: Professional", score: 3 },
    { X: -1.971381667, Y: 0.377195941, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
    { X: -1.596747939, Y: -0.480512399, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
    { X: -2.146889435, Y: 0.170351389, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
    { X: -1.785797068, Y: -0.113437321, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
    { X: -1.509775688, Y: -0.002401828, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
    { X: -1.419098314, Y: 0.067641457, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
    { X: -1.78019068, Y: 0.351430167, cluster: 9, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Active, Education: Postgraduate education (Master's degree, PhD), Employment: Full-time / Self-employed, Region: Urban, Occupation: Professional", score: 3 },
    { X: 0.132278324, Y: -0.817953453, cluster: 10, variables: "Age_group: <40, BMI_group: Abnormal weight, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Don't know / No answer','Elementary occupation','Service and sales worker']", score: 3 },
    { X: 0.062844003, Y: -0.47281406, cluster: 10, variables: "Age_group: <40, BMI_group: Abnormal weight, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Don't know / No answer','Elementary occupation','Service and sales worker']", score: 3 },
    { X: 0.52546068, Y: -0.268178732, cluster: 10, variables: "Age_group: <40, BMI_group: Abnormal weight, Biological Sex: Female, Smoking status: I am a former smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Full-time / Self-employed, Region: Urban, Occupation: ['Don't know / No answer','Elementary occupation','Service and sales worker']", score: 3 },
    { X: 0.294452287, Y: -1.541422178, cluster: 11, variables: "Age_group: 70+, BMI_group: Obese, Biological Sex: Female, Smoking status: I am currently a regular smoker, Activity level: Somewhat active, Education: Secondary education or vocational training, Employment: Retired, Region: Urban, Occupation: Don't know / No answer", score: 4 },
    { X: -1.390369091, Y: -1.072594112, cluster: 12, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Postgraduate education (Master's degree, PhD), Employment: Retired, Region: Suburban, Occupation: ['Don't know / No answer','Manager','Professional']", score: 4 },
    { X: -1.95478712, Y: -0.875884183, cluster: 12, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Postgraduate education (Master's degree, PhD), Employment: Retired, Region: Suburban, Occupation: ['Don't know / No answer','Manager','Professional']", score: 4 },
    { X: -1.619146205, Y: -1.181300452, cluster: 12, variables: "Age_group: Not answered, BMI_group: Not answered, Biological Sex: Not answered, Smoking status: I have never smoked, Activity level: Somewhat active, Education: Postgraduate education (Master's degree, PhD), Employment: Retired, Region: Suburban, Occupation: ['Don't know / No answer','Manager','Professional']", score: 4 },
];

const riskScoreColor: Record<number, string> = { 2: "#16a34a", 3: "#d97706", 4: "#dc2626" };
const clusterColors = ["#1f77b4","#aec7e8","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf","#9edae5"];

// ─── Main component ───────────────────────────────────────────────────────────

const AggregationAnalysis = () => {
    const [selectedVariable, setSelectedVariable] = useState("");
    const [selectedPeriodType, setSelectedPeriodType] = useState("");
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const rowsPerPage = 10;
    const location = useLocation();
    const isPopulationGroups = location.pathname.includes("lip2-population-groups");
    const [showGraph, setShowGraph] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => AuthService.isLoggedIn());

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    const variables = useMemo(() => [...new Set(data.map((d) => d.Variable))], [data]);
    const periodTypes = ["Week", "Month"];

    const [searchParams] = useSearchParams();
    const country = searchParams.get("country");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://oncodir-datapi.catalink.eu/v1/data-fusion/extra/aggregation?country=${encodeURIComponent(country ?? "")}`
                );
                if (Array.isArray(response.data.results)) {
                    setData(response.data.results);
                } else {
                    setData([]);
                }
            } catch {
                setError("Error fetching data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [country]);

    useEffect(() => {
        setSelectedVariable("");
        setSelectedPeriodType("");
        setSelectedTimePeriod("");
        setCurrentPage(1);
    }, [country]);

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
            .filter((v: any, i: number, a: any[]) => v != null && a.indexOf(v) === i);
        return periods.sort((a: string, b: string) => a.localeCompare(b));
    }, [selectedVariable, selectedPeriodType, data]);

    useEffect(() => {
        if (barChartVarsTime.includes(selectedVariable)) {
            if (selectedPeriodType !== "" && !periodTypes.includes(selectedPeriodType)) setSelectedPeriodType("");
            if (selectedTimePeriod && !timePeriods.includes(selectedTimePeriod)) setSelectedTimePeriod("");
        } else {
            setSelectedPeriodType("");
            setSelectedTimePeriod("");
        }
    }, [selectedVariable, timePeriods, selectedPeriodType, selectedTimePeriod]);

    useEffect(() => {
        if (barChartVarsTime.includes(selectedVariable)) {
            if (selectedTimePeriod && !timePeriods.includes(selectedTimePeriod)) setSelectedTimePeriod("");
        } else {
            setSelectedPeriodType("");
            setSelectedTimePeriod("");
        }
    }, [selectedVariable, timePeriods]);

    useEffect(() => { setSelectedTimePeriod(""); }, [selectedPeriodType]);

    const chartType = useMemo(() => {
        if (pieChartVarsDetailed.includes(selectedVariable)) return "pie-detailed";
        if (pieChartVarsSimple.includes(selectedVariable)) return "pie-simple";
        if (barChartVarsTime.includes(selectedVariable)) return "bar";
        return null;
    }, [selectedVariable]);

    const formatTimePeriod = (tp: string) => {
        if (!tp) return "";
        if (tp.includes("/")) {
            const [start, end] = tp.split("/");
            const [sy, sm, sd] = start.split("-");
            const [ey, em, ed] = end.split("-");
            return `${sd}-${sm}-${sy} – ${ed}-${em}-${ey}`;
        }
        if (tp.includes("-")) {
            const [year, month] = tp.split("-");
            return `${month}-${year}`;
        }
        return tp;
    };

    const filteredData = useMemo(() => {
        return data.filter((d) => {
            const matchesVariable = selectedVariable ? d.Variable === selectedVariable : true;
            let matchesPeriodType = true;
            if (barChartVarsTime.includes(selectedVariable) && selectedPeriodType) {
                matchesPeriodType = selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : d["Time-Period"] && !d["Time-Period"].includes("/");
            }
            let matchesTimePeriod = true;
            if (barChartVarsTime.includes(selectedVariable) && selectedTimePeriod) {
                matchesTimePeriod = d["Time-Period"] === selectedTimePeriod;
            }
            return matchesVariable && matchesPeriodType && matchesTimePeriod;
        });
    }, [data, selectedVariable, selectedPeriodType, selectedTimePeriod, country]);

    useEffect(() => { setCurrentPage(1); }, [filteredData]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleDownloadCSV = () => {
        const header = ["Variable","Category","Frequency","% of Total","Mean","Median","Std. Dev.","Min","Max"];
        const rows = filteredData.map((row) => {
            const displayCategory = row.Category === "50-60" ? "40-70" : row.Category;
            return [
                row.Variable, displayCategory,
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
        const csvContent = "﻿" + csvArray.join("\n");
        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aggregation_${selectedVariable || "data"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ─── Chart builders ───────────────────────────────────────────────────────

    const getPieOptions = () => {
        const order = pieCategoryOrder[selectedVariable];
        const dataSorted = order
            ? order.map(cat => filteredData.find((d) => d.Category === cat)).filter(Boolean)
            : [...filteredData];

        const seriesData = dataSorted.map((d: any) => ({
            name: selectedVariable === "Age" && d.Category === "50-60" ? "40-70" : d.Category,
            value: d["Percentage of Total"] ?? 0,
            itemStyle: { color: colorMapping[selectedVariable]?.[d.Category] || "#ccc" },
            raw: d,
        }));

        return {
            tooltip: {
                trigger: "item",
                formatter: (params: any) => {
                    const e = params.data?.raw || {};
                    const cat = selectedVariable === "Age" && e.Category === "50-60" ? "40-70" : e.Category;
                    return `<strong>${cat}</strong><br/>
                        <strong>Frequency:</strong> ${e.Frequency ?? "-"}<br/>
                        <strong>% of Total:</strong> ${e["Percentage of Total"]?.toFixed(2) ?? "-"}%<br/>
                        ${typeof e.Mean === "number" ? `<strong>Mean:</strong> ${e.Mean.toFixed(2)}<br/>` : ""}
                        ${typeof e.Median === "number" ? `<strong>Median:</strong> ${e.Median.toFixed(2)}<br/>` : ""}
                        ${typeof e["Std. Dev."] === "number" ? `<strong>Std. Dev.:</strong> ${e["Std. Dev."].toFixed(2)}<br/>` : ""}
                        ${typeof e.Min === "number" ? `<strong>Min:</strong> ${e.Min.toFixed(2)}<br/>` : ""}
                        ${typeof e.Max === "number" ? `<strong>Max:</strong> ${e.Max.toFixed(2)}<br/>` : ""}`;
                },
            },
            legend: { top: 20 },
            series: [{ type: "pie", radius: "60%", data: seriesData }],
        };
    };

    const getBarOptions = () => {
        const allCategories = selectedVariable === "CRC Risk Assessment Score (PYRAMID)"
            ? [2, 3, 4, "Missing"] : ["Low", "Standard", "High", "Missing"];
        const existingCategories = allCategories.filter(cat => filteredData.some((d) => d.Category === cat));
        const tps = [...new Set(filteredData.map((d) => d["Time-Period"]))];
        const dataMap: Record<string, any> = {};
        filteredData.forEach((d) => { dataMap[`${d.Category}||${d["Time-Period"]}`] = d; });

        const series = existingCategories.map(cat => ({
            name: cat,
            type: "bar",
            stack: "total",
            emphasis: { focus: "series" },
            itemStyle: { color: colorMapping[selectedVariable]?.[cat] || "#ccc" },
            data: tps.map(tp => {
                const entry = dataMap[`${cat}||${tp}`];
                return { value: entry?.Frequency ?? 0, raw: entry || { Frequency: 0 } };
            }),
        }));

        return {
            tooltip: {
                trigger: "item",
                formatter: (params: any) => {
                    const e = params.data?.raw || {};
                    return `<strong>${params.seriesName}</strong><br/>
                        <strong>Time Period:</strong> ${params.name}<br/>
                        <strong>Frequency:</strong> ${params.value}
                        ${typeof e.Mean === "number" ? `<br/><strong>Mean:</strong> ${e.Mean.toFixed(2)}` : ""}
                        ${typeof e.Median === "number" ? `<br/><strong>Median:</strong> ${e.Median.toFixed(2)}` : ""}
                        ${typeof e["Std. Dev."] === "number" ? `<br/><strong>Std. Dev.:</strong> ${e["Std. Dev."].toFixed(2)}` : ""}
                        ${typeof e.Min === "number" ? `<br/><strong>Min:</strong> ${e.Min.toFixed(2)}` : ""}
                        ${typeof e.Max === "number" ? `<br/><strong>Max:</strong> ${e.Max.toFixed(2)}` : ""}`;
                },
            },
            legend: { top: 20 },
            xAxis: { type: "category", data: tps.map(tp => formatTimePeriod(tp as string)) },
            yAxis: { type: "value", name: "Frequency" },
            series,
        };
    };

    // ─── Population groups ────────────────────────────────────────────────────

    const populationGroupsScatterDataWithId = populationGroupsScatterData.map((d, idx) => ({ ...d, id: idx }));

    const uniquePopulationGroups = useMemo(() => {
        const seen = new Map();
        populationGroupsScatterData.forEach(item => {
            const key = `${item.cluster}-${item.variables}-${item.score}`;
            if (!seen.has(key)) seen.set(key, item);
        });
        return Array.from(seen.values());
    }, []);

    const scatterOptions = useMemo(() => {
        const grouped: Record<number, any[]> = {};
        populationGroupsScatterDataWithId.forEach(d => {
            if (!grouped[d.cluster]) grouped[d.cluster] = [];
            grouped[d.cluster].push({ value: [d.X, d.Y], variables: d.variables, score: d.score, id: d.id });
        });
        const series = Object.entries(grouped).map(([cluster, pts]) => ({
            name: `Cluster ${cluster}`,
            type: "scatter",
            data: pts,
            symbolSize: 12,
            itemStyle: { color: clusterColors[Number(cluster) - 1] || "#ccc" },
        }));
        return {
            tooltip: {
                trigger: "item",
                extraCssText: "max-width: 700px; white-space: normal;",
                formatter: (params: any) => {
                    const { value, variables, score } = params.data;
                    return `<strong>${params.seriesName}</strong><br/>X: ${value[0].toFixed(2)}<br/>Y: ${value[1].toFixed(2)}<br/><strong>CRC Risk Score:</strong> ${score}<br/><strong>Variables:</strong><br/>${variables?.replace(/, /g, "<br/>")}`;
                },
            },
            xAxis: { name: "PCA 1", type: "value", nameLocation: "middle", nameGap: 50 },
            yAxis: { name: "PCA 2", type: "value", nameLocation: "middle", nameRotate: 90, nameGap: 50 },
            legend: { orient: "vertical", right: 10, top: "center", data: series.map(s => s.name), textStyle: { fontSize: 12 }, itemWidth: 12, itemHeight: 12, padding: 5 },
            series,
        };
    }, [populationGroupsScatterDataWithId]);

    const downloadCSV = () => {
        const headers = ["Cluster","Variables","CRC Risk Score"];
        const rows = uniquePopulationGroups.map(row => [row.cluster, row.variables, row.score]);
        const csvContent = "﻿" + [headers.join(";"), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "crc_population_groups.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!isLoggedIn) return <Unauthorized />;

    const activeAccordionItems = isPopulationGroups ? accordionContentPopulation_dictLst : accordionContentAggregation_dictLst;

    return (
        <>
            <style>{`
                .aa-page { padding: 24px 0 40px; }

                .aa-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .aa-header h1 { font-size: 20px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
                .aa-header p { font-size: 13px; color: var(--text-muted, #475569); margin: 0; }

                .aa-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }
                .aa-sidebar-card .filter-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 8px;
                }
                .aa-desc {
                    font-size: 12.5px;
                    line-height: 1.6;
                    color: var(--text-muted, #475569);
                    margin-top: 8px;
                    padding: 10px 12px;
                    background: var(--muted, #f5f7fb);
                    border-radius: 8px;
                    border: 1px solid var(--border, #e5e7eb);
                }
                .aa-desc em { color: var(--brand-dark, #0b7f82); font-style: normal; font-size: 11.5px; }

                .aa-chart-wrapper {
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: var(--bg, #fff);
                    min-height: 450px;
                    position: relative;
                }
                .aa-chart-loading {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    background: #fff;
                    gap: 12px; z-index: 2;
                }
                .aa-chart-loading span { font-size: 13px; color: var(--text-muted, #475569); font-weight: 500; }

                .aa-intro {
                    padding: 24px;
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                }
                .aa-intro p { font-size: 14px; line-height: 1.65; color: var(--text, #0f172a); margin-bottom: 10px; }
                .aa-intro p:last-child { margin-bottom: 0; }

                .aa-alert-err {
                    background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
                    border-radius: 10px; padding: 14px 16px; font-size: 13.5px;
                    margin: 16px;
                }

                .aa-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
                .aa-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 7px 14px; border-radius: 9px; font-size: 13px;
                    font-weight: 600; cursor: pointer; border: 1.5px solid;
                    transition: background 0.15s, border-color 0.15s;
                }
                .aa-btn-primary { background: var(--brand, #0ea5a8); border-color: var(--brand, #0ea5a8); color: #fff; }
                .aa-btn-primary:hover { background: var(--brand-dark, #0b7f82); border-color: var(--brand-dark, #0b7f82); }
                .aa-btn-secondary { background: #fff; border-color: var(--border, #e5e7eb); color: var(--text, #0f172a); }
                .aa-btn-secondary:hover { background: var(--muted, #f5f7fb); }
                .aa-btn-success { background: #16a34a; border-color: #16a34a; color: #fff; }
                .aa-btn-success:hover { background: #15803d; border-color: #15803d; }

                .aa-info-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    font-size: 13px;
                    line-height: 1.65;
                    color: var(--text, #0f172a);
                }
                .aa-info-card ul { padding-left: 16px; margin: 8px 0 0; }
                .aa-info-card li { margin-bottom: 4px; }

                .aa-table-wrapper { border: 1px solid var(--border, #e5e7eb); border-radius: 14px; overflow: hidden; }
                .aa-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .aa-table thead th {
                    background: var(--muted, #f5f7fb);
                    font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.06em; color: var(--text-muted, #475569);
                    padding: 9px 12px; border-bottom: 1px solid var(--border, #e5e7eb);
                    white-space: nowrap;
                }
                .aa-table tbody td {
                    padding: 9px 12px;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                    color: var(--text, #0f172a); vertical-align: middle;
                }
                .aa-table tbody tr:last-child td { border-bottom: none; }
                .aa-table tbody tr:hover { background: var(--muted, #f5f7fb); }

                .aa-risk-badge {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 2px 9px; border-radius: 20px;
                    font-size: 12px; font-weight: 600;
                }
                .aa-risk-2 { background: #dcfce7; color: #166534; }
                .aa-risk-3 { background: #fef3c7; color: #92400e; }
                .aa-risk-4 { background: #fee2e2; color: #991b1b; }

                .aa-pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-top: 1px solid var(--border, #e5e7eb); font-size: 13px; }
                .aa-pagination-info { color: var(--text-muted, #475569); }


                @media (prefers-reduced-motion: reduce) {
                    .aa-btn, .aa-table tbody tr { transition: none; }
                }
            `}</style>

            <div className="container-fluid aa-page">

                <div className="aa-header">
                    <h1>
                        {isPopulationGroups
                            ? "CRC Incidence Population Groups"
                            : "Aggregation Analysis (GR)"}
                    </h1>
                    <p>
                        {isPopulationGroups
                            ? "Clustering analysis based on LIT-02 data to identify 12 CRC Incidence population groups for LiP-02"
                            : "Pilot-specific aggregation results (integrated analytics & policy relevance)."}
                    </p>
                </div>

                <div className="row g-3">

                    {/* ── Left sidebar ── */}
                    <div className="col-xl-2 col-lg-3">
                        {!isPopulationGroups && (
                            <>
                                <div className="aa-sidebar-card">
                                    <label className="filter-label" htmlFor="aa-variable-select">Variable</label>
                                    <select
                                        id="aa-variable-select"
                                        className="form-select"
                                        value={selectedVariable}
                                        onChange={(e) => setSelectedVariable(e.target.value)}
                                    >
                                        <option value="">Select variable…</option>
                                        {variables.map((v, i) => (
                                            <option key={i} value={v as string}>{v as string}</option>
                                        ))}
                                    </select>
                                </div>

                                {barChartVarsTime.includes(selectedVariable) && (
                                    <div className="aa-sidebar-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        <div>
                                            <label className="filter-label" htmlFor="aa-period-type">Period Type</label>
                                            <select
                                                id="aa-period-type"
                                                className="form-select"
                                                value={selectedPeriodType}
                                                onChange={(e) => setSelectedPeriodType(e.target.value)}
                                            >
                                                <option value="">All Period Types</option>
                                                {periodTypes.map((pt, i) => <option key={i} value={pt}>{pt}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="filter-label" htmlFor="aa-time-period">Time Period</label>
                                            <select
                                                id="aa-time-period"
                                                className="form-select"
                                                value={selectedTimePeriod}
                                                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                                disabled={!selectedPeriodType}
                                            >
                                                <option value="">All Time Periods</option>
                                                {timePeriods.map((tp, i) => (
                                                    <option key={i} value={tp as string}>{formatTimePeriod(tp as string)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {selectedVariable && variableDescription[selectedVariable] && (
                                    <div className="aa-sidebar-card">
                                        <span className="filter-label">Description</span>
                                        <div className="aa-desc" dangerouslySetInnerHTML={{ __html: variableDescription[selectedVariable] }} />
                                    </div>
                                )}
                            </>
                        )}

                        {isPopulationGroups && (
                            <div className="aa-info-card">
                                <p style={{ marginTop: 0, fontSize: 13, lineHeight: 1.65 }}>
                                    <strong>CRC Incidence population groups</strong> represent distinct and interpretable subgroups based on shared demographic, lifestyle, and health-related characteristics. These groups support tailored policy decisions and targeted interventions within <strong>LiP-02</strong>. Their analysis is based on data collected in <strong>Greece</strong> through the <strong>NELI mobile application</strong> during Living Lab Integration Test 02 (<strong>LIT-02</strong>).
                                </p>
                                <p style={{ fontSize: 13, lineHeight: 1.65 }}>
                                    Clustering analysis was performed using an optimized set of 10 variables: age group, BMI group, biological sex, smoking status, activity level, education, employment, region, occupation, and CRC Risk Score.
                                </p>
                                <p style={{ fontSize: 13, lineHeight: 1.65 }}>
                                    Hierarchical clustering with Gower distance identified <strong>12 population groups</strong> in accordance with project KPIs, distributed as follows:
                                </p>
                                <ul style={{ fontSize: 13, marginTop: 4 }}>
                                    <li>7 groups with CRC risk score 2</li>
                                    <li>3 groups with CRC risk score 3</li>
                                    <li>2 groups with CRC risk score 4</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* ── Center ── */}
                    <div className="col-xl-8 col-lg-6">

                        {/* Population Groups view */}
                        {isPopulationGroups && (
                            <>
                                <div className="aa-toolbar">
                                    <button className="aa-btn aa-btn-secondary" onClick={() => setShowGraph(prev => !prev)}>
                                        {showGraph ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                                Show Table
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="6" cy="18" r="3"/></svg>
                                                Show Graph
                                            </>
                                        )}
                                    </button>
                                    {!showGraph && (
                                        <button className="aa-btn aa-btn-success" onClick={downloadCSV}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            Download CSV
                                        </button>
                                    )}
                                </div>

                                {!showGraph && (
                                    <div className="aa-table-wrapper">
                                        <table className="aa-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 40 }}>Color</th>
                                                    <th>Cluster</th>
                                                    <th>Variables</th>
                                                    <th>CRC Risk Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uniquePopulationGroups.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ textAlign: "center" }}>
                                                            <span
                                                                style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", backgroundColor: riskScoreColor[row.score] || "#ccc" }}
                                                                title={`Risk Score ${row.score}`}
                                                            />
                                                        </td>
                                                        <td style={{ fontWeight: 600 }}>{row.cluster}</td>
                                                        <td style={{ fontSize: 12.5, color: "var(--text-muted, #475569)" }}>{row.variables}</td>
                                                        <td>
                                                            <span className={`aa-risk-badge aa-risk-${row.score}`}>{row.score}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {showGraph && (
                                    <div className="aa-chart-wrapper" style={{ minHeight: 540 }}>
                                        <ReactECharts option={scatterOptions} style={{ height: 540, width: "100%" }} />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Aggregation view */}
                        {!isPopulationGroups && (
                            <>
                                {!selectedVariable && (
                                    <div className="aa-intro">
                                        <p>
                                            Through this tab, users can explore insights from{" "}
                                            {country === "Greece" ? <><strong>LIT2</strong> (Greece)</> : country === "Romania" ? <><strong>LIP1</strong> (Romania)</> : <strong>{country}</strong>}.
                                        </p>
                                        <p>
                                            The <strong>Aggregation Analysis</strong> summarizes data from the NELI mobile app (T4.2), providing population-level insights across <strong>{country}</strong>.
                                        </p>
                                        <p>Please select a variable from the dropdown on the left.</p>
                                    </div>
                                )}

                                {loading && selectedVariable && (
                                    <div className="aa-chart-wrapper">
                                        <div className="aa-chart-loading">
                                            <div className="spinner" aria-label="Loading data" />
                                            <span>Loading data…</span>
                                        </div>
                                    </div>
                                )}

                                {error && !loading && (
                                    <div className="aa-alert-err">{error}</div>
                                )}

                                {!loading && !error && selectedVariable && filteredData.length > 0 && (
                                    <>
                                        <div className="aa-chart-wrapper">
                                            {chartType === "pie-detailed" && (
                                                <ReactECharts key={`${selectedVariable}-pie-detailed`} option={getPieOptions()} style={{ height: 440, width: "100%" }} />
                                            )}
                                            {chartType === "pie-simple" && (
                                                <ReactECharts key={`${selectedVariable}-pie-simple`} option={getPieOptions()} style={{ height: 440, width: "100%" }} />
                                            )}
                                            {chartType === "bar" && (
                                                <ReactECharts key={`${selectedVariable}-bar`} option={getBarOptions()} style={{ height: 440, width: "100%" }} />
                                            )}
                                        </div>
                                        <div className="mt-3">
                                            <button className="aa-btn aa-btn-primary" onClick={() => setShowModal(true)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                                View Data Table
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Right: accordion + comments ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div style={{ marginBottom: 16 }}>
                            <Accordion defaultActiveKey="-1" className="app-accordion">
                                {activeAccordionItems.map((item, idx) => (
                                    <Accordion.Item eventKey={idx.toString()} key={idx}>
                                        <Accordion.Header>{item.title}</Accordion.Header>
                                        <Accordion.Body className="text-start">{item.content}</Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </div>
                        <Comments />
                    </div>

                </div>
            </div>

            {/* ── Data table modal ── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                <Modal.Header closeButton style={{ borderBottom: "1px solid var(--border, #e5e7eb)", padding: "16px 20px" }}>
                    <Modal.Title style={{ fontSize: 16, fontWeight: 700 }}>{selectedVariable}</Modal.Title>
                    <button className="aa-btn aa-btn-success ms-auto" onClick={handleDownloadCSV}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download CSV
                    </button>
                </Modal.Header>
                <Modal.Body style={{ padding: 0, maxHeight: "65vh", overflowY: "auto", paddingBottom: totalPages > 1 ? 0 : "12px" }}>
                    <table className="aa-table" style={{ borderRadius: 0 }}>
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>Color</th>
                                {["Variable","Category","Frequency","% of Total","Mean","Median","Std. Dev.","Min","Max"].map((h, i) => (
                                    <th key={i}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((row, idx) => {
                                const color = colorMapping[row.Variable]?.[row.Category] || "#ccc";
                                const displayCategory = row.Category === "50-60" ? "40-70" : row.Category;
                                return (
                                    <tr key={idx}>
                                        <td style={{ textAlign: "center" }}>
                                            <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", backgroundColor: color }} />
                                        </td>
                                        <td>{row.Variable}</td>
                                        <td>{displayCategory}</td>
                                        <td>{row.Frequency ?? "-"}</td>
                                        <td>{row["Percentage of Total"]?.toFixed(2) ?? "-"}</td>
                                        <td>{row.Mean?.toFixed(2) ?? "-"}</td>
                                        <td>{row.Median ?? "-"}</td>
                                        <td>{row["Std. Dev."]?.toFixed(2) ?? "-"}</td>
                                        <td>{row.Min ?? "-"}</td>
                                        <td>{row.Max ?? "-"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Modal.Body>
                {totalPages > 1 && (
                    <Modal.Footer style={{ borderTop: "1px solid var(--border, #e5e7eb)", padding: "10px 16px" }}>
                        <div className="aa-pagination" style={{ width: "100%", padding: 0 }}>
                            <button className="aa-btn aa-btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</button>
                            <span className="aa-pagination-info">Page {currentPage} of {totalPages}</span>
                            <button className="aa-btn aa-btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
                        </div>
                    </Modal.Footer>
                )}
            </Modal>
        </>
    );
};

export default AggregationAnalysis;
