import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MainScreen from './components/MainScreen/MainScreen';
import ScheduleEditor from './components/ScheduleEditor/ScheduleEditor';
import DatabaseManager from './components/DatabaseManager/DatabaseManager';

const App = () => {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<MainScreen />} />
                <Route path="/schedule" element={<ScheduleEditor />} />
                <Route path="/database" element={<DatabaseManager />} />
            </Routes>
        </MainLayout>
    );
};

export default App;