import LandningPage from './components/LandingPage'
import TopDownScene from './components/TopDownScene'
import DownToUp from './components/DownToUp';
import CockpitScene from './components/CockpitScene';
import {motion} from 'motion/react'

export default function App() {

    return (
        <div className="w-full relative">
            {/* <motion.div
                className={`z-50 fixed inset-0 w-full h-full bg-white flex flex-col justify-center items-center`}
                animate={{y:-1000}}
                transition={{delay:3,duration:3}}
                >
                <img src="/jetSVG.svg" alt="" className='w-40 object-contain'/>
                <div className="w-80 h-2 border border-black">
                    <motion.div className='w-full bg-black h-full rounded-2xl' initial={{width:0}} animate={{width:"100%"}} transition={{duration:2.5}} />
                </div>
            </motion.div> */}
            <LandningPage/>
            <TopDownScene/>
            <DownToUp/>
            <CockpitScene/>
            
        </div>
    );
};