import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const addressSchema = z.object({
  street: z.string().min(3, 'Informe a rua'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Informe o bairro'),
  city: z.string().min(2, 'Informe a cidade'),
  zipCode: z.string().min(8, 'CEP inválido').max(9),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: () => void;
}

export function AddressForm({ onSubmit }: AddressFormProps) {
  const { setDeliveryAddress } = useCart();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = (data: AddressFormData) => {
    setDeliveryAddress({
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      zipCode: data.zipCode,
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <MapPin className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="font-heading font-semibold">Endereço de Entrega</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            placeholder="Nome da rua"
            {...register('street')}
            className={errors.street ? 'border-destructive' : ''}
          />
          {errors.street && (
            <p className="text-xs text-destructive">{errors.street.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            placeholder="Nº"
            {...register('number')}
            className={errors.number ? 'border-destructive' : ''}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="complement">Complemento (opcional)</Label>
        <Input
          id="complement"
          placeholder="Apto, bloco, referência..."
          {...register('complement')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            placeholder="Bairro"
            {...register('neighborhood')}
            className={errors.neighborhood ? 'border-destructive' : ''}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="zipCode">CEP</Label>
          <Input
            id="zipCode"
            placeholder="00000-000"
            {...register('zipCode')}
            className={errors.zipCode ? 'border-destructive' : ''}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="city">Cidade</Label>
        <Input
          id="city"
          placeholder="Cidade"
          {...register('city')}
          className={errors.city ? 'border-destructive' : ''}
        />
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
