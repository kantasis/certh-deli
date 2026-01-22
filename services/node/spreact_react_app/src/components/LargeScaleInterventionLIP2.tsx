import { useEffect, useMemo, useState, useRef } from "react";
import { Accordion, Modal, Button, Card } from 'react-bootstrap';
import { useSearchParams } from "react-router-dom";
import Comments from "./Comments.tsx";
import * as AuthService from "../services/auth.service.tsx";




const accordionContent_dictLst = [
    {
        title: 'Pilot',
        content: (<>
            <div style={{ height: '340px', overflow: 'scroll' }}>
                <p>
                    <li><strong>Pilot Objectives: </strong> To raise awareness of CRC risk factors and promote primary prevention strategies across diverse population groups. To investigate scalability and sustainability potential of effective piloted interventions.
                    </li><br />
                    <li><strong>Pilot Location: </strong>Prefecture of Central Macedonia, Greece.
                    </li><br />
                    <li><strong>How the Pilot Works:: </strong> We follow a data-driven lifecycle to identify and implement the most effective CRC prmary prevention interventions:<br></br>
                        <ul>
                            <li>
                                <strong> 1.	Analyze:</strong> Used DELI predictive analytics to project CRC incidence.<br></br>

                            </li>
                            <li>
                                <strong> 2.	Prioritize::</strong> Identified modifiable risk factors with the highest potential for reduction.<br></br>

                            </li>
                            <li>
                                <strong> 3.	Implement:</strong> Launched targeted interventions based on data insights.<br></br>

                            </li>
                            <li>
                                <strong> 4.	Evaluate:</strong> Analyzed data via evaluation tools to measure real-world impact.<br></br>

                            </li>
                            <li>
                                <strong> 5.	Scale:</strong> Shape regulatory changes and support widespread adoption.<br></br>

                            </li>
                        </ul>

                    </li><br />


                </p>
            </div>

        </>)
    },
    {
        title: 'Definitions',
        content: (<>
            <p>
              <strong>  •	Domains:</strong> <br></br>Policy fields identified by MoHGR during the policy mapping exercise<br></br><br></br>
             <strong>   •	Interventions:</strong> <br></br>Activities and programs addressing commonly acknowledged CRC risk factors implemented during the pilot<br></br><br></br>
             <strong>   •	Risk Factors:</strong> <br></br>Factors sourced from the Global Burden of Disease (GBD) and linked to specific interventions via DELI analytics.

            </p>
        </>)
    },


];









// Table data
const interventionsData = [
    {
        name: "Support Smoking Cessation",
        category: "Smoking",
        riskFactors: ["Smoking"],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "School policies to limit use tobacco products within school settings",
        category: "Smoking",
        riskFactors: ["Smoking"],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Smoking ban on all facilities admitting children & adolescents under 18 years old",
        category: "Smoking",
        riskFactors: ["Smoking"],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Awareness Campaigns",
        category: "Alcohol Consumption",
        riskFactors: ["Alcohol use"],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Actions for alcohol abuse prevention",
        category: "Alcohol Consumption",
        riskFactors: ["Alcohol use"],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Awareness Campaigns",
        category: "Diet & Eating Habits",
        riskFactors: [
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Custom nutritional guidelines to specific targeted groups",
        category: "Diet & Eating Habits",
        riskFactors: [
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Awareness Campaigns",
        category: "Physical Activity",
        riskFactors: [
            "High body-mass index",
            "Low physical activity",
            "High LDL cholesterol",
            "High systolic blood pressure"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Development of Physical Activity Infrastructure",
        category: "Physical Activity",
        riskFactors: [
            "High body-mass index",
            "Low physical activity"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Utilize Technology for Health Literacy Enhancement",
        category: "Health Literacy",
        riskFactors: [
            "Smoking/Tobacco",
            "Alcohol use",
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
            "High body-mass index",
            "Low physical activity",
            "High LDL cholesterol",
            "High systolic blood pressure"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Dissemination of the European Code Against Cancer in schools, workplaces, healthcare settings",
        category: "Health Literacy",
        riskFactors: [
            "Smoking/Tobacco",
            "Alcohol use",
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
            "High body-mass index",
            "Low physical activity",
            "High LDL cholesterol",
            "High systolic blood pressure"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Promotion of uptaking a healthy lifestyle & encouraging healthy aging",
        category: "Health Promotion",
        riskFactors: [
            "Smoking/Tobacco",
            "Alcohol use",
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
            "High body-mass index",
            "Low physical activity",
            "High LDL cholesterol",
            "High systolic blood pressure"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Health promotion app/personalized cancer risk assessment",
        category: "Health Promotion",
        riskFactors: [
            "Smoking/Tobacco",
            "Alcohol use",
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
            "High body-mass index",
            "Low physical activity",
            "High LDL cholesterol",
            "High systolic blood pressure"
        ],
        effectiveness: "",
        recommendations: ""
    },
    {
        name: "Address inequalities through research",
        category: "R&D",
        riskFactors: [
            "Smoking/Tobacco",
            "Alcohol use",
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
            "High body-mass index",
            "Low physical activity",
            "High LDL cholesterol",
            "High systolic blood pressure"
        ],
        effectiveness: "",
        recommendations: ""
    }
];

const riskFactors = [
    "Smoking",
    "Alcohol use",
    "Diet high in processed meat",
    "Diet high in red meat",
    "Diet high in trans fatty acids",
    "Diet low in calcium",
    "Diet low in fruits",
    "Diet low in vegetables",
    "Diet low in polyunsaturated fatty acids",
    "Diet low in seafood omega-3 fatty acids",
    "Diet low in whole grains",
    "High body-mass index",
    "Low physical activity",
    "High LDL cholesterol",
    "High systolic blood pressure"
];






const FilterableTable = () => {
    const [selectedIntervention, setSelectedIntervention] = useState("");
    const [selectedRiskFactor, setSelectedRiskFactor] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);



    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);



    if (!isLoggedIn) {
        return <h2>Unauthorized</h2>;
    }
    const filteredData = interventionsData.filter((item) => {
        const interventionMatch = selectedIntervention
            ? item.name === selectedIntervention
            : true;

        const riskMatch = selectedRiskFactor
            ? item.riskFactors.includes(selectedRiskFactor)
            : true;

        return interventionMatch && riskMatch;
    });

    return (
        <div className="">
            <h3 className="mb-2 mt-2">Large-scale Intervention Pilot 2 – Greece </h3> <br />
            <h4 className="mb-2">CRC Primary Prevention at Regional Level </h4> <br />
            <div className="row mt-2">

                <div className="col-2">
                    <label className="fw-bold mb-1">Select Intervention</label>

                    <select
                        value={selectedIntervention}
                        onChange={(e) => setSelectedIntervention(e.target.value)}
                        className="border p-2 rounded form-select"
                    >
                        <option value="">All Interventions</option>
                        {interventionsData.map((i, idx) => (
                            <option key={idx} value={i.name}>
                                {i.name} ({i.category})
                            </option>
                        ))}
                    </select>
                    <label className="fw-bold mb-1">Select Risk Factors</label>
                    <select
                        value={selectedRiskFactor}
                        onChange={(e) => setSelectedRiskFactor(e.target.value)}
                        className="border p-2 rounded form-select"
                    >
                        <option value="">All Risk Factor</option>
                        {riskFactors.map((rf, idx) => (
                            <option key={idx} value={rf}>
                                {rf}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="col-8">
                    <table className="border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-4 py-2">Intervention</th>
                                <th className="border px-4 py-2">Domain</th>
                                <th className="border px-4 py-2">Related Risk Factors</th>
                                <th className="border px-4 py-2">Effectiveness</th>
                                <th className="border px-4 py-2">Relevant Recommendations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2">{row.name}</td>
                                    <td className="border px-4 py-2">{row.category}</td>
                                    <td className="border px-4 py-2">{row.riskFactors.join(", ")}</td>
                                    <td className="border px-4 py-2">{row.effectiveness}</td>
                                    <td className="border px-4 py-2">{row.recommendations}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
                <div className="col-2">
                    <Accordion defaultActiveKey="-1">
                        {accordionContent_dictLst.map((item, idx) => (
                            <Accordion.Item eventKey={idx.toString()} key={idx}>
                                <Accordion.Header>{item.title}</Accordion.Header>
                                <Accordion.Body className="text-start" style={{ height: "340px", overflow: "scroll" }}>
                                    {item.content}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                    <Comments></Comments>
                </div>
            </div>
        </div>
    );
};

export default FilterableTable;
