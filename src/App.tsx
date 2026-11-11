import { SparkFlow } from './components/SparkFlow';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import { LanguageModal } from './components/LanguageModal';

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="App" style={{ width: '100vw', height: '100vh', display: 'flex' }}>
          <SparkFlow />
          <LanguageModal />
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
