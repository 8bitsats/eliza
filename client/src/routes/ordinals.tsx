import { useEffect } from "react";
import { OrdinalsProvider } from "../components/ordinals/OrdinalsContext";
import { OrdinalsInterface } from "../components/ordinals/OrdinalsInterface";

function Ordinals() {
  useEffect(() => {
    document.title = "Ordinals - ElizaOS";
  }, []);

  return (
    <OrdinalsProvider>
      <div className="w-full h-full flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Bitcoin Ordinals Interface</h1>
        <OrdinalsInterface />
      </div>
    </OrdinalsProvider>
  );
}

export default Ordinals;
