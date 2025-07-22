import React from 'react';
import ProductList from './components/Sbisavings.jsx';
import FDList from './components/SBiFd.jsx';
import {Route,Routes} from "react-router-dom"
import TaxSaverFDList from './components/SBITaxSaverFD.jsx';
import RDList from './components/SBIRD.jsx';
import PPFList from './components/SBIPPF.jsx';
import NPSList from './components/SBINPS.JSX';
import UnnatiCardList from './components/SBIUnnatiCard.jsx';
import KotakProductList from './components/Kotaksavings.jsx';
import SimplySaveCardList from './components/SBISimplySave.jsx';
import HDFCSavings from './components/HDFCSavings.jsx';
import HDFCDigiSavings from './components/DigiSaveHDFC.jsx';
import HDFCMaxSavings from './components/MaxSaveHDFC.jsx';
import HDFCFD from './components/FDHDFC.jsx';
import ICICISavings from './components/ICICISavings.jsx';
import ICICIBasicSavings from './components/BasicSavingsICICI.jsx';
import ICICIYoungSavings from './components/YoungStars.jsx';
import ICICIFD from './components/ICICIFD.jsx';
import ICICIRD from './components/ICICIRD.JSX';

function App() {
  return (
    <div className="App">
      <Routes>
          <Route path="/fd" element={<FDList/>} />
          <Route path="/" element={<ProductList/>} />
          <Route path="/taxsaverfd" element={<TaxSaverFDList/>} />
          <Route path="/rd" element={<RDList/>} />
          <Route path="/ppf" element={<PPFList/>} />
          <Route path="/nps" element={<NPSList/>} />
          <Route path="/unnaticard" element={<UnnatiCardList/>} />
          <Route path="/simplysave" element={<SimplySaveCardList/>} />
          <Route path="/kotaksavings" element={<KotakProductList/>} />
          <Route path="/hdfcsavings" element={<HDFCSavings/>} />
          <Route path="/hdfcdigisavings" element={<HDFCDigiSavings/>} />
          <Route path="/hdfcmaxsavings" element={<HDFCMaxSavings/>} />
          <Route path="/hdfcfd" element={<HDFCFD/>} />
          <Route path="/icicisavings" element={<ICICISavings/>} />
          <Route path="/icicibasicsavings" element={<ICICIBasicSavings/>} />
          <Route path="/iciciyoungsavings" element={<ICICIYoungSavings/>} />
          <Route path="/icicifd" element={<ICICIFD/>} />
          <Route path="/icicird" element={<ICICIRD/>} />

        </Routes>
    </div>
  );
}

export default App;
