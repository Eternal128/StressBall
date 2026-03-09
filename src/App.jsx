import { useState } from "react";
import Navbar from "./components/Navbar";
import HugHero from "./components/HugHero";

export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <div
      style={{
        background: dark ? "#12100e" : "#faf8f4",
        transition: "background 0.4s",
      }}
    >
      <Navbar dark={dark} toggleDark={() => setDark((d) => !d)} />
      <HugHero dark={dark} />
    </div>
  );
}
