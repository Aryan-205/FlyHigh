import LandningPage from './components/LandingPage'
import TopDownScene from './components/TopDownScene'
import DownToUp from './components/DownToUp';
import CockpitScene from './components/CockpitScene';

export default function App() {

    return (
        <div className="w-full">
            <LandningPage/>
            <TopDownScene/>
            <DownToUp/>
            <CockpitScene/>
        </div>
    );
};