// Declaração global para o TypeScript não reclamar do fbq
declare global {
    interface Window {
      fbq: any;
    }
  }
  
  const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

  export const pixel = {

    init: () => {
        // Lógica de inicialização se necessário, ou apenas deixe o fbq global
        // Geralmente o script base fica no index.html, mas podemos injetar o ID lá
        console.log("Pixel ID carregado:", PIXEL_ID);
     },
         
    // Rastreia visualização de página
    pageView: () => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
      }
    },
  
    // Rastreia início do checkout
    initiateCheckout: (data: { value: number; currency: string; num_items: number; content_ids: string[] }) => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', data);
      }
    },
  
    // Rastreia compra realizada
    purchase: (data: { value: number; currency: string; content_ids: string[]; content_type: string }) => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', data);
      }
    }
  };