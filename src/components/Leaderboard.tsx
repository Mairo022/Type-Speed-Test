import { ILeaderboard, IResult } from "../types";
import { useEffect, useState } from "react";

function Leaderboard(props: ILeaderboard): JSX.Element {
    const [results, setResults] = useState<IResult[]>()
    const resultsJSX = results?.map((result, index) => {
        return (
            <div className="row" key={ index }>
                <span className="row__date date">{ result.date }</span>
                <span className="row__speed speed">{ result.speed } WPM</span>
                <span className="row__accuracy accuracy">{ result.accuracy }%</span>
            </div>
        )
    })

    useEffect(() => {
        setResults(JSON.parse(localStorage.getItem("results") as string))
    }, [props.state])

    return (
        results ?
            <section className="Leaderboard">
                <header className="header">
                    <h4 className="header__date date">Date</h4>
                    <h4 className="header__speed speed">Speed</h4>
                    <h4 className="header__accuracy accuracy">Accuracy</h4>
                </header>
                { resultsJSX }
            </section>
        : <></>
    )
}

export default Leaderboard