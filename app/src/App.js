import React from 'react';
import BillAndLegislations from "./pages/BillsAndLegislations";
import DefaultView  from "./pages/DefaultView";
import NoticePapers from "./pages/NoticePapers";
import Hansards from "./pages/Hansards";
import Meetings from "./pages/Meetings";

function App({ view, id }) {
  switch(view) {
    case 'bills':
      return <BillAndLegislations id={id} />;
    case 'notice-papers':
      return <NoticePapers id={id} />;
    case 'hansards':
      return <Hansards id={id} />;
    case 'meetings':
      return <Meetings id={id} />;
    default:
      return <DefaultView id={id} />;
  }
}

export default App;

