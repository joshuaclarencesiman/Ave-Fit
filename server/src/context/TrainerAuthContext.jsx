import { createContext, useContext, useState, useEffect } from "react";

const TrainerAuthContext = createContext(null);

export function TrainerAuthProvider({ children }) {
  const [trainer, setTrainer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("avefit_trainer_token");
    const savedTrainer = localStorage.getItem("avefit_trainer");
    if (savedToken && savedTrainer) {
      setToken(savedToken);
      setTrainer(JSON.parse(savedTrainer));
    }
    setLoading(false);
  }, []);

  const loginTrainer = (trainerData, trainerToken) => {
    setTrainer(trainerData);
    setToken(trainerToken);
    sessionStorage.setItem("avefit_trainer_token", trainerToken);
    localStorage.setItem("avefit_trainer", JSON.stringify(trainerData));
  };

  const logoutTrainer = () => {
    setTrainer(null);
    setToken(null);
    sessionStorage.removeItem("avefit_trainer_token");
    localStorage.removeItem("avefit_trainer");
  };

  return (
    <TrainerAuthContext.Provider value={{ trainer, token, loading, loginTrainer, logoutTrainer }}>
      {children}
    </TrainerAuthContext.Provider>
  );
}

export const useTrainerAuth = () => useContext(TrainerAuthContext);
