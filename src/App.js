import { PubNubProvider} from 'pubnub-react';
import {useParams} from 'react-router';
import {pubnub} from './pubnub';
import Chat from './Chat';


function App() {
  const {id} = useParams();
  return (
    <PubNubProvider client={pubnub} >
      <Chat id={id} />
    </PubNubProvider>
  );
}

export default App;