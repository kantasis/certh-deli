import { Fragment, useEffect, useState } from "react";
import Unauthorized from './Unauthorized';
import { Accordion } from 'react-bootstrap';
import Comments from "./Comments.tsx";
import * as AuthService from "../services/auth.service.tsx";

const accordionContent_dictLst = [
    {
        title: 'Pilot',
        content: (
            <div>
                <ul className="ps-3" style={{ margin: 0 }}>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Pilot Objectives:</strong> To raise awareness of CRC risk factors and promote primary prevention strategies across diverse population groups. To investigate scalability and sustainability potential of effective piloted interventions.
                    </li>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Pilot Location:</strong> Prefecture of Central Macedonia, Greece.
                    </li>
                    <li>
                        <strong>How the Pilot Works:</strong> We follow a data-driven lifecycle to identify and implement the most effective CRC primary prevention interventions:
                        <ol className="mt-2" style={{ paddingLeft: 16 }}>
                            <li style={{ marginBottom: 4 }}><strong>Analyze:</strong> Used DELI predictive analytics to project CRC incidence.</li>
                            <li style={{ marginBottom: 4 }}><strong>Prioritize:</strong> Identified modifiable risk factors with the highest potential for reduction.</li>
                            <li style={{ marginBottom: 4 }}><strong>Implement:</strong> Launched targeted interventions based on data insights.</li>
                            <li style={{ marginBottom: 4 }}><strong>Evaluate:</strong> Analyzed data via evaluation tools to measure real-world impact.</li>
                            <li><strong>Scale:</strong> Shape regulatory changes and support widespread adoption.</li>
                        </ol>
                    </li>
                </ul>
            </div>
        ),
    },
    {
        title: 'Definitions',
        content: (
            <ul className="ps-3" style={{ margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                    <strong>Domains:</strong> Policy fields identified by MoHGR during the policy mapping exercise.
                </li>
                <li style={{ marginBottom: 8 }}>
                    <strong>Interventions:</strong> Activities and programs addressing commonly acknowledged CRC risk factors implemented during the pilot.
                </li>
                <li>
                    <strong>Risk Factors:</strong> Factors sourced from the Global Burden of Disease (GBD) and linked to specific interventions via DELI analytics.
                </li>
            </ul>
        ),
    },
];

interface Intervention {
    name: string;
    category: string;
    piloted: boolean;
    riskFactors: string[];
    owner?: string;
    details?: string;
    targetedGroups?: string[];
    clusters?: string[];
    inequalities?: string;
    behaviouralBarriers?: string[];
    structuralBarriers?: string[];
    facilitators?: string[];
    reach?: string;
    diagnostic?: string;
    recommendations?: string[];
}

const interventionsData: Intervention[] = [
    {
        name: "Support Smoking Cessation",
        category: "Smoking",
        piloted: true,
        owner: "AUTH",
        details: "Dissemination of Research Findings - Smokefree Brain| CancerAware (ecac) |Educational Materials | Smoking Cessation Units | AUTH Counseling and Guidance Centre",
        targetedGroups: [
            "General Public",
            "Smokers",
        ],
        clusters: [
            "C3: The Former Smoker Runner (Young male, former smoker, Score 2)",
            "C5: The Mysterious Smoker (Active smoker, graduate, Score 2)",
            "C6: The Suburban Farmer (Female farmer, former smoker, Score 2)",
            "C7: The Suburban Former Smoker (Young male, overweight, former smoker, Score 2)",
            "C10: The Young Sales Clerk (Young female, overweight, former smoker, Score 3)",
            "C11: The Retired Smoker (Elderly female 70+, obese, active smoker, Score 4)",
        ],
        riskFactors: [
            "Smoking/Tobacco",
        ],
        inequalities: "NO",
        behaviouralBarriers: [
            "Social Influences",
            "Lack of Knowledge about Healthy Choices",
            "Limited Availability of Support Resources",
            "Stigmatization",
        ],
        structuralBarriers: [
            "Economic inequality",
            "Peer pressure",
            "Healthcare system funding",
            "Public perception",
        ],
        facilitators: [
            "Engagement of different stakeholders across societies",
            "Public-Private-Partnerships",
        ],
        reach: "Audited across 20 public sites (AUTH campus, cafes, and food venues in Thessaloniki). 100% Adoption/Placement Rate with 100% eye-level positioning in high-traffic footpaths. Visibility Score: High (4–5 / 5).",
        diagnostic: "Established a reliable, repeatable observational checklist to audit material condition and exposure density.",
        recommendations: [
            "Institutionalize placement guidelines targeting high-density youth, transit, and community hubs.",
            "Mandate routine observation checklists across municipal health campaigns.",
            "Leverage physical displays as visual anchors signposting citizens toward digital health tools.",
        ],
    },
    {
        name: "School policies to limit use tobacco products within school settings",
        category: "Smoking",
        piloted: true,
        owner: "RDFCM",
        details: "Informational speeches for smoking.",
        targetedGroups: [
            "School Communities",
        ],
        clusters: [
            "C4: The Ambivalent Youth (Younger citizens <40, mixed/low activity, uncertain student status, Moderate Risk Score 2).",
            "Targets youth exposed to peer pressure and adolescent vaping normalization.",
        ],
        riskFactors: [
            "Smoking/Tobacco",
        ],
        inequalities: "YES",
        behaviouralBarriers: [
            "Social Influences",
            "Potential Stigma or Fear of Judgment",
            "Lack of Knowledge about Healthy Choices",
            "Lack of Awareness of Support Resources",
        ],
        structuralBarriers: [
            "Bureaucratic obstacles",
            "Community engagement",
            "Intergenerational attitudes",
        ],
        facilitators: [
            "Ensure cultural sensitivity in delivering healthcare services & information",
            "Engagement of different stakeholders across societies",
        ],
        reach: "Reached 6 school sites across Central Macedonia. 0% final policy adoption (60% in-progress, 40% stagnant).",
        diagnostic: "Informational speeches raised student awareness but failed to compel formal rule changes without administrative mandates. Identified strong adolescent biases viewing e-cigarettes/vaping as harmless compared to combustible tobacco.",
        recommendations: [
            "Launch dedicated anti-vaping campaigns explicitly targeting e-cigarette myths.",
            "Institutionalize \"Smoke-Free School Badges\" for 100% tobacco/vape-free campuses.",
            "Establish digital parent communication channels regarding youth vaping.",
            "Train school health ambassadors for peer-to-peer counseling.",
            "Codify strict non-smoking/vaping rules directly in official school bylaws.",
            "Implement anonymous student reporting portals for health violations.",
            "Transition from static lectures to experiential, youth-led workshops.",
            "Connect schools directly with municipal adolescent health services.",
            "Institute annual observational compliance audits in public schools.",
        ],
    },
    {
        name: "Smoking ban on all facilities admitting children & adolescents under 18 years old",
        category: "Smoking",
        piloted: true,
        owner: "RDFCM",
        details: "Educational material - Posters - Social Media Campaings",
        targetedGroups: [
            "General Public",
        ],
        clusters: [
            "C4: The Ambivalent Youth (Adolescents & minors <18)",
            "Focuses on child/adolescent exposure to second-hand smoke and illegal vaping in public youth venues.",
        ],
        riskFactors: [
            "Smoking/Tobacco",
        ],
        inequalities: "YES",
        behaviouralBarriers: [
            "Complexity of Application Processes",
            "Language Barriers",
            "Cultural Differences Impeding Communication",
        ],
        structuralBarriers: [
            "Legislative gaps",
            "Regulatory delays",
        ],
        facilitators: [
            "Streamlining of bureaucratic processes",
        ],
        reach: "Audited sports centers, playgrounds, and youth cultural venues across Central Macedonia.",
        diagnostic: "Revealed an enforcement gap where grassroots awareness failed to secure facility compliance without municipal enforcement mechanisms. High-traffic minor venues consistently lacked visible legal warning signage.",
        recommendations: [
            "Require standardized, high-visibility anti-smoking/vaping posters in all youth venues.",
            "Use universal pictogram warnings for age limits and health hazards.",
            "Establish routine municipal health inspections and venue compliance checks.",
            "Conduct mandatory staff compliance training for facility managers and youth coaches.",
            "Enable digital venue reporting via municipal apps.",
            "Mandate strict ID checks and age verification standards.",
            "Launch municipal social media campaigns reinforcing Law 5216/2025.",
        ],
    },
    {
        name: "Awareness Campaigns",
        category: "Alcohol Consumption",
        piloted: true,
        owner: "AUTH",
        details: "Posters| Social Media Campaigns | Community-Based Initiatives",
        targetedGroups: [
            "General Public",
        ],
        clusters: [
            "C2: The Sedentary Professional (Young, overweight, sedentary male, Score 2)",
            "C3: The Former Smoker Runner (Young active male, Score 2)",
            "C4: The Ambivalent Youth (Young adults, students, Score 2)",
            "C5: The Mysterious Smoker (Active smoker, university graduate, Score 2)",
        ],
        riskFactors: [
            "Alcohol use",
        ],
        inequalities: "NO",
        behaviouralBarriers: [
            "Social Influences",
            "Cultural Differences Impeding Communication",
            "Limited Access to Healthcare Services",
            "Language Barriers",
        ],
        structuralBarriers: [
            "Peer pressure",
            "Community engagement",
            "Public perception",
        ],
        facilitators: [
            "Raise awareness & offer incentives for partnerships between the public and private sector",
            "Improve health literacy",
            "Public-Private-Partnerships",
        ],
        reach: "Deployed across 10 strategic key venues (campus & student hospitality hubs) with repeated exposure. Visibility Score: High (4–5 / 5).",
        diagnostic: "Reached youth directly in social settings, bypassing the defensive reactions common in formal clinical lectures.",
        recommendations: [
            "Mandate annual alcohol awareness campaigns across higher education institutions and vocational centers.",
            "Pair visual displays with QR codes linking to digital self-assessment tools and anonymous counseling.",
            "Partner with municipal health centers and hospitality businesses to offer incentives for alcohol-free youth events.",
        ],
    },
    {
        name: "Actions for alcohol abuse prevention",
        category: "Alcohol Consumption",
        piloted: false,
        riskFactors: [
            "Alcohol use",
        ],
    },
    {
        name: "Awareness Campaigns",
        category: "Diet & Eating Habits",
        piloted: true,
        owner: "AUTH",
        details: "ECAC | CANCER AWARE | Posters| Social Media Campaigns",
        targetedGroups: [
            "General Public",
        ],
        clusters: [
            "C2: The Sedentary Professional (Overweight, sedentary worker, Score 2)",
            "C7: The Suburban Former Smoker (Young, overweight, Score 2)",
            "C8: The Obese Active Professional (Middle-aged, obese, Score 3)",
            "C10: The Young Sales Clerk (Young, overweight, Score 3)",
            "C11: The Retired Smoker (Elderly 70+, obese, Score 4)",
        ],
        riskFactors: [
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
        ],
        inequalities: "NO",
        behaviouralBarriers: [
            "Cultural Differences Impeding Communication",
            "Language Barriers",
            "Accessibility to Healthy Options",
        ],
        structuralBarriers: [
            "Economic inequality",
            "Public health prioritization",
            "Community engagement",
            "Costly healthy lifestyle options",
            "Social isolation",
        ],
        facilitators: [
            "Public-Private-Partnerships",
            "Engagement of different stakeholders across societies",
        ],
        reach: "Deployed across 15 display sites. Visibility Score: High (4–5 / 5).",
        diagnostic: "Poster-only delivery proved highly cost-effective, establishing a reliable baseline and successfully countering youth myths that healthy diets require expensive organic foods.",
        recommendations: [
            "Adapt ECAC nutritional messaging into local minority and migrant languages across health centers.",
            "Collaborate with local food markets, vendors, and cafeterias to highlight low-cost, nutrient-dense choices.",
            "Combine visual poster campaigns with hands-on community culinary demonstrations in municipal centers.",
            "Frame dietary choices realistically around local food prices and household budgets.",
        ],
    },
    {
        name: "Informational Speeches on Proper Nutrition & Mediterranean Diet",
        category: "Diet & Eating Habits",
        piloted: true,
        owner: "RDFCM",
        details: "Educational material, posters, speeches addressing dietary risk factors (red/processed meat, low fruits/vegetables) among school communities.",
        targetedGroups: [
            "School Communities",
        ],
        clusters: [
            "C4: The Ambivalent Youth (Adolescents & secondary students, Moderate Risk Score 2)",
            "Addresses adolescent hedonic barriers and junk food reliance.",
        ],
        riskFactors: [
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
        ],
        inequalities: "YES",
        behaviouralBarriers: [
            "Cultural Differences Impeding Communication",
            "Eligibility Criteria for Programs",
            "Stigmatization",
            "Language Barriers",
        ],
        structuralBarriers: [
            "Economic inequality",
            "Public health prioritization",
            "Community engagement",
            "Costly healthy lifestyle options",
            "Lack of healthcare IT systems",
        ],
        facilitators: [
            "Engagement of different stakeholders across societies",
            "Provide cultural competency trainings to healthcare professionals",
        ],
        reach: "Achieved a 48% distribution rate across target school populations.",
        diagnostic: "Uncovered strong adolescent hedonic barriers, specifically the perception that healthy diets compromise taste and exceed youth budgets.",
        recommendations: [
            "Host canteen food sampling events offering budget-friendly healthy snack tastings.",
            "Launch gamified QR-coded nutrition scavenger hunts.",
            "Subsidize healthy options to lower prices for fresh fruits and salads in canteens.",
            "Host interactive youth cooking demonstrations with culinary partners.",
            "Distribute family meal planning toolkits to parents.",
            "Regulate high-sugar snacks in school vending machines.",
        ],
    },
    {
        name: "Custom nutritional guidelines to specific targeted groups",
        category: "Diet & Eating Habits",
        piloted: false,
        riskFactors: [
            "Diet high in processed meat",
            "Diet high in red meat",
            "Diet high in trans fatty acids",
            "Diet low in calcium",
            "Diet low in fruits",
            "Diet low in vegetables",
            "Diet low in polyunsaturated fatty acids",
            "Diet low in seafood omega-3 fatty acids",
            "Diet low in whole grains",
        ],
    },
    {
        name: "Awareness Campaigns",
        category: "Physical Activity",
        piloted: true,
        owner: "AUTH",
        details: "Cancer Aware | Comfortage | Posters| Social Media Campaigns \"Myth-Busting Campaign: Address misconceptions about CRC and exercise\" | Community-Based Initiatives",
        targetedGroups: [
            "General Public",
        ],
        clusters: [
            "C2: The Sedentary Professional (Sedentary worker, Score 2)",
            "C4: The Ambivalent Youth (Low activity, Score 2)",
            "C5: The Mysterious Smoker (Moderate activity, Score 2)",
            "C10: The Young Sales Clerk (Overweight, Score 3)",
            "C11: The Retired Smoker (Elderly, obese, Score 4)",
            "C12: The Suburban Retired Manager (Elderly, low activity, Score 4)",
        ],
        riskFactors: [
            "High body-mass index",
            "Low physical activity",
            "High LDL cholesterol",
            "High systolic blood pressure",
        ],
        inequalities: "NO",
        behaviouralBarriers: [
            "Lack of Awareness of Support Resources",
            "Social Influences",
        ],
        structuralBarriers: [
            "Costly healthy lifestyle options",
            "Peer pressure",
            "Lack of political engagement",
        ],
        facilitators: [
            "Public-Private-Partnerships",
            "Engagement of different stakeholders across societies",
        ],
        reach: "Reached 20 sites across Thessaloniki. Visibility Score: High (4–5 / 5).",
        diagnostic: "Busting exercise myths proved vital for convincing inactive youth that daily movement prevents CRC. Urban posters successfully maintained physical activity signposting even when mobile kiosks experienced operational delays.",
        recommendations: [
            "1.Highlight no-cost and low-cost exercise options to remove financial barriers.",
            "Leverage peer testimonials to normalize daily activity and translate materials into minority languages.",
            "Advocate for permanent urban fitness pods and mobile kiosks in rural areas.",
            "Streamline municipal bureaucratic approvals for public health installations and integrate QR analytics into regional dashboards.",
            "Frame public exercise access as an equity and public good priority.",
        ],
    },
    {
        name: "Development of Physical Activity Infrastructure",
        category: "Physical Activity",
        piloted: false,
        riskFactors: [
            "High body-mass index",
            "Low physical activity",
        ],
    },
    {
        name: "Utilize Technology for Health Literacy Enhancement (e.g. Central Information Points, Websites, Data diodes)",
        category: "Health Literacy",
        piloted: true,
        owner: "AUTH",
        details: "Public display of ONCODIR app/website URLs and QR codes on eye-level posters, serving as a low-barrier physical gateway to digital cancer prevention resources (e.g., Cancer Aware EU App).",
        targetedGroups: [
            "General Public",
        ],
        clusters: [
            "Universal Application across ALL 12 Clusters (C1 to C12).",
            "Bridges digital divide between tech-savvy youth and older adult cohorts.",
        ],
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
            "High systolic blood pressure",
        ],
        inequalities: "NO",
        behaviouralBarriers: [
            "Financial/Economic Constraints",
            "Limited Access to Healthcare Services",
            "Language Barriers",
        ],
        structuralBarriers: [
            "Intergenerational attitudes",
            "Digital health literacy",
            "Public health prioritization",
        ],
        facilitators: [
            "Develop & implement comprehensive digital health platforms",
            "Deploy user-friendly mobile health applications",
            "Create online health information portals/support the adoption of webinars, podcasts, online health forums for such purposes",
        ],
        reach: "Campus and city-wide public venue deployment. Visibility Score: High (4–5 / 5).",
        diagnostic: "Successfully bridged physical and digital channels, guiding non-tech-savvy citizens toward digital cancer prevention tools via accessible print displays.",
        recommendations: [
            "Integrate voice-first navigation and offline accessibility into the ONCODIR app for low-literacy users.",
            "Partner with local libraries, pharmacies, and community centers as physical assisted-onboarding hubs.",
            "Pair tech-savvy youth ambassadors with older adults for guided digital onboarding.",
            "Embed micro-learning modules and usage analytics to track ongoing engagement.",
        ],
    },
    {
        name: "Dissemination of the European Code Against Cancer in schools, workplaces, healthcare settings",
        category: "Health Literacy",
        piloted: true,
        owner: "AUTH",
        details: "Translation of complex European Code Against Cancer (ECAC) and WHO recommendations into concise, actionable poster messages across schools, workplaces, and primary care settings.",
        targetedGroups: [
            "General Public",
        ],
        clusters: [
            "Universal Application across ALL 12 Clusters (C1 to C12).",
            "Establishes institutional multiplier effect in public settings.",
        ],
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
            "High systolic blood pressure",
        ],
        inequalities: "NO",
        behaviouralBarriers: [
            "Lack of Knowledge about Healthy Choices",
            "Cultural Differences Impeding Communication",
            "Limited Access to Healthcare Services",
            "Social Influences",
        ],
        structuralBarriers: [
            "Bureaucratic obstacles",
            "Lack of political engagement",
            "Public health prioritization",
            "Community engagement",
            "Intergenerational attitudes",
        ],
        facilitators: [
            "Enhance communication between communities & healthcare providers",
            "Improve health literacy",
            "Engagement of different stakeholders across societies",
            "Deploy multilingual resources",
        ],
        reach: "Deployed across campus, public venues, and healthcare centers.Visibility Score: High (4–5 / 5).",
        diagnostic: "Bridge between clinical science and daily lifestyle choices, establishing an institutional multiplier effect across public settings.",
        recommendations: [
            "Implement dedicated visual health corners in public municipal buildings, libraries, and workplaces.",
            "Provide primary care workers with structured ECAC conversation prompts for routine visits.",
            "Establish workplace ECAC certification badges and corporate wellness incentives.",
            "Develop co-created educational ECAC modules for schools and family learning events.",
        ],
    },
    {
        name: "Promotion of uptaking a healthy lifestyle & encouraging healthy aging",
        category: "Health Promotion",
        piloted: true,
        owner: "AUTH",
        details: "Targeted campaign focusing on adults aged 45+ across municipal senior centers (KAPI), libraries, and health centers to promote nutrition, mobility, and early CRC screening.",
        targetedGroups: [
            "General Public",
            "Older Adults",
        ],
        clusters: [
            "C8: The Obese Active Professional (Middle-aged 40–70, Score 3)",
            "C11: The Retired Smoker (Elderly 70+, obese, Score 4)",
            "C12: The Suburban Retired Manager (Elderly male, retired, Score 4)",
        ],
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
            "High systolic blood pressure",
        ],
        inequalities: "NO",
        behaviouralBarriers: [
            "Financial/Economic Constraints",
            "Lack of Time/Conflicting Schedules",
            "Social Influences",
            "Geographical Distance from Support Network",
        ],
        structuralBarriers: [
            "Public health prioritization",
            "Economic inequality",
            "Intergenerational attitudes",
        ],
        facilitators: [
            "Offering health programs at community level at low/ no costs",
        ],
        reach: "Broad outreach across 45+ venues and community halls. Visibility Score: High (4–5 / 5).",
        diagnostic: "Retained posters as the most practical and scalable outreach method for older demographics, effectively overcoming time and cost barriers.",
        recommendations: [
            "Leverage municipal channels, senior centers (KAPI), and local health centers for targeted campaign distribution.",
            "Produce printable visual activity packs and story-based educational materials for home use.",
            "Develop a peer network of active older adults and link programs to regional social prescribing models.",
            "Offer evening and weekend health workshops paired with mobile learning kits for remote areas.",
        ],
    },
    {
        name: "Addressing Additional Risk Factors",
        category: "Health Promotion",
        piloted: true,
        owner: "RDFCM",
        details: "Educational material & speeches addressing STDs and their consequent link to CRC among school communities.",
        targetedGroups: [
            "General Public/Οlder Adults",
        ],
        clusters: [
            "C4: The Ambivalent Youth (Adolescents & secondary students, Score 2)",
            "Eliminates youth apathy by linking cancer prevention to immediate sexual health concerns.",
        ],
        riskFactors: [],
        inequalities: "YES",
        behaviouralBarriers: [],
        structuralBarriers: [],
        facilitators: [],
        reach: "Reached 664 school members across 7 educational locations.",
        diagnostic: "Highly effective as an \"Immediate Relevance Hook.\" Coupling long-term cancer prevention to immediate personal health concerns eliminated youth apathy and significantly increased content uptake.",
        recommendations: [
            "Deliver integrated health workshops pairing HPV/STD education with CRC lifestyle guidance.",
            "Train older peer health ambassadors to lead sensitive health discussions.",
            "Provide anonymous digital counseling hubs for youth health advice.",
            "Equip school nurses with preventive health discussion toolkits.",
        ],
    },
    {
        name: "Health promotion app/personalized cancer risk assessment",
        category: "Health Promotion",
        piloted: false,
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
            "High systolic blood pressure",
        ],
    },
    {
        name: "Address inequalities through research",
        category: "R&D",
        piloted: true,
        owner: "AUTH",
        details: "Multi-sector outreach model partnering with local NGOs, health centers, religious associations, and migrant support networks across Central Macedonia (Living Lab SKG) to engage rural, low-income, and immigrant groups.",
        targetedGroups: [
            "Vulnerable",
            "marginalized groups",
        ],
        clusters: [
            "Underserved subgroups across C4, C5, C6, C8, C9, C11, C12",
            "Engages rural, low-income, uninsured, and immigrant populations facing structural healthcare barriers.",
        ],
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
            "High systolic blood pressure",
        ],
        inequalities: "YES",
        behaviouralBarriers: [
            "Financial/Economic Constraints",
            "Limited Access to Healthcare Services",
            "Geographical Distance from Support Network",
            "Cultural Differences Impeding Communication",
            "Language Barriers",
        ],
        structuralBarriers: [
            "Economic inequality",
            "Public health prioritization",
            "Insurance gaps",
            "Lack of political engagement",
        ],
        facilitators: [
            "Leverage of health data that are not currently available to policy makers, adaptation of evidence-based policy making",
            "Promote policies enhancing public awareness on CRC prevention",
            "Public health reforms",
        ],
        reach: "Reached vulnerable and marginalized populations across rural and low-income areas.",
        diagnostic: "Resolved critical language, cultural, geographic, economic, and health insurance roadblocks by engaging directly through trusted local community leaders.",
        recommendations: [
            "Embed cultural mediators and translate all educational materials into minority/community languages.",
            "Develop low-literacy CRC educational leaflets using universal pictograms and icons.",
            "Deploy mobile CRC screening consultation units and map local insurance roadblocks for vulnerable groups.",
            "Partner directly with faith-based, ethnic, and local centers to offer childcare/transport vouchers during sessions.",
        ],
    },
];

const riskFactors = [
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
    "High systolic blood pressure",
];

const domainMeta: Record<string, { bg: string; color: string }> = {
    "Smoking":           { bg: "#fee2e2", color: "#991b1b" },
    "Alcohol Consumption": { bg: "#fef3c7", color: "#92400e" },
    "Diet & Eating Habits": { bg: "#d1fae5", color: "#065f46" },
    "Physical Activity": { bg: "#dbeafe", color: "#1e40af" },
    "Health Literacy":   { bg: "#ede9fe", color: "#5b21b6" },
    "Health Promotion":  { bg: "#fce7f3", color: "#9d174d" },
    "R&D":               { bg: "#e0f2fe", color: "#0c4a6e" },
};

const LargeScaleIntervention = () => {
    const [selectedIntervention, setSelectedIntervention] = useState("");
    const [selectedRiskFactor, setSelectedRiskFactor] = useState("");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => AuthService.isLoggedIn());

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    if (!isLoggedIn) return <Unauthorized />;

    const availableRiskFactors: string[] = selectedIntervention
        ? [...new Set(
            interventionsData
                .filter(item => item.name === selectedIntervention)
                .flatMap(item => item.riskFactors)
          )]
        : riskFactors;

    const handleInterventionChange = (value: string) => {
        setSelectedIntervention(value);
        if (value && selectedRiskFactor) {
            const newAvailable = [...new Set(
                interventionsData
                    .filter(item => item.name === value)
                    .flatMap(item => item.riskFactors)
            )];
            if (!newAvailable.includes(selectedRiskFactor)) setSelectedRiskFactor("");
        }
    };

    const filteredData = interventionsData.filter((item) => {
        const interventionMatch = selectedIntervention ? item.name === selectedIntervention : true;
        const riskMatch = selectedRiskFactor ? item.riskFactors.includes(selectedRiskFactor) : true;
        return interventionMatch && riskMatch;
    });

    return (
        <>
            <style>{`
                .li-page { padding: 24px 0 40px; }

                .li-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .li-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
                .li-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }

                .li-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }
                .li-sidebar-card .filter-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-muted, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 8px;
                }

                .li-table-wrapper {
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: var(--bg, #fff);
                }
                .li-table { width: 100%; border-collapse: collapse; font-size: 15px; }
                .li-table thead th {
                    background: var(--muted, #f5f7fb);
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted, #475569);
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
                .li-table tbody td {
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                    color: var(--text, #0f172a);
                    vertical-align: top;
                    line-height: 1.5;
                }
                .li-table tbody tr:last-child td { border-bottom: none; }
                .li-name-hint { border-bottom: 1px dotted var(--text-muted, #94a3b8); cursor: help; }
                .li-reach { font-size: 13.5px; line-height: 1.5; color: var(--text, #0f172a); }
                .li-nores { font-size: 13px; color: var(--text-muted, #94a3b8); font-style: italic; }
                .li-expand-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: none; border: 1px solid var(--border, #e5e7eb);
                    border-radius: 999px; padding: 3px 11px; cursor: pointer;
                    font-size: 12.5px; font-weight: 600; color: var(--brand-dark, #185569);
                    white-space: nowrap;
                }
                .li-expand-btn:hover { background: var(--muted, #f5f7fb); }
                .li-detail-cell {
                    background: var(--muted, #f8fafc);
                    padding: 18px 20px !important;
                    text-align: left;
                }
                .li-detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 16px 28px;
                    text-align: left;
                }
                .li-detail-block { text-align: left; }
                .li-detail-block h4 {
                    font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.06em; color: var(--text-muted, #475569);
                    margin: 0 0 6px; text-align: left;
                }
                .li-detail-block p {
                    font-size: 13px; line-height: 1.6; color: var(--text, #0f172a);
                    margin: 0; text-align: left;
                }
                .li-detail-block ul {
                    margin: 0; padding: 0 0 0 18px;
                    list-style-position: outside; text-align: left;
                }
                .li-detail-block li {
                    font-size: 13px; line-height: 1.6; color: var(--text, #0f172a);
                    margin: 0 0 4px; text-align: left; padding-left: 2px;
                }
                .li-detail-block li:last-child { margin-bottom: 0; }
                .li-detail-wide { grid-column: 1 / -1; }
                .li-detail-sep {
                    grid-column: 1 / -1; height: 1px;
                    background: var(--border, #e5e7eb); margin: 2px 0;
                }
                .li-ineq-chip {
                    display: inline-block; padding: 1px 8px; border-radius: 999px;
                    font-size: 11.5px; font-weight: 700;
                }
                .li-disclaimer {
                    display: flex; gap: 8px; align-items: flex-start;
                    margin-bottom: 14px; padding: 10px 13px;
                    text-align: left;
                    background: var(--muted, #f8fafc);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 10px;
                    font-size: 12.5px; line-height: 1.55; color: var(--text-muted, #475569);
                }

                .li-table tbody tr:hover { background: var(--muted, #f5f7fb); transition: background 0.15s; }
                .li-intervention-name { font-weight: 600; font-size: 15px; }

                .li-domain-chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 12.5px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .li-rf-tag {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    margin: 2px 2px 2px 0;
                    background: var(--muted, #f5f7fb);
                    border: 1px solid var(--border, #e5e7eb);
                    color: var(--text-muted, #475569);
                }

                .li-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
                .li-legend-item { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--text-muted, #475569); }
                .li-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

                .li-empty {
                    padding: 48px 16px;
                    text-align: center;
                    color: var(--text-muted, #475569);
                    font-size: 14px;
                }

                .li-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    border-radius: 10px;
                    background: var(--brand, #0ea5a8);
                    color: #fff;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 0 5px;
                    margin-left: 6px;
                }


                @media (prefers-reduced-motion: reduce) {
                    .li-table tbody tr { transition: none; }
                }
            `}</style>

            <div className="container-fluid li-page">

                <div className="li-header">
                    <h1>LIP2</h1>
                    <p>Pilot-specific analyses and integrated summaries.</p>
                </div>

                <div className="row g-3">

                    {/* ── Left sidebar ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="li-sidebar-card">
                            <label className="filter-label" htmlFor="li-intervention-select">Intervention</label>
                            <select
                                id="li-intervention-select"
                                className="form-select"
                                value={selectedIntervention}
                                onChange={(e) => handleInterventionChange(e.target.value)}
                            >
                                <option value="">All Interventions</option>
                                {interventionsData.map((item, idx) => (
                                    <option key={idx} value={item.name}>
                                        {item.name} ({item.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="li-sidebar-card">
                            <label className="filter-label" htmlFor="li-rf-select">Risk Factor</label>
                            <select
                                id="li-rf-select"
                                className="form-select"
                                value={selectedRiskFactor}
                                onChange={(e) => setSelectedRiskFactor(e.target.value)}
                            >
                                <option value="">All Risk Factors</option>
                                {riskFactors.map((rf, idx) => {
                                    const available = availableRiskFactors.includes(rf);
                                    return (
                                        <option key={idx} value={rf} disabled={!available}
                                            style={{ color: available ? undefined : "#9ca3af" }}>
                                            {rf}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                    </div>

                    {/* ── Center: table ── */}
                    <div className="col-xl-8 col-lg-6">
                        <div className="li-disclaimer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <span>
                                Results shown are drawn from the LiP-02 piloted interventions. Interventions marked
                                &ldquo;No results reported&rdquo; were not implemented during the pilot. Hover an intervention
                                name to see its description, and expand a row to view the full recommendations,
                                mapped population clusters, barriers and facilitators.
                            </span>
                        </div>

                        <div className="li-table-wrapper">
                            {filteredData.length === 0 ? (
                                <div className="li-empty">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginBottom: 10, opacity: 0.4 }} aria-hidden="true">
                                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                    <div>No interventions match the selected filters.</div>
                                </div>
                            ) : (
                                <table className="li-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                Intervention
                                                <span className="li-count-badge">{filteredData.length}</span>
                                            </th>
                                            <th>Domain</th>
                                            <th>Related Risk Factors</th>
                                            <th>Effectiveness</th>
                                            <th>Relevant Recommendations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((row) => {
                                            const meta = domainMeta[row.category] ?? { bg: "#f3f4f6", color: "#374151" };
                                            const rowKey = `${row.name}-${row.category}`;
                                            const isOpen = expandedRow === rowKey;
                                            const recCount = row.recommendations?.length ?? 0;
                                            return (
                                                <Fragment key={rowKey}>
                                                <tr>
                                                    <td style={{ minWidth: 200 }}>
                                                        <span
                                                            className={`li-intervention-name${row.details ? " li-name-hint" : ""}`}
                                                            title={row.details || undefined}
                                                        >
                                                            {row.name}
                                                        </span>
                                                    </td>
                                                    <td style={{ whiteSpace: "nowrap" }}>
                                                        <span
                                                            className="li-domain-chip"
                                                            style={{ background: meta.bg, color: meta.color }}
                                                        >
                                                            {row.category}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {row.riskFactors.map((rf, i) => (
                                                            <span key={i} className="li-rf-tag">{rf}</span>
                                                        ))}
                                                    </td>
                                                    <td style={{ minWidth: 220 }}>
                                                        {row.reach
                                                            ? <span className="li-reach">{row.reach}</span>
                                                            : <span className="li-nores">No results reported</span>}
                                                    </td>
                                                    <td style={{ whiteSpace: "nowrap" }}>
                                                        {recCount > 0 ? (
                                                            <button
                                                                className="li-expand-btn"
                                                                onClick={() => setExpandedRow(isOpen ? null : rowKey)}
                                                                aria-expanded={isOpen}
                                                            >
                                                                {recCount} recommendation{recCount === 1 ? "" : "s"}
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: isOpen ? "rotate(180deg)" : undefined }}>
                                                                    <polyline points="6 9 12 15 18 9"/>
                                                                </svg>
                                                            </button>
                                                        ) : (
                                                            <span className="li-nores">&mdash;</span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {isOpen && (
                                                    <tr>
                                                        <td className="li-detail-cell" colSpan={5}>
                                                            <div className="li-detail-grid">
                                                                <div className="li-detail-block li-detail-wide">
                                                                    <h4>Recommendations generated</h4>
                                                                    <ul>
                                                                        {row.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                                                                    </ul>
                                                                </div>
                                                                {row.diagnostic && (
                                                                    <div className="li-detail-block li-detail-wide">
                                                                        <h4>Key diagnostic</h4>
                                                                        <p>{row.diagnostic}</p>
                                                                    </div>
                                                                )}
                                                                {!!row.targetedGroups?.length && (
                                                                    <div className="li-detail-block">
                                                                        <h4>Targeted groups</h4>
                                                                        <p>{row.targetedGroups.join(", ")}</p>
                                                                    </div>
                                                                )}
                                                                {row.owner && (
                                                                    <div className="li-detail-block">
                                                                        <h4>Owner</h4>
                                                                        <p>{row.owner}</p>
                                                                    </div>
                                                                )}
                                                                {row.inequalities && (
                                                                    <div className="li-detail-block">
                                                                        <h4>Identified inequalities</h4>
                                                                        <p>
                                                                            <span
                                                                                className="li-ineq-chip"
                                                                                style={row.inequalities.toUpperCase() === "YES"
                                                                                    ? { background: "#fee2e2", color: "#991b1b" }
                                                                                    : { background: "#dcfce7", color: "#166534" }}
                                                                            >
                                                                                {row.inequalities.toUpperCase()}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {!!row.clusters?.length && (
                                                                    <div className="li-detail-block li-detail-wide">
                                                                        <h4>Mapped population clusters</h4>
                                                                        <ul>
                                                                            {row.clusters.map((c, i) => <li key={i}>{c}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {!!row.behaviouralBarriers?.length && (
                                                                    <div className="li-detail-block">
                                                                        <h4>Behavioural barriers</h4>
                                                                        <ul>
                                                                            {row.behaviouralBarriers.map((b, i) => <li key={i}>{b}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {!!row.structuralBarriers?.length && (
                                                                    <div className="li-detail-block">
                                                                        <h4>Structural barriers</h4>
                                                                        <ul>
                                                                            {row.structuralBarriers.map((b, i) => <li key={i}>{b}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {!!row.facilitators?.length && (
                                                                    <div className="li-detail-block">
                                                                        <h4>Facilitators</h4>
                                                                        <ul>
                                                                            {row.facilitators.map((f, i) => <li key={i}>{f}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* ── Right: accordion + comments ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div style={{ marginBottom: "16px" }}>
                            <Accordion defaultActiveKey="-1" className="app-accordion">
                                {accordionContent_dictLst.map((item, idx) => (
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
        </>
    );
};

export default LargeScaleIntervention;
