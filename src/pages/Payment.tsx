import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PixPayment } from '@/components/PixPayment';
import { useCart } from '@/context/CartContext';
import { Order, PixPaymentData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { pixel } from '@/lib/pixel'; // Importe o utilitário

// Configuração do Proxy
const BACKEND_URL = "/api/backend";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    items, 
    total, 
    deliveryType, 
    deliveryAddress, 
    customerInfo,
    clearCart,
    setCurrentOrder,
    addOrder
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  
  // Controle de Polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActive = useRef(false);

  const deliveryFee = deliveryType === 'delivery' ? 5.90 : 0;
  const finalTotal = parseFloat((total + deliveryFee).toFixed(2));

  // --- CRIAÇÃO DO PIX ---
  const createPixCharge = async () => {
    if (pixData || loading) return;
    
    // Validação
    if (!customerInfo?.email || !customerInfo.name) {
      console.warn("Dados do cliente incompletos:", customerInfo);
      toast({ title: "Dados incompletos", description: "Nome e Email são obrigatórios.", variant: "destructive" });
      navigate('/checkout');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        amount: finalTotal,
        name: customerInfo.name,
        email: customerInfo.email,
        description: `Pedido-${Date.now().toString(36).toUpperCase()} - ${customerInfo.name} - ${customerInfo.email} - ${customerInfo.phone || ''}`,
      };

      // Adiciona opcionais apenas se existirem
      if (customerInfo.cpf) payload.cpf = customerInfo.cpf;
      if (customerInfo.phone) payload.phone = customerInfo.phone;

      console.log("🔵 [Payment] Iniciando criação do PIX. Payload:", payload);

      // Usando rota /personal (conforme sucesso no Python)
      // const response = await fetch(`${PROXY_URL}/personal`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-API-Key': API_KEY
      //   },
      //   body: JSON.stringify(payload)
      // });
      const response = await fetch(`${BACKEND_URL}/pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Não precisa mandar API KEY aqui se o server.js ler do process.env
          // Se precisar passar, adicione headers aqui
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔴 [Payment] Erro na resposta da API:", response.status, errorText);
        throw new Error(`Erro API: ${response.status}`);
      }

      const result = await response.json();
      console.log("🟢 [Payment] Resposta PIX Criado:", result);

      if (result.success && result.data) {
        const newPixData = {
          transactionId: result.data.transactionId,
          uuid: result.data.id,
          pixCode: result.data.pixCode,
          qrCodeImageUrl: result.data.qrCode,
          expiresAt: result.data.expiresAt,
          price: parseFloat(result.data.amount),
          status: result.data.status
        };
        setPixData(newPixData);
        console.log("✅ [Payment] Estado atualizado com PixData:", newPixData);
      } else {
        throw new Error('API retornou sucesso: false ou sem dados');
      }

    } catch (error) {
      console.error("🔴 [Payment] Erro fatal:", error);
      toast({
        title: "Erro ao gerar pagamento",
        description: "Não foi possível conectar ao servidor de pagamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger inicial
  useEffect(() => {
    if (items.length > 0 && !pixData) {
      createPixCharge();
    }
  }, [items.length]); // Dependências reduzidas para evitar loops

  // --- FINALIZAÇÃO DO PEDIDO ---
  const handlePaymentConfirmed = useCallback(() => {
    console.log("🎉 [Payment] Pagamento Confirmado! Finalizando pedido...");
    
    // Para o polling imediatamente
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingActive.current = false;

    // --- MARCAÇÃO DO CLIENTE ---
    // Assim que isso for salvo, o RedirectHandler vai capturar na próxima renderização/navegação
    localStorage.setItem('@SmashFast:purchase-complete', 'true');

    // --- Dispara evento de Compra ---
    pixel.purchase({
      value: finalTotal,
      currency: 'BRL',
      content_ids: items.map(item => item.id),
      content_type: 'product'
    });
    
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const estimatedMinutes = deliveryType === 'delivery' ? 45 : 20; // Ajuste de estimativa
    
    // Cria data de entrega estimada real
    const estimatedDate = new Date();
    estimatedDate.setMinutes(estimatedDate.getMinutes() + estimatedMinutes);

    const newOrder: Order = {
      id: orderId,
      items: [...items],
      total: finalTotal,
      status: 'confirmed', // Começa como confirmado
      createdAt: new Date(),
      deliveryType,
      address: deliveryAddress ? `${deliveryAddress.street}, ${deliveryAddress.number}` : undefined,
      customerInfo: customerInfo || undefined,
      paymentStatus: 'paid',
      estimatedDelivery: estimatedDate,
      pixData: pixData!,
    };

    addOrder(newOrder);
    setCurrentOrder(newOrder);
    clearCart();

    toast({
      title: 'Pagamento confirmado! 🎉',
      description: 'Seu pedido foi enviado para a cozinha.',
    });

    navigate('/tracking');
  }, [items, finalTotal, deliveryType, deliveryAddress, customerInfo, pixData, addOrder, setCurrentOrder, clearCart, toast, navigate]);

  // --- POLLING DE STATUS ---
  useEffect(() => {
    // Só inicia se tivermos um transactionId e o polling não estiver ativo
    if (!pixData?.transactionId || isPollingActive.current) return;

    console.log("⏳ [Payment] Iniciando verificação de status para ID:", pixData.transactionId);
    isPollingActive.current = true;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/status/${pixData.transactionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`📡 [Payment] Status Check [${pixData.transactionId}]:`, result.status);
          
          if (result.success && (result.status === 'COMPLETED')) {
            handlePaymentConfirmed();
          }
        }
      } catch (error) {
        console.error("⚠️ [Payment] Erro no polling:", error);
      }
    };

    // Primeira verificação rápida
    // checkStatus();

    // Intervalo de 5 segundos
    pollingRef.current = setInterval(checkStatus, 10000);

    return () => {
      console.log("🛑 [Payment] Limpando polling...");
      if (pollingRef.current) clearInterval(pollingRef.current);
      isPollingActive.current = false;
    };
  }, [pixData, handlePaymentConfirmed]);

  // Handle Expired
  const handleExpired = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    toast({ title: 'Expirou', description: 'Gere um novo pagamento', variant: 'destructive' });
    navigate('/checkout');
  }, [toast, navigate]);

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
        <div className="container flex items-center h-16 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold text-lg">Pagamento</h1>
        </div>
      </header>

      <div className="container py-6 max-w-md mx-auto">
        {loading || !pixData ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Gerando PIX...</p>
          </div>
        ) : (
          <PixPayment
            paymentData={{
              qrCode: pixData.pixCode, 
              qrCodeImageUrl: pixData.qrCodeImageUrl,
              expiresAt: pixData.expiresAt,
              price: pixData.price
            }}
            onPaymentConfirmed={handlePaymentConfirmed}
            onExpired={handleExpired}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;