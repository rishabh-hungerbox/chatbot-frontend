import './App.css';
import { ChatbotApp } from './chatbot/ChatbotApp';
import { ToastProvider } from './chatbot/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <ChatbotApp />
    </ToastProvider>
  );
}

export default App;
