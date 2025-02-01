import { Routes, Route } from 'react-router-dom';
import MainScreen from './components/MainScreen/MainScreen';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<MainScreen />} />
        </Routes>
    );
};

export default App;