import React from 'react';
import BillAndLegislations from "./pages/BillsAndLegislations";
import DefaultView  from "./pages/DefaultView";

function App({ view, id }) {
  switch(view) {
    case 'bills':
      return <BillAndLegislations id={id} />;
    default:
      return <DefaultView id={id} />;
  }
}

export default App;

