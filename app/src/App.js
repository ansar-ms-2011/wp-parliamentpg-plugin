import React from 'react';
import BillAndLegislations from "./pages/BillsAndLegislations";
import DefaultView  from "./pages/DefaultView";
import NoticePapers from "./pages/NoticePapers";
import Hansards from "./pages/Hansards";
import Meetings from "./pages/Meetings";
import Members from "./pages/Members";
import Governors from "./pages/Governors";
import Districts from "./pages/Districts";
import Provinces from "./pages/Provinces";

function App({ view, id, url }) {
  switch(view) {
    case 'bills':
      return <BillAndLegislations id={id} url={url} type="bills" />;
    case 'notice-papers':
      return <NoticePapers id={id} url={url} type="notice-papers"/>;
    case 'hansards':
      return <Hansards id={id} url={url} type="hansards"/>;
    case 'meetings':
      return <Meetings id={id} url={url} type="meetings"/>;
    case 'members':
      return <Members id={id} url={url} type="members"/>;
    case 'governors':
      return <Governors id={id} url={url} type="governors"/>;
    case 'provinces':
      return <Provinces id={id} url={url} type="provinces"/>;
    case 'districts':
      return <Districts id={id} url={url} type="districts"/>;
    default:
      return <DefaultView id={id} />;
  }
}

export default App;

