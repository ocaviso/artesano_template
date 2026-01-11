import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { stores, Store } from '@/data/stores';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

// Correção para ícones padrão do Leaflet no Vite/React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente auxiliar para centralizar o mapa
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

export function StoreMap() {
  const { selectedStore, setSelectedStore } = useCart();
  
  // Centro inicial (Pega da primeira loja ou SP)
  const defaultCenter: [number, number] = stores.length > 0 
    ? [stores[0].lat, stores[0].lng] 
    : [-23.550520, -46.633308];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-secondary-foreground" />
        </div>
        <h3 className="font-heading font-semibold">Selecione a Loja</h3>
      </div>

      <div className="h-[300px] w-full rounded-xl overflow-hidden border shadow-inner relative z-0">
        <MapContainer 
            center={defaultCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Se tiver loja selecionada, centraliza nela */}
            {selectedStore && <ChangeView center={[selectedStore.lat, selectedStore.lng]} />}

            {stores.map((store) => (
            <Marker 
                key={store.id} 
                position={[store.lat, store.lng]}
                eventHandlers={{
                click: () => {
                    setSelectedStore(store);
                },
                }}
            >
                <Popup>
                <div className="text-center">
                    <h4 className="font-bold">{store.name}</h4>
                    <p className="text-xs mb-2">{store.address}</p>
                    <Button 
                    size="sm" 
                    className="w-full h-8"
                    onClick={() => setSelectedStore(store)}
                    disabled={selectedStore?.id === store.id}
                    >
                    {selectedStore?.id === store.id ? 'Selecionada' : 'Selecionar'}
                    </Button>
                </div>
                </Popup>
            </Marker>
            ))}
        </MapContainer>
      </div>

      {selectedStore && (
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-sm font-semibold text-primary">Loja Selecionada:</p>
                <p className="font-medium">{selectedStore.name}</p>
                <p className="text-xs text-muted-foreground">{selectedStore.address}</p>
            </div>
        </div>
      )}
    </div>
  );
}