import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

const vehicleSchema = z.object({
  model: z.string().min(2, 'Informe o modelo do veículo'),
  color: z.string().min(2, 'Informe a cor'),
  plate: z.string().min(7, 'Placa inválida').max(8),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  onSubmit: () => void;
}

export function VehicleForm({ onSubmit }: VehicleFormProps) {
  const { setVehicleInfo } = useCart();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = (data: VehicleFormData) => {
    setVehicleInfo({
      model: data.model,
      color: data.color,
      plate: data.plate,
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Car className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="font-heading font-semibold">Dados do Veículo</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Informe os dados do seu veículo para facilitar a identificação no drive-thru.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="model">Modelo do Veículo</Label>
        <Input
          id="model"
          placeholder="Ex: Honda Civic, VW Gol..."
          {...register('model')}
          className={errors.model ? 'border-destructive' : ''}
        />
        {errors.model && (
          <p className="text-xs text-destructive">{errors.model.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            placeholder="Prata, Preto..."
            {...register('color')}
            className={errors.color ? 'border-destructive' : ''}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="plate">Placa</Label>
          <Input
            id="plate"
            placeholder="ABC-1234"
            {...register('plate')}
            className={errors.plate ? 'border-destructive' : ''}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full gradient-primary border-0 shadow-food mt-4"
        disabled={!isValid}
      >
        Continuar para Pagamento
      </Button>
    </form>
  );
}
