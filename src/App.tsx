import './App.css';
import { ChatbotApp } from './chatbot/ChatbotApp';
import { ToastProvider } from './chatbot/components';

function App() {
  return (
    <ToastProvider>
      <ChatbotApp />
    </ToastProvider>
  );
}

export default App;
