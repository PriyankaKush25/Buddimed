import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "sk-sHSCRT_QZAFtb7TMSHsQ03d4l65B6a5pev6mi1BLgUT3BlbkFJjXzwND8mk1b2Drtf-vJs9_2kCFplz7rwHTsAdOm4EA";

const systemMessage = {
  "role": "system",
  "content": "You are BUDDIMED.SAY: Based on your symptoms, it seems like you might have [possible diagnosis]. Here's what you can do: [recommendations for self-care or further actions(suggest tests if needed)]. If you have any questions or need more assistance, feel free to ask!"
};
function App() {
  
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Buddimed! Ask me anything!",
      direction:"incoming",
      sender: "Buddimed"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      direction: 'outgoing',
      sender: "user"
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    console.log(messages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { 
    //reformatting the messages array
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "Buddimed") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });
    
    // Get the request body set up with the model we plan to use
    // Adding the system message
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }
      console.log(apiRequestBody)
      await fetch("https://api.openai.com/v1/chat/completions", 
        {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      
      return data.json();
    }).then((data) => {
      console.log(data)
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        direction:"incoming",
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    }).catch((err)=>{
      console.log(err)
    });
  }

  return (
    <div className="App">
      <div>
        <div className="description"></div>
        <div style={{ height: "550px", width: "800px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="BuddiMed is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
        </div>
      </div>
      
    </div>
  )
}

export default App