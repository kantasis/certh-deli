import { useState } from "react";

function TabbedList(){
   // <!-- Tabbed List Reference -->
   // <!-- https://getbootstrap.com/docs/5.0/components/navs-tabs/#javascript-behavior -->

   const tabInfo_dictLst = [
      {
         id: "geomap",
         label_str: "Geomap",
         url: "http://160.40.53.35:3000/d-solo/fdhlxt13jf0n4a/test-dashboard?orgId=1&from=1712302245732&to=1712323845732&theme=light&panelId=4",
      },
      {
         id: "barchart",
         label_str: "Barchart",
         url: "http://160.40.53.35:3000/d-solo/fdhlxt13jf0n4a/test-dashboard?orgId=1&from=1712279409614&to=1712301009614&theme=light&panelId=2",
      },
      {
         id: "spiderplot",
         label_str: "Spiderplot",
         url: "http://160.40.53.35:3000/d-solo/fdhlxt13jf0n4a/test-dashboard?orgId=1&from=1712117229542&to=1712138829542&theme=light&panelId=1",
      },
   ];

   const [selected_idx, setSelectedIdx] = useState(0);

   const tabs_jsx = tabInfo_dictLst.map((tabInfo_dict, index) => (
         <li 
         className="nav-item"
         role="presentation"
         onClick={(event)=> setSelectedIdx(index) }
         key={"tabs_jsx"+index}
      >
         <button 
            className={ "nav-link" + (index === selected_idx ? " active" : "") }
            id={tabInfo_dict['id']+"-tab" }
            data-bs-toggle="tab" 
            data-bs-target={"#"+tabInfo_dict['id']}
            type="button" 
            role="tab" 
            aria-controls={tabInfo_dict['id']} 
            aria-selected={ index === selected_idx ? "true" : "false" }
            
         >
            {tabInfo_dict['label_str']}
         </button>
      </li>
   ));

   const tabContents_jsx = tabInfo_dictLst.map((tabInfo_dict, index) => (
      <div 
         className={ "tab-pane fade show" + (index === selected_idx ? " active" : "")}
         id={tabInfo_dict['id']} 
         role="tabpanel" 
         aria-labelledby={tabInfo_dict['id'] + "-tab"}
         key={"tabContents_jsx"+index}
      >
         <div className="embed-responsive embed-responsive-16by9">
            <iframe 
               className="embed-responsive-item"
               src={tabInfo_dict['url']}
               width="800"
               height="600"
            >
            </iframe>
         </div>
      </div>
   ));


   return (
      <div className="main">
         <ul 
            className="nav nav-tabs" 
            id="tabs1"
            role="tablist"
         >
            {tabs_jsx}
         </ul>
         <div 
            className="tab-content" 
            id="myTabContent"
         >
         {tabContents_jsx}
         </div>
      </div>
   );
}

export default TabbedList;