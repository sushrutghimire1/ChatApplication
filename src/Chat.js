import React, { useState, useEffect } from 'react';
import { usePubNub } from 'pubnub-react';

function Chat(props) {
    const pubnub = usePubNub();
    pubnub.setUUID(props.id)
    const [channels] = useState(['awesome-channel']);
    const [messages, addMessage] = useState([]);
    const [liveIds, addLiveId] = useState([]);
    const [message, setMessage] = useState('');
    const [historyCount, incrementHistoryCount] = useState(3);
  
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
  
    function deleteMessages(){
      pubnub.deleteMessages(
        {
            channel: 'awesome-channel',
            start: "16176138893975680",
            end: "16176461584677548",
        },
        (result) => {
            console.log(result);
        }
    );
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
  
    const getHistoryOnClick=count=>{
      clearMessages();
      pubnub.history({
        channel: 'awesome-channel',
        count: count,
      },
      (status, response) => {
        console.log(response);
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
      refreshLiveUsers();
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
          <div style={headerStyles}>Chat App</div>
          <button
              style={historyStyles}
              onClick={e => {
                e.preventDefault();
                incrementHistoryCount(count=>count+3);
                console.log('IT is 0')
                getHistoryOnClick(historyCount);
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
              Send
            </button>
            </div>
            <div>
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
        <div style={chatLiveStyles}>
        {/* <RenderList/> */}
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
    background: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
  };
  
  const footerStyles = {
    display: 'flex'
  };
  
  const chatStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
    width: '65%',
    marginLeft: '10vh',
  };
  
  const chatLiveStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
    width: '35%',
    marginRight: '10vh',
  };
  
  const headerStyles = {
    background: '#E51058',
    color: 'white',
    fontSize: '1.4rem',
    padding: '10px 15px',
  };
  
  const listStyles = {
    alignItems: 'flex-start',
    background: '#D3D3D3',
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
    backgroundColor: '#FFFFFF',
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
  
  
  
  const inputStyles = {
    flexGrow: 1,
    fontSize: '1.1rem',
    padding: '10px 15px',
    //  width: '160%',
  };
  
  const buttonStyles = {
    fontSize: '1.1rem',
    padding: '10px 15px',
    width: '20%',
  };
  
  
  const refreshStyles = {
    fontSize: '1.1rem',
    padding: '10px 15px',
    backgroundColor:'#0ef20e',
  };
  
  const unsubscribeButtonStyles = {
    fontSize: '1.1rem',
    padding: '10px 15px',
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

  export default Chat;