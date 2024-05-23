import React, { ReactNode, useState } from "react";

interface Dashboard_Props{
   panel_id:string;
   panel_label: string;
   isActive_b: boolean;

   // This is a special prop that corresponds to the children of the element
   // children: ReactNode;
}

function DashboardTab ( {panel_id, panel_label, isActive_b}: Dashboard_Props ) {
// const DashboardTab: React.FC = ( data_dict: Dashboard_Props) => {

   // const data_dict = {
   //    panel_id: "geomap",
   //    panel_label: "Geo Map"
   // };

   const buttonId_str = `${panel_id}-tab`
   const buttonTarget_str = `#${panel_id}`
   const buttonControls_str = panel_id

   
   var buttonClass_str = "nav-link";
   buttonClass_str+= isActive_b?" active":"";

   var tabIndex_str=isActive_b?"tabindex='-1'":"";

   return (
      <li 
         className="nav-item"
         role="presentation"
      >
         <button 
            className={buttonClass_str}
            id={buttonId_str}
            data-bs-toggle="tab" 
            data-bs-target={buttonTarget_str}
            type="button" 
            role="tab" 
            aria-controls={buttonControls_str}
            aria-selected={isActive_b}
         >
            {panel_label}
         </button>
      </li>
   );
}

export default DashboardTab;
