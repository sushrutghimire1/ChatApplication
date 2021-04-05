import React, { useState, useEffect } from 'react';
import PubNub from 'pubnub';
import { PubNubProvider, usePubNub } from 'pubnub-react';
import {useParams} from 'react-router';

const pubnub = new PubNub({
  publishKey: 'pub-c-ee4e7a3a-0694-499d-9d50-e1f63c38e8a2',
  subscribeKey: 'sub-c-d56ff88e-8d3b-11eb-968e-467c259650fa',
  secretKey: 'sec-c-ZDkxNTg2ZmYtZjUxOS00N2RlLWEyZGEtNjQzMDJmNjZiMTEy'
});

function App() {
  const {id} = useParams();
  return (
    <PubNubProvider client={pubnub}>
      <Chat id={id} />
    </PubNubProvider>
  );
}

function Chat(props) {
  const pubnub = usePubNub();
  pubnub.setUUID(props.id)
  const [channels] = useState(['awesome-channel']);
  const [messages, addMessage] = useState([]);
  const [liveIds, addLiveId] = useState([]);
  const [message, setMessage] = useState('');
  const [historyCount, incrementHistoryCount] = useState(0);

  const handleMessage = event => {
    const message = event.message;
    console.log(event.message)
    if (typeof message === 'string' || message.hasOwnProperty('text')) {
      const text = '('+message.userid+'): '+message.text|| message;
      addMessage(messages => [...messages, text]);
    }
  };

  function clearMessages() {
      addMessage([]);
  }

  
function hereNow(channels) {  
    pubnub.hereNow(
      {
        channels: channels,
        includeState: true,
      },
       (status, response) =>{
          setTimeout(function() {
            var occupants=response.channels["awesome-channel"].occupants;
            for(var i in occupants){
                addLiveId(liveIds=>[...liveIds,occupants[i].uuid]);
              }              
          }, 800);
    }
    ); 
  }
  
  const refreshLiveUsers = function () {
    addLiveId([]);
    hereNow(channels);
  }

  const globalUnsubscribe = function () {
    try {
      pubnub.unsubscribe({
        channels: ['awesome-channel']
      });
      pubnub.removeListener(handleMessage);
    } catch (err) {
      console.log("Failed to UnSub");
    }
  };


function getHistory() {  
  clearMessages();
  pubnub.history({
    channel: 'awesome-channel',
    count: 40,
  },
  (status, response) => {
    response.messages.map(message=>{
      const text = '('+message.entry.userid+'): '+message.entry.text|| message;
          addMessage(messages => [...messages, text]);
    })
  }
);
}

  const sendMessage = message => {
    console.log(props.id);
    if (message) {
      pubnub
        .publish({ channel: channels[0], message: { text : message, userid :props.id } })
        .then(() => setMessage(''));
  }
  };

  useEffect(() => {
    getHistory();
    if(props.id)
      pubnub.addListener({ message: handleMessage });
    pubnub.subscribe({ 
      channels, 
      withPresence: true
    });
  }, [pubnub, channels]);

  

  return (
    <React.Fragment>
    <div style={pageStyles}>
      <div style={chatStyles}>
        <div style={headerStyles}>Chat Example</div>
        <button
            style={historyStyles}
            onClick={e => {
              e.preventDefault();
              getHistory();
            }}
          >History</button>
        <div style={listStyles}>
          {
            messages.map((message, index) => {
            return (
              <div key={`message-${index}`} style={messageStyles}>
                {message}
              </div>
            );
          }
          )}
        </div>
        
        <div style={footerStyles}>
          <input
            type="text"
            style={inputStyles}
            placeholder="Type your message"
            value={message}
            onKeyPress={e => {
              if (e.key == 'Enter') 
              sendMessage(message);
              else
              return;
            }}
            onChange={e => setMessage(e.target.value)}
          />
          <button
            style={buttonStyles}
            onClick={e => {
              e.preventDefault();
              sendMessage(message);
            }}
          >
            Send Message
          </button>
          <button
            style={unsubscribeButtonStyles}
            onClick={e => {
              e.preventDefault();
              globalUnsubscribe();
            }}
          >Unsubscribe</button>
             <button
            style={refreshStyles}
            onClick={e => {
              e.preventDefault();
              refreshLiveUsers();
            }}
          >Refresh</button>
           <button
            style={clearStyles}
            onClick={e => {
              e.preventDefault();
              clearMessages();
            }}
          >Clear</button>
        </div>
      </div>
      <div style={chatStyles}>
      <div style={liveListStyles}>
        <div>
          <h2>Live Ids:</h2>
        </div>
          {liveIds.map((liveId, index) => {
            return (
              <div key={`id-${index}`} style={liveStyles}>
                {liveId}
              </div>
            );
          })}
        </div>
      </div>
    </div>
   
    </React.Fragment>
  );
}

const pageStyles = {
  alignItems: 'center',
  background: '#282c34',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '100vh',
};

const chatStyles = {
  display: 'flex',
  flexDirection: 'column',
  height: '80vh',
  width: '50%',
};

const headerStyles = {
  background: '#323742',
  color: 'white',
  fontSize: '1.4rem',
  padding: '10px 15px',
};

const listStyles = {
  alignItems: 'flex-start',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'auto',
  padding: '10px',
};

const liveListStyles = {
  alignItems: 'flex-start',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'auto',
  padding: '10px',
  border: '5px solid green'
};

const messageStyles = {
  backgroundColor: '#eee',
  borderRadius: '5px',
  color: '#333',
  fontSize: '1.1rem',
  margin: '5px',
  padding: '8px 15px',
};

const liveStyles = {
  backgroundColor: '#3fff00',
  borderRadius: '5px',
  color: '#333',
  fontSize: '1.1rem',
  margin: '5px',
  padding: '8px 15px',
};

const footerStyles = {
  display: 'flex',
};

const inputStyles = {
  flexGrow: 1,
  fontSize: '1.1rem',
  padding: '10px 15px',
};

const buttonStyles = {
  fontSize: '1.1rem',
  padding: '10px 15px',
};


const refreshStyles = {
  fontSize: '1.1rem',
  padding: '10px 15px',
  backgroundColor:'#0ef20e',
};

const unsubscribeButtonStyles = {
  fontSize: '1.1rem',
  padding: '0px 0px',
  backgroundColor:'#ff0000',
};

const historyStyles = {
  fontSize: '1.1rem',
  padding: '10px 15px',
  backgroundColor:'#00000',
};

const clearStyles = {
  fontSize: '1.1rem',
  padding: '10px 15px',
  backgroundColor:'#00023',
};


export default App;