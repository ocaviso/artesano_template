import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// URL para onde o cliente será enviado se tentar acessar o site após a compra
const REDIRECT_URL = 'https://www.google.com.br'; 

export function RedirectHandler() {
  const location = useLocation();

  useEffect(() => {
    // Verifica se a marcação existe no navegador
    const hasPurchased = localStorage.getItem('@SmashFast:purchase-complete');

    // Se já comprou, redireciona imediatamente, não importa a página atual
    if (hasPurchased) {
      window.location.href = REDIRECT_URL;
    }
  }, [location]);

  return null;
}