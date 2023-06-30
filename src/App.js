import './App.css';
import WalletProvider from './components/WalletProvider.jsx';
import Page from './components/Page.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <WalletProvider>
          <Page />
        </WalletProvider>
      </header>
    </div>
  );
}

export default App;
