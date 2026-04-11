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
import Images from "./pages/Images";
import Videos from "./pages/Videos";
import Questions from "./pages/Questions";
import EventsCalendar from "./pages/EventsCalendar";
import PressReleases from "./pages/PressReleases";
import Recommendations from "./pages/Recommendations";
import Articles from "./pages/Articles";

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
    case 'images':
      return <Images id={id} url={url} type="images"/>;
    case 'videos':
      return <Videos id={id} url={url} type="videos"/>;
    case 'questions':
      return <Questions id={id} url={url} type="questions"/>;
    case 'events':
      return <EventsCalendar id={id} url={url} type="events" />;
    case 'press-releases':
      return <PressReleases id={id} url={url} type="press-releases" />;
    case 'recommendations':
      return <Recommendations id={id} url={url} type="recommendations" />;
    case 'articles':
      return <Articles id={id} url={url} type="articles" />;
    default:
      return <DefaultView id={id}/>;
  }
}

export default App;

