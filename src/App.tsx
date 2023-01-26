import { Route, Routes } from "react-router-dom"
import './App.css'
import MainPage from "./pages/Main";

function App(): JSX.Element {
    return (
        <div className="App">
            <Routes>
                <Route path="*" element={ <MainPage/> }/>
            </Routes>
        </div>
    )
}

export default App