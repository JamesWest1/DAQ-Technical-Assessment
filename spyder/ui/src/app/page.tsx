"use client"

import { useState, useEffect } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer } from "lucide-react"
import Numeric from "../components/custom/numeric"
import RedbackLogoDarkMode from "../../public/logo-darkmode.svg"
import RedbackLogoLightMode from "../../public/logo-lightmode.svg"
import MyChart from './chart'

const WS_URL = "ws://localhost:8080"

interface VehicleData {
  battery_temperature: number
  timestamp: number
  errorMsg: string
}


/**
 * Page component that displays DAQ technical assessment. Contains the LiveValue component as well as page header and labels.
 * Could this be split into more components?...
 *
 * @returns {JSX.Element} The rendered page component.
 */
export default function Page(): JSX.Element {
  const { setTheme } = useTheme()
  const [temperature, setTemperature] = useState<any>(0)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [times, setTimes] = useState<number[]>([]);
  const [temps, setTemps] = useState<number[]>([]);
  const [redbackLogo, setLogo] = useState(RedbackLogoDarkMode)
  const [myTheme, changeMyTheme] = useState<string>("dark");
  const [firstTimeStamp, setFirstTimeStamp] = useState<number>(-1);
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const { lastJsonMessage, readyState }: { lastJsonMessage: VehicleData | null; readyState: ReadyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  /**
   * Effect hook to handle WebSocket connection state changes.
   */
  useEffect(() => {
    switch (readyState) {
      case ReadyState.OPEN:
        console.log("Connected to streaming service")
        setConnectionStatus("Connected")
        break
      case ReadyState.CLOSED:
        console.log("Disconnected from streaming service")
        setConnectionStatus("Disconnected")
        break
      case ReadyState.CONNECTING:
        setConnectionStatus("Connecting")
        break
      default:
        setConnectionStatus("Disconnected")
        break
    }
  }, [readyState])

  /**
   * Effect hook to handle incoming WebSocket messages.
   */
  useEffect(() => {
    console.log("Received: ", lastJsonMessage)
    if (lastJsonMessage === null) {
      return
    }
    if (firstTimeStamp === -1) setTimes([0]);
    else setTimes([...times, lastJsonMessage.timestamp - firstTimeStamp]);
    if (firstTimeStamp === -1) setFirstTimeStamp(lastJsonMessage.timestamp);
    setTemperature(lastJsonMessage.battery_temperature)
    setErrorMessage(lastJsonMessage.errorMsg)
    setTemps([...temps, lastJsonMessage.battery_temperature])
  }, [lastJsonMessage])

  /**
   * Effect hook to set the theme to dark mode.
   */
  useEffect(() => {
    setTheme(myTheme)
    if (myTheme === 'dark') setLogo(RedbackLogoDarkMode);
    else setLogo(RedbackLogoLightMode);
  }, [myTheme])



  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 h-20 flex items-center gap-5 border-b">
        <Image
          src={redbackLogo}
          className="h-12 w-auto"
          alt="Redback Racing Logo"
        />
        <button onClick={() => {
          myTheme === 'dark' ? changeMyTheme('light') : changeMyTheme('dark');
          }}>
          Toggle Theme
        </button>
        <h1 className="text-foreground text-xl font-semibold">DAQ Technical Assessment</h1>
        <Badge variant={connectionStatus === "Connected" ? "success" : "destructive"} className="ml-auto">
          {connectionStatus}
        </Badge>
      </header>
      <main className="flex-grow flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-light flex items-center gap-2">
              <Thermometer className="h-6 w-6" />
              Live Battery Temperature
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Numeric temp={temperature.toFixed(3)} />
          </CardContent>
          <CardContent className="flex items-center justify-center">
            {errorMessage !== "" && <p style={{color:"red"}}>Error: {errorMessage}</p>}
          </CardContent>
        </Card>
        <MyChart x={times} y={temps} ></MyChart>
      </main>
    </div>
  )
}
