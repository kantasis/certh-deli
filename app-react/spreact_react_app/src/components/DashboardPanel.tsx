import React, { ReactNode } from "react";

interface Dashboard_Props{
   panel_id:string;
   panel_label: string;
   isActive_b: boolean;

   // This is a special prop that corresponds to the children of the element
   // children: ReactNode;
}

function DashboardTab ( {panel_id, panel_label, isActive_b}: Dashboard_Props) {
// const DashboardTab: React.FC = ( data_dict: Dashboard_Props) => {

   // const data_dict = {
   //    panel_id: "geomap",
   //    panel_label: "Geo Map"
   // };

   const ariaLabel_str = panel_id + "-tab"
   
   var divClass_str = "tab-pane fade";
   divClass_str += isActive_b?" show active":"";
   console.log(`Rendering: ${panel_id}`);
   return (
      <div 
         className={divClass_str}
         id={panel_id}
         role="tabpanel" 
         aria-labelledby={ariaLabel_str}
      >
         <div className="embed-responsive embed-responsive-16by9">
            {/* <iframe 
               className="embed-responsive-item"
               src="http://160.40.53.35:3000/d-solo/fdhlxt13jf0n4a/test-dashboard?orgId=1&from=1712117229542&to=1712138829542&theme=light&panelId=1"
               width="800"
               height="600"
            >
            </iframe> */}
            {panel_label}
         </div>
      </div>
   );
}

export default DashboardTab;
