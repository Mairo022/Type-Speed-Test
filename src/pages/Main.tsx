import TypingTest from "../components/TypingTest";
import Leaderboard from "../components/Leaderboard";
import { useState } from "react";

function MainPage() {
    const [state, setState] = useState(true)

    function triggerUpdate() {
        setState(state => !state)
    }

    return (
        <>
            <TypingTest triggerUpdate={ triggerUpdate }/>
            <Leaderboard state={ state }/>
        </>
    )
}

export default MainPage