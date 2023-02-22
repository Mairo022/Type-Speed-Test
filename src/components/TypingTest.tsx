import React, { memo, useEffect, useRef, useState } from "react";
import textFile from "../assets/text.txt";
import { IResult, ITypingStats, ITypingTest, IWordState } from "../types";

function TypingTest(props: ITypingTest): JSX.Element {
    const triggerUpdate = props.triggerUpdate
    const [text, setText] = useState<Array<string>>()
    const [textJSX, setTextJSX] = useState<JSX.Element[]>()

    const [words, setWords] = useState<Array<string>>()
    const [wordState, setWordState] = useState<IWordState[]>()
    const [wordPos, setWordPos] = useState(0)
    const [charPos, setCharPos] = useState(0)

    const [input, setInput] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const time = 60
    const [timer, setTimer] = useState(time)
    const [appRunning, setAppRunning] = useState(false)
    const [typingStats, setTypingStats] = useState<ITypingStats>({
        speed: 0,
        accuracy: 0,
        correctWords: 0,
        totalWords: 0
    })

    const timeString = new Date(timer * 1000)
        .toLocaleTimeString("default", {
            minute: "2-digit",
            second: "2-digit"
        })

    function handleTyping(key: React.KeyboardEvent) {
        const supportKeys = ["Enter", "CapsLock", "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight"]
        const charKeys = new RegExp(/^[\w\s!.,?:;'"\-/@&{}()[\]\d]$/)

        if (!words) return
        if (key.key === "Backspace" && charPos === 0) return
        if (key.key !== "Backspace" && !key.key.match(charKeys) || supportKeys.includes(key.key)) return

        if (key.key === "Backspace" && charPos !== 0) {
            setWordState(wordState => {
                return wordState!.map((char, i) => {
                    if (i === charPos - 1) {
                        return {...char, status: ""}
                    }
                    return {...char}
                })
            })

            setCharPos(position => position - 1)

            return
        }

        setWordState(wordState => {
            return wordState!.map((char, i) => {
                if (i === charPos) {
                    return key.key === char.key ? {...char, status: "correct"} : {...char, status: "incorrect"}
                }
                return {...char}
            })
        })

        if (charPos === words[wordPos].length - 1) {
            setWordPos(position => position + 1)
            setCharPos(0)
            setInput("")
        } else {
            setCharPos(position => position + 1)
        }
    }

    function removeWorstScore(arr: IResult[]): IResult[] {
        let worstIndex = 0
        let worstSpeed = arr[0].speed
        let worstAccuracy = arr[0].accuracy

        arr.forEach((result, index) => {
            if (result.speed === worstSpeed && result.accuracy <= worstAccuracy) {
                worstIndex = index
                worstSpeed = result.speed
                worstAccuracy = result.accuracy
            }

            if (result.speed < worstSpeed) {
                worstIndex = index
                worstSpeed = result.speed
                worstAccuracy = result.accuracy
            }
        })

        return arr.filter((result, index) => index !== worstIndex)
    }

    function sortToHighestScore(arr: IResult[]): IResult[] {
        return arr.sort((a, b) => {
            if (a.speed > b.speed) {
                return -1
            }
            return 1
        })

    }

    function shuffleArray(array: Array<any>): Array<any> {
        for (let i = array.length - 1; i >= 0; i--) {
            const randomIndex: number = Math.floor(Math.random() * (i + 1));
            array.push(array[randomIndex]);
            array.splice(randomIndex, 1);
        }
        return array;
    }

    function handleText(text: Array<string>) {
        if (!text) return

        const regexWord = new RegExp(/(?<=\s|^[\w.,]+(?:[\s.!,]|['][\w.]+\s))/)
        const shuffledText = shuffleArray(text).join("")

        const words: Array<string> = shuffledText.split(regexWord)

        const wordState: IWordState[] = words[wordPos]
            .split("")
            .map(char => {
                return { key: char, status: "" }
            })

        setWords(words)
        setWordState(wordState)
    }

    function saveResult() {
        if (typingStats.totalWords === 0) return

        const localStorageData = localStorage.getItem("results")
        const currentResults: IResult[] = [{
            date: new Date().toLocaleDateString("default", {
                month: "numeric",
                day: "numeric",
                year: "numeric"
            }),
            speed: typingStats.speed,
            accuracy: typingStats.accuracy,
        }]

        if (localStorageData) {
            const previousResults: IResult[] = JSON.parse(localStorageData)
            const allResults = [...currentResults, ...previousResults]
            const results = allResults.length > 10 ? sortToHighestScore(removeWorstScore(allResults)) : sortToHighestScore(allResults)

            localStorage.setItem("results", JSON.stringify(results))
            return
        }
        localStorage.setItem("results", JSON.stringify(currentResults))
    }

    // Load and set text
    useEffect(() => {
        const abortController = new AbortController()

        fetch(textFile, abortController)
            .then(file => file.text())
            .then(text => {
                if (text === "") return

                const regexSentence = new RegExp(/(?<=[^A-Z].[.?!] +)(?=[A-Z])/)
                const sentences: Array<string> = text.split(regexSentence)
                handleText(sentences)
                setText(sentences)
            })
            .catch(() => { console.log("error fetching") })

        return () => { abortController.abort() }
    }, [])

    // Render text
    useEffect(() => {
        if (words && wordState)
            setTextJSX(() =>
                words.map((word, i) => {
                    const displayWord = i >= wordPos

                    const charsJSX = () =>
                        wordState.map((char, j) =>
                                <span
                                    className={`text__word__char text__word__char${"--" + char.status }`}
                                    key={100000 + j}
                                >
                                    { char.key }
                                </span>
                        )

                    return (
                        <span className="text__word" key={i} style={{ display: displayWord ? "initial" : "none" }}>
                            { i === wordPos ?  charsJSX() : word }
                        </span>
                    )
                })
            )
    }, [wordState, words])

    // Handle app state
    useEffect(() => {
        let localTime = time
        let interval: number

        setTimer(time)
        setInput("")
        setCharPos(0)
        setWordPos(0)

        if (appRunning && words && text) {
            setTypingStats({
                speed: 0,
                accuracy: 0,
                correctWords: 0,
                totalWords: 0
            })

            interval = setInterval(() => {
                localTime -= 1
                setTimer(localTime)

                if (localTime === 0) {
                    setAppRunning(false)
                    triggerUpdate()
                    clearInterval(interval)
                }
            }, 1000)

            inputRef.current?.focus()
            handleText(text)
        }

        return () => {
            clearInterval(interval)
        }
    }, [appRunning])

    // Do typing stats
    useEffect(() => {
        if (wordState && appRunning) {
            const isIncorrect = wordState.some(char => char.status === "incorrect")

            if (!isIncorrect) {
                setTypingStats(stats => {
                    return {
                        speed: stats.speed + 1,
                        accuracy: Math.round((stats.correctWords + 1) / (stats.totalWords + 1) * 100),
                        correctWords: stats.correctWords + 1,
                        totalWords: stats.totalWords + 1
                    }
                })
            }

            if (isIncorrect) {
                setTypingStats(stats => {
                    return {
                        ...stats,
                        accuracy: Math.round(stats.correctWords / (stats.totalWords + 1) * 100),
                        totalWords: stats.totalWords + 1
                    }
                })
            }
        }
    }, [wordPos])

    // Change word state
    useEffect(() => {
        if (words) {
            const wordState: IWordState[] = words[wordPos]
                .split("")
                .map(char => (
                    { key: char, status: "" })
                )
            setWordState(wordState)
        }
    }, [wordPos])

    // Save result
    useEffect(() => {
        let mounted = true

        if (!appRunning && timer === 0 && mounted) {
            saveResult()
        }

        return () => {
            mounted = false
        }
    }, [appRunning])

    return (
        <section className="Typing_test">
            <div className="text">{ textJSX }</div>
            <input className="input" type="text"
                   disabled={!appRunning}
                   ref={inputRef}
                   value={input}
                   onKeyDown={(e) => handleTyping(e)}
                   onChange={e => { setInput(e.target.value) }}
            />
            <div className="results">
                <p className="results__speed">Speed: {typingStats.speed} WPM</p>
                <p className="results__accuracy">Accuracy: {typingStats.accuracy}%</p>
            </div>
            <div className="time">{ timeString }</div>
            <button onClick={() => { setAppRunning(state => !state) }} className="start">
                { !appRunning ? "Start" : "Stop" }
            </button>
        </section>
    )
}

export default memo(TypingTest)
