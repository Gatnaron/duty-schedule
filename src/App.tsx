import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MainScreen from './components/MainScreen/MainScreen';
import ScheduleEditor from './components/ScheduleEditor/ScheduleEditor';
import DatabaseManager from './components/DatabaseManager/DatabaseManager';
import SchedulePage from './components/SchedulePage/SchedulePage';
import StatisticsPage from './components/StatisticsPage/StatisticsPage';

const App = () => {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<MainScreen />} />
                <Route path="/schedule" element={<ScheduleEditor />} />
                <Route path="/database" element={<DatabaseManager />} />
                <Route path="/graph" element={<SchedulePage />} />
                <Route path="/stats" element={<StatisticsPage />} />
            </Routes>
        </MainLayout>
    );
};

export default App;